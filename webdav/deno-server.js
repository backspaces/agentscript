const kv = await Deno.openKv()

function logRequest(method, path, extra = '') {
    const now = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Denver', // or 'UTC'
    })
    console.log(`[${now}] ${method} ${path} ${extra}`.trim())
}

Deno.serve(async req => {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // const baseHeaders = {
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods':
    //         'OPTIONS, GET, PUT, PROPFIND, MKCOL, COPY, MOVE, DELETE, RESET',
    //     'Access-Control-Allow-Headers':
    //         'Content-Type, Depth, Destination, Overwrite',
    // }
    const baseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
            'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, COPY, MOVE',
        'Access-Control-Allow-Headers':
            'Content-Type, Depth, Destination, Overwrite',
        Allow: 'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, COPY, MOVE',
        DAV: '1, 2', // Advertises WebDAV levels
    }

    if (method === 'OPTIONS') {
        logRequest(method, path, '→ Preflight')
        const headers = new Headers(baseHeaders)
        headers.set(
            'Allow',
            'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY'
        )
        headers.set('DAV', '1, 2')
        headers.set(
            'Access-Control-Expose-Headers',
            'Allow, DAV, Content-Length'
        )
        return new Response(null, { status: 200, headers })
    }

    if (method === 'PUT') {
        const body = new Uint8Array(await req.arrayBuffer())
        const existing = await kv.get(['file', path])
        if (existing.value?.isDir) {
            logRequest(method, path, '→ Conflict (cannot overwrite directory)')
            return new Response('Conflict', {
                status: 409,
                headers: new Headers(baseHeaders),
            })
        }

        await kv.set(['file', path], { body, isDir: false })
        logRequest(method, path, `→ Stored ${body.length} bytes`)
        return new Response('Created', {
            status: 201,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'GET') {
        const result = await kv.get(['file', path])
        if (!result.value || result.value.isDir) {
            logRequest(method, path, '→ Not Found')
            return new Response('Not Found', {
                status: 404,
                headers: new Headers(baseHeaders),
            })
        }
        logRequest(method, path, `→ Returned ${result.value.body.length} bytes`)
        return new Response(result.value.body, {
            status: 200,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'MKCOL') {
        const result = await kv.get(['file', path])
        if (result.value) {
            if (!result.value.isDir) {
                logRequest(method, path, '→ Conflict (not a directory)')
            } else {
                logRequest(method, path, '→ Conflict (already exists)')
            }
            return new Response('Conflict', {
                status: 409,
                headers: new Headers(baseHeaders),
            })
        }

        const parentPath = path.endsWith('/') ? path.slice(0, -1) : path
        const parent =
            parentPath.substring(0, parentPath.lastIndexOf('/')) || '/'
        const parentResult = await kv.get(['file', parent])

        if (!parentResult.value || !parentResult.value.isDir) {
            logRequest(method, path, `→ Conflict (missing parent ${parent})`)
            return new Response('Conflict', {
                status: 409,
                headers: new Headers(baseHeaders),
            })
        }

        await kv.set(['file', path], { isDir: true })
        logRequest(method, path, '→ Directory created')
        return new Response('Collection created', {
            status: 201,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'PROPFIND') {
        const depth = req.headers.get('Depth') || '1'
        const list = kv.list({ prefix: ['file'] })
        let xmlBody = ''
        let count = 0

        for await (const entry of list) {
            const keyPath = entry.key[1]
            const value = entry.value

            const pathWithSlash = path.endsWith('/') ? path : path + '/'
            const remainder = keyPath.startsWith(pathWithSlash)
                ? keyPath.slice(pathWithSlash.length)
                : ''

            const cleaned =
                value.isDir && remainder.endsWith('/')
                    ? remainder.slice(0, -1)
                    : remainder

            if (
                keyPath === path ||
                (depth === '1' &&
                    keyPath.startsWith(pathWithSlash) &&
                    !cleaned.includes('/'))
            ) {
                const contentLength = value.body?.length || 0
                const resourcetype = value.isDir ? '<D:collection/>' : ''

                xmlBody += `
<D:response>
  <D:href>${keyPath}</D:href>
  <D:propstat>
    <D:prop>
      <D:resourcetype>${resourcetype}</D:resourcetype>
      <D:getcontentlength>${contentLength}</D:getcontentlength>
    </D:prop>
    <D:status>HTTP/1.1 200 OK</D:status>
  </D:propstat>
</D:response>`
                count++
            }
        }

        const xml = `<?xml version="1.0"?><D:multistatus xmlns:D="DAV:">${xmlBody}\n</D:multistatus>`
        logRequest(method, path, `→ Returned ${count} items`)
        return new Response(xml, {
            status: 207,
            headers: new Headers({
                ...baseHeaders,
                'Content-Type': 'application/xml',
            }),
        })
    }

    if (method === 'DELETE') {
        const list = kv.list({ prefix: ['file'] })
        const toDelete = []
        for await (const entry of list) {
            const keyPath = entry.key[1]
            if (keyPath === path || keyPath.startsWith(path + '/')) {
                toDelete.push(entry.key)
            }
        }
        for (const key of toDelete) {
            await kv.delete(key)
        }
        logRequest(method, path, `→ Deleted ${toDelete.length} item(s)`)
        return new Response(null, {
            status: 204,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'COPY') {
        const dest = req.headers.get('Destination')
        if (!dest) {
            logRequest(method, path, '→ Missing Destination header')
            return new Response('Missing Destination', {
                status: 400,
                headers: new Headers(baseHeaders),
            })
        }

        const destPath = new URL(dest, req.url).pathname
        const result = await kv.get(['file', path])
        if (!result.value) {
            logRequest(method, path, '→ Not Found')
            return new Response('Not Found', {
                status: 404,
                headers: new Headers(baseHeaders),
            })
        }

        await kv.set(['file', destPath], result.value)
        logRequest(method, path, `→ Copied to ${destPath}`)
        return new Response('Copied', {
            status: 201,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'MOVE') {
        const dest = req.headers.get('Destination')
        if (!dest) {
            logRequest(method, path, '→ Missing Destination header')
            return new Response('Missing Destination', {
                status: 400,
                headers: new Headers(baseHeaders),
            })
        }

        const destPath = new URL(dest, req.url).pathname
        const result = await kv.get(['file', path])
        if (!result.value) {
            logRequest(method, path, '→ Not Found')
            return new Response('Not Found', {
                status: 404,
                headers: new Headers(baseHeaders),
            })
        }

        await kv.set(['file', destPath], result.value)
        await kv.delete(['file', path])
        logRequest(method, path, `→ Moved to ${destPath}`)
        return new Response('Moved', {
            status: 201,
            headers: new Headers(baseHeaders),
        })
    }

    if (method === 'RESET') {
        const list = kv.list({ prefix: ['file'] })
        let count = 0
        for await (const entry of list) {
            const keyPath = entry.key[1]
            if (keyPath !== '/') {
                await kv.delete(entry.key)
                count++
            }
        }
        await kv.set(['file', '/'], { isDir: true }) // re-create root
        logRequest(
            method,
            path,
            `→ Reset KV (${count} deleted, root recreated)`
        )
        return new Response('KV store reset', {
            status: 200,
            headers: new Headers(baseHeaders),
        })
    }

    logRequest(method, path, '→ Method Not Allowed')
    return new Response('Method Not Allowed', {
        status: 405,
        headers: new Headers(baseHeaders),
    })
})
