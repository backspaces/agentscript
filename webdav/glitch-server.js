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
        timeZone: 'America/Denver', // Adjust if needed
    })
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`)
}

const dataPath = path.join(__dirname, '.data')
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
}

// const mountPath = process.env.MOUNT_PATH || '/webdav-server'
const mountPath = process.env.MOUNT_PATH || '/'

const server = new webdav.WebDAVServer({
    rootFileSystem: new webdav.PhysicalFileSystem(dataPath),
})

// WebDAV CORS headers
server.beforeRequest((arg, next) => {
    log(`🛠️ ${arg.request.method} received for ${arg.requested.uri}`)

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

server.afterRequest((arg, next) => {
    log(
        `📩 ${arg.request.method} ${arg.fullUri()} → ${arg.response.statusCode}`
    )
    next()
})

// ✅ Handle all other WebDAV preflight requests
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

// ✅ Mount WebDAV server
app.use(mountPath, webdav.extensions.express('/', server))

// Start server
log(`✅ Mount path: ${mountPath}`)
app.listen(port, () => {
    const domain = process.env.PROJECT_DOMAIN || 'localhost'
    log(`✅ WebDAV server running at ${domain} using port:${port}`)
    log(`✅ WebDAV server mounted at: ${mountPath}`)
})
