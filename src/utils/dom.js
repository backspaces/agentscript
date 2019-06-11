// ### HTML, CSS, DOM

// REST: Parse the query, returning an object of key/val pairs.
export function parseQueryString(
    paramsString = window.location.search.substr(1)
) {
    const results = {}
    const searchParams = new URLSearchParams(paramsString)
    for (var pair of searchParams.entries()) {
        let [key, val] = pair

        if (val.match(/^[0-9.]+$/)) val = Number(val)
        if (['true', 't', ''].includes(val)) val = true
        if (['false', 'f'].includes(val)) val = false

        results[key] = val
    }
    return results
}

// Create dynamic `<script>` tag, appending to `<head>`
//   <script src="./test/src/three0.js" type="module"></script>
// NOTE: Use import(path) for es6 modules.
// I.e. this is legacy, for umd's only.
export function setScript(path, props = {}) {
    const scriptTag = document.createElement('script')
    scriptTag.src = path
    Object.assign(scriptTag, props)
    document.querySelector('head').appendChild(scriptTag)
}

// Convert a function into a worker via blob url.
// Adds generic error handler. Scripts only, not modules.
export function fcnToWorker(fcn) {
    const href = document.location.href
    const root = href.replace(/\/[^\/]+$/, '/')
    const fcnStr = `(${fcn.toString(root)})("${root}")`
    const objUrl = URL.createObjectURL(
        new Blob([fcnStr], { type: 'text/javascript' })
    )
    const worker = new Worker(objUrl)
    worker.onerror = function(e) {
        console.log('ERROR: Line ', e.lineno, ': ', e.message)
    }
    return worker
}

export function workerScript(script, worker) {
    const srcBlob = new Blob([script], { type: 'text/javascript' })
    const srcURL = URL.createObjectURL(srcBlob)
    worker.postMessage({ cmd: 'script', url: srcURL })
}

// Get element (i.e. canvas) relative x,y position from event/mouse position.
export function getEventXY(element, evt) {
    // http://goo.gl/356S91
    const rect = element.getBoundingClientRect()
    return [evt.clientX - rect.left, evt.clientY - rect.top]
}
