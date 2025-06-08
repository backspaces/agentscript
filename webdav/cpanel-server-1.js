const { v2: webdav } = require('webdav-server')
const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 3000

const logPath = path.join(__dirname, 'log.txt')
function log(msg) {
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Denver',
    })
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`)
}

const dataPath = path.join(__dirname, '.data')
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
}

const mountPath = process.env.MOUNT_PATH || '/'

const server = new webdav.WebDAVServer({
    rootFileSystem: new webdav.PhysicalFileSystem(dataPath),
})

// 🔁 Shared MOVE / COPY logic
function handleMoveOrCopy(arg, method, fileOp, successCode) {
    const dest = arg.headers.find('destination')
    if (!dest) {
        arg.setCode(400)
        arg.exit()
        log(`❌ ${method} missing Destination header`)
        return
    }

    const srcUri = decodeURIComponent(arg.requested.uri)
    const destPath = decodeURIComponent(
        new URL(dest).pathname.replace(mountPath, '')
    )

    const srcPath = path.join(dataPath, srcUri)
    const dstPath = path.join(dataPath, destPath)

    log(`🔍 ${method} intercepted: ${srcPath} → ${dstPath}`)

    try {
        fileOp(srcPath, dstPath)
        arg.setCode(successCode)
        log(`✅ ${method} completed`)
    } catch (err) {
        arg.setCode(500)
        log(`❌ ${method} error: ${err.message}`)
    }
    arg.exit()
}

// 🌐 CORS + MOVE/COPY handler
server.beforeRequest((arg, next) => {
    if (arg.request.method === 'MOVE') {
        handleMoveOrCopy(arg, 'MOVE', fs.renameSync, 204)
        return
    }

    if (arg.request.method === 'COPY') {
        handleMoveOrCopy(arg, 'COPY', fs.copyFileSync, 201)
        return
    }

    arg.response.setHeader('Access-Control-Allow-Origin', '*')
    arg.response.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, PUT, DELETE, PROPFIND, MKCOL, MOVE, COPY'
    )
    arg.response.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Depth, Destination, Overwrite, Lock-Token, If'
    )

    if (arg.request.method === 'OPTIONS') {
        arg.setCode(200)
        arg.exit()
    }

    next()
})

// 📄 Log all responses
server.afterRequest((arg, next) => {
    log(
        `📩 ${arg.request.method} ${arg.fullUri()} → ${arg.response.statusCode}`
    )
    next()
})

// ✅ OPTIONS fallback for non-WebDAV routes
app.options(`${mountPath}*`, (req, res) => {
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
    log(`❓ OPTIONS received for ${req.originalUrl}`)
    res.status(200).end()
})

// 🌍 Mount WebDAV
app.use(mountPath, webdav.extensions.express('/', server))

// 🚀 Start server
log(`✅ Mount path: ${mountPath}`)
app.listen(port, () => {
    const domain = process.env.PROJECT_DOMAIN || 'localhost'
    log(`✅ WebDAV server running at ${domain} using port:${port}`)
    log(`✅ WebDAV server mounted at: ${mountPath}`)
})

// 🔥 Fallback error logger
server.on('error', (arg, err) => {
    log(
        `🔥 WebDAV Server Error: ${arg.request.method} ${arg.fullUri()} → ${
            err.message
        }`
    )
})
