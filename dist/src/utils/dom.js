// import { isObject } from './types.js' // see printToPage

// export function setCssStyle(url) {
//     document.head.innerHTML += `<link rel="stylesheet" href="${url}" type="text/css" />`
// }
export async function setCssStyle(url) {
    const response = await fetch(url)
    if (!response.ok) throw Error(`Not found: ${url}`)
    const css = await response.text()
    document.head.innerHTML += `<style>${css}</style>`
}

// REST:
// Parse the query, returning an object of key / val pairs.
export function getQueryString() {
    return window.location.search.substr(1)
}
export function parseQueryString(
    // paramsString = window.location.search.substr(1)
    paramsString = getQueryString()
) {
    const results = {}
    const searchParams = new URLSearchParams(paramsString)
    for (var pair of searchParams.entries()) {
        let [key, val] = pair
        if (val.match(/^[0-9.]+$/) || val.match(/^[0-9.]+e[0-9]+$/))
            val = Number(val)
        if (['true', 't', ''].includes(val)) val = true
        if (['false', 'f'].includes(val)) val = false

        results[key] = val
    }
    return results
}
// Merge the querystring into the default parameters
export function RESTapi(parameters) {
    return Object.assign(parameters, parseQueryString())
}

export function inWorker() {
    return !inNode() && typeof self.window === 'undefined'
}

export function inNode() {
    return typeof global !== 'undefined'
}

export function inDeno() {
    return !!Deno
}

// Print a message to an html element
// Default to document.body if in browser.
// If msg is an object, convert to JSON
// (object canot have cycles etc)
// If element is string, find element by ID
export function printToPage(msg, element = document.body) {
    // if (isObject(msg)) {
    if (typeof msg === 'object') {
        msg = JSON.stringify(msg, null, 2)
        // msg = '<pre>' + msg + '</pre>'
    }
    msg = '<pre>' + msg + '</pre>'

    if (typeof element === 'string') {
        element = document.getElementById(element)
    }

    element.style.fontFamily = 'monospace'
    element.innerHTML += msg //+ '<br />'
}

// Get element (i.e. canvas) relative x,y position from event/mouse position.
export function getEventXY(element, evt) {
    // http://goo.gl/356S91
    const rect = element.getBoundingClientRect()
    return [evt.clientX - rect.left, evt.clientY - rect.top]
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
    worker.onerror = function (e) {
        console.log('Worker ERROR: Line ', e.lineno, ': ', e.message)
    }
    return worker
}

// export function workerScript(script, worker) {
//     const srcBlob = new Blob([script], { type: 'text/javascript' })
//     const srcURL = URL.createObjectURL(srcBlob)
//     worker.postMessage({ cmd: 'script', url: srcURL })
// }

// Create dynamic `<script>` tag, appending to `<head>`
//   <script src="./test/src/three0.js" type="module"></script>
// NOTE: Use import(path) for es6 modules.
// I.e. this is legacy, for umd's only.
// export function loadScript(path, props = {}) {
//     const scriptTag = document.createElement('script')
//     scriptTag.src = path
//     Object.assign(scriptTag, props)
//     document.querySelector('head').appendChild(scriptTag)
// }
// export function loadScript(path, props = {}) {
//     return new Promise((resolve, reject) => {
//         const scriptTag = document.createElement('script')
//         scriptTag.onload = () => resolve(scriptTag)
//         scriptTag.src = path
//         Object.assign(scriptTag, props)
//         document.querySelector('head').appendChild(scriptTag)
//     })
// }
