import * as util from './utils.js'

// /** @namespace */
/** @module */

/**
 * @param {Image|Imageable} img img: image, canvas, context2d, url, data url
 * @returns A Canvas.context object
 */
async function toContext(img) {
    const type = util.typeOf(img)
    switch (type) {
        // image url or html element
        case 'string': // Note: drop thru to image
            img = await util.imagePromise(img)
        case 'htmlimageelement':
            return util.imageToCtx(img)

        // canvas
        case 'htmlcanvaselement':
        case 'offscreencanvas':
            return img.getContext('2d')

        // image 2D context
        case 'canvasrenderingcontext2d':
            return img

        default:
            throw Error('toContext: bad img type: ' + type)
    }
}
// msg can be string or Uint8Array

/**
 * @param {*} msg A string, charCode (number), Uint8Array or Uint8ClampedArray
 * @returns A Uint8Array or Uint8ClampedArray
 */
function toUint8Array(msg) {
    const type = util.typeOf(msg)
    switch (type) {
        case 'number':
            msg = String.fromCharCode(msg) // drop thru to 'string'
        case 'string':
            return new TextEncoder().encode(msg)

        case 'uint8array':
        case 'uint8clampedarray':
            return msg

        default:
            throw Error('toUint8Array: bad msg type: ' + type)
    }
}
// Convert a char to an array of three RGB low order pixel values
/**
 *
 * @param {} char An 8 bit char
 * @returns Array of 3 parts of char using the bits tempate (3, 2, 3 bits)
 */
function charToBits(char) {
    // return [char >> 5, char >> 3 & 0b11111100, char & 0b11111000]
    return [
        char >> bits[0].shift,
        (char >> bits[1].shift) & bits[1].msgMask,
        char & bits[2].msgMask,
    ]
}
const bits = [
    { shift: 5, msgMask: 0b00000111, dataMask: 0b11111000 }, // bits: 3
    { shift: 3, msgMask: 0b00000011, dataMask: 0b11111100 }, // bits: 2
    { shift: 0, msgMask: 0b00000111, dataMask: 0b11111000 }, // bits: 3
]
function checkSize(msg, width, height) {
    const imgSize = width * height // 1 px = 1 byte
    if (imgSize < msg.length)
        throw Error(`encode: image size < msg.length: ${imgSize} ${msg.length}`)
}
// Return the character length of the message within the image's imgData
export function stegMsgSize(imgData) {
    for (let i = 3; i < imgData.length; i = i + 4) {
        if (imgData[i] === 254) return (i - 3) / 4
    }
    throw Error(
        `decode: no message terminator in image data, length = ${imgData.length}`
    )
}

// ============== encode/decode ==============

// img can be png/jpeg image, url, dataurl, context2d, canvas
// msg is a string or a Uint8 array
export async function encode(img, msg) {
    const ctx = await toContext(img)
    const { width, height } = ctx.canvas
    checkSize(msg, width, height)

    const msgArray = toUint8Array(msg)
    console.log('msg buffer', msgArray)

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    console.log('imgageData.data', data)

    let ix
    msgArray.forEach((char, i) => {
        const [ch0, ch1, ch2] = charToBits(char)
        ix = i * 4
        data[ix] = (data[ix++] & bits[0].dataMask) + ch0
        data[ix] = (data[ix++] & bits[1].dataMask) + ch1
        data[ix] = (data[ix++] & bits[2].dataMask) + ch2
        data[ix] = 255
    })
    data[ix + 4] = 254 // use alpha to terminate message

    console.log('encoded imgageData.data', data)
    ctx.putImageData(imageData, 0, 0)

    console.log('msg length', msg.length)
    console.log('encode: embedded msg size', stegMsgSize(data))

    return ctx
}

// img can be png/jpeg image, url, dataurl, context2d, canvas
// returnU8: return a UintTypedArray; default return string
export async function decode(img, returnU8 = false) {
    const ctx = await toContext(img)
    const { width, height } = ctx.canvas
    const data = ctx.getImageData(0, 0, width, height).data
    const msgSize = stegMsgSize(data)
    console.log('decode: embedded msg size', msgSize)

    const msgArray = new Uint8Array(msgSize)
    msgArray.forEach((char, i) => {
        let ix = i * 4
        const ch0 = (bits[0].msgMask & data[ix++]) << bits[0].shift
        const ch1 = (bits[1].msgMask & data[ix++]) << bits[1].shift
        const ch2 = (bits[2].msgMask & data[ix++]) << bits[2].shift
        msgArray[i] = ch0 + ch1 + ch2
    })
    console.log('decode msgArray', msgArray)

    if (returnU8) return msgArray
    return new TextDecoder().decode(msgArray)
}
