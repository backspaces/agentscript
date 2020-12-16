// ### Async

// Return Promise for getting an image.
// - use: imagePromise('./path/to/img').then(img => imageFcn(img))
export function imagePromise(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => resolve(img)
        // img.onerror = () => reject(Error(`Could not load image ${url}`))
        img.onerror = () => reject(`Could not load image ${url}`)
        img.src = url
    })
}
export async function imageBitmapPromise(url) {
    const blob = await xhrPromise(url, 'blob')
    return createImageBitmap(blob)
}

// Convert canvas.toBlob to a promise
export function canvasBlobPromise(can, mimeType = 'image/png', quality = 0.95) {
    return new Promise((resolve, reject) => {
        can.toBlob(blob => resolve(blob), mimeType, quality)
    })
}
// Return Promise for ajax/xhr data.
// - type: 'arraybuffer', 'blob', 'document', 'json', 'text'.
// - method: 'GET', 'POST'
// - use: xhrPromise('./path/to/data').then(data => dataFcn(data))
export function xhrPromise(url, type = 'text', method = 'GET') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(method, url) // POST mainly for security and large files
        xhr.responseType = type
        xhr.onload = () => resolve(xhr.response)
        xhr.onerror = () =>
            reject(Error(`Could not load ${url}: ${xhr.status}`))
        xhr.send()
    })
}

// Return promise for pause of ms. Use:
// timeoutPromise(2000).then(()=>console.log('foo'))
export function timeoutPromise(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
// Use above for an animation loop.
// steps < 0: forever (default), steps === 0 is no-op
// Returns a promise for when done. If forever, no need to use it.
export async function timeoutLoop(fcn, steps = -1, ms = 0) {
    let i = 0
    while (i++ !== steps) {
        // let state = fcn(i - 1)
        // if (state === 'cancel') break // 'done' too?
        fcn(i - 1)
        await timeoutPromise(ms)
    }
}

export function waitPromise(done, ms = 10) {
    return new Promise(resolve => {
        function waitOn() {
            if (done()) return resolve()
            else setTimeout(waitOn, ms)
        }
        waitOn()
    })
}

// type = "arrayBuffer" "blob" "formData" "json" "text"
export async function fetchType(url, type = 'text') {
    const response = await fetch(url)
    if (!response.ok) throw Error(`Not found: ${url}`)
    const value = await response[type]()
    return value
}

// // Similar pair for requestAnimationFrame
// export function rafPromise() {
//     return new Promise(resolve => requestAnimationFrame(resolve))
// }
// export async function rafLoop(fcn, steps = -1) {
//     let i = 0
//     while (i++ !== steps) {
//         fcn(i - 1)
//         await rafPromise()
//     }
// }
//
