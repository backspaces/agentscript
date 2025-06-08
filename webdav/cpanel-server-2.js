const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const mountPath = process.env.MOUNT_PATH || '/'
const dataPath = path.join(__dirname, '.data')
const logFile = path.join(__dirname, 'log.txt')

// Ensure .data/ exists
fs.mkdirSync(dataPath, { recursive: true })

// Logging
function log(msg) {
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Denver',
    })
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`)
}

// Utility: get file path relative to dataPath
function getFilePath(reqPath) {
    return path.join(
        dataPath,
        reqPath.startsWith(mountPath)
            ? reqPath.slice(mountPath.length)
            : reqPath
    )
}

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Depth, Destination, Overwrite, Lock-Token, If'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY'
    )
    next()
})

// OPTIONS, preflight. Quit when done.
app.options('/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Expose-Headers', 'Allow, DAV, Content-Length')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY'
    )
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Depth, Destination, Overwrite, Lock-Token, If'
    )
    res.setHeader(
        'Allow',
        'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY'
    )
    res.setHeader('DAV', '1, 2')
    log(`❓ OPTIONS received → ${req.originalUrl}`)
    res.status(200).end()
})

// Logging; avoids preflight here. place before app.options to log preflights too.
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`)
    next()
})

// Body parser; tells Express to collect the raw request body into req.body
// Automatically calls next(). express.json(), .. are similar.
app.use(express.raw({ type: '*/*' }))

// GET
app.get('/*', (req, res) => {
    const filePath = getFilePath(req.path)
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.status(404)
                .setHeader('Content-Type', 'text/plain')
                .send('Not found')
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.status(200).send(data)
        }
    })
})

// PUT
app.put('/*', (req, res) => {
    const filePath = getFilePath(req.path)
    fs.mkdir(path.dirname(filePath), { recursive: true }, err => {
        if (err) return res.status(500).send('Failed to create directory')
        fs.writeFile(filePath, req.body, err => {
            if (err) return res.status(500).send('Failed to write file')
            res.setHeader('Content-Type', 'text/plain')
            res.status(201).send('✅ File created')
        })
    })
})

// DELETE
app.delete('/*', (req, res) => {
    const filePath = getFilePath(req.path)
    fs.rm(filePath, { recursive: true, force: true }, err => {
        if (err) return res.status(404).send('Not found')
        res.status(204).end()
    })
})

// PROPFIND
app.use((req, res, next) => {
    if (req.method !== 'PROPFIND') return next()

    const dirPath = getFilePath(req.path)
    const depth = req.headers['depth'] || 'infinity'
    const responses = []

    const mountPath = process.env.MOUNT_PATH || '/'
    const relativePath = req.path.startsWith(mountPath)
        ? '/' + req.path.slice(mountPath.length).replace(/^\/+/, '')
        : req.path

    try {
        const stat = fs.statSync(dirPath)
        const isDir = stat.isDirectory()
        const size = isDir ? 0 : stat.size

        // ✅ Include current path (e.g. '/')
        responses.push(`
        <D:response>
          <D:href>${relativePath}</D:href>
          <D:propstat>
            <D:prop>
              <D:resourcetype>${isDir ? '<D:collection/>' : ''}</D:resourcetype>
              <D:getcontentlength>${size}</D:getcontentlength>
            </D:prop>
            <D:status>HTTP/1.1 200 OK</D:status>
          </D:propstat>
        </D:response>
      `)

        // ✅ Include children if depth is 1 and current is directory
        if (isDir && depth === '1') {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true })

            for (const entry of entries) {
                const name = entry.name
                const fullPath = path.join(dirPath, name)
                const childStat = fs.statSync(fullPath)

                const childHref = `${relativePath.replace(/\/+$/, '')}/${name}`

                responses.push(`
            <D:response>
              <D:href>${childHref}</D:href>
              <D:propstat>
                <D:prop>
                  <D:resourcetype>${
                      entry.isDirectory() ? '<D:collection/>' : ''
                  }</D:resourcetype>
                  <D:getcontentlength>${
                      entry.isDirectory() ? 0 : childStat.size
                  }</D:getcontentlength>
                </D:prop>
                <D:status>HTTP/1.1 200 OK</D:status>
              </D:propstat>
            </D:response>
          `)
            }
        }

        const xml = `<?xml version="1.0" encoding="utf-8" ?>
        <D:multistatus xmlns:D="DAV:">
          ${responses.join('\n')}
        </D:multistatus>`

        res.status(207).setHeader('Content-Type', 'application/xml').send(xml)
    } catch (err) {
        res.status(404).send('Not found')
    }
})

// MKCOL
app.all('/*', (req, res, next) => {
    if (req.method !== 'MKCOL') return next()
    const dirPath = getFilePath(req.path)
    fs.mkdir(dirPath, { recursive: true }, err => {
        if (err) return res.status(500).send('Failed to create collection')
        res.status(201).send('✅ Collection created')
    })
})

// MOVE
app.all('/*', (req, res, next) => {
    if (req.method !== 'MOVE') return next()
    const dest = req.headers['destination']
    if (!dest) return res.status(400).send('Missing Destination header')

    const srcPath = getFilePath(req.path)
    const destPath = getFilePath(
        new URL(dest, `http://${req.headers.host}`).pathname
    )

    fs.rename(srcPath, destPath, err => {
        if (err) return res.status(500).send('MOVE failed')
        res.status(204).end()
    })
})

// COPY
app.all('/*', (req, res, next) => {
    if (req.method !== 'COPY') return next()
    const dest = req.headers['destination']
    if (!dest) return res.status(400).send('Missing Destination header')

    const srcPath = getFilePath(req.path)
    const destPath = getFilePath(
        new URL(dest, `http://${req.headers.host}`).pathname
    )

    function copyRecursive(src, dst) {
        fs.stat(src, (err, stats) => {
            if (err) return res.status(500).send('COPY stat failed')

            if (stats.isDirectory()) {
                fs.mkdir(dst, { recursive: true }, err => {
                    if (err) return res.status(500).send('COPY mkdir failed')
                    fs.readdir(src, (err, files) => {
                        if (err) return res.status(500).send('COPY read failed')
                        files.forEach(file => {
                            copyRecursive(
                                path.join(src, file),
                                path.join(dst, file)
                            )
                        })
                    })
                })
            } else {
                fs.copyFile(src, dst, err => {
                    if (err) return res.status(500).send('COPY file failed')
                })
            }
        })
    }

    copyRecursive(srcPath, destPath)
    res.status(201).send('✅ Copy completed')
})

// Not captured above
app.use((req, res) => {
    res.status(404).send('Not found')
})

// Start
app.listen(port, () => {
    log(`✅ webdav-two running on port ${port}, mount path ${mountPath}`)
})
