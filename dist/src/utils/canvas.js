// import { inWorker } from './dom.js'

function offscreenOK() {
    return !!self.OffscreenCanvas
}

// Create a blank 2D canvas of a given width/height
// width/height defaulted so can be modified later by caller
// Default to off-screen canvas.
// export function createCanvas(width = 0, height = 0, offscreen = true) {
export function createCanvas(width, height, offscreen = offscreenOK()) {
    if (offscreen) return new OffscreenCanvas(width, height)
    const can = document.createElement('canvas')
    can.width = width
    can.height = height
    return can
}
// As above, but returing the 2D context object.
// NOTE: ctx.canvas is the canvas for the ctx, and can be use as an image.
export function createCtx(width, height, offscreen = offscreenOK()) {
    const can = createCanvas(width, height, offscreen)
    return can.getContext('2d')
}

// Duplicate a canvas, preserving it's current image/drawing
export function cloneCanvas(can, offscreen = offscreenOK()) {
    const ctx = createCtx(can.width, can.height, offscreen)
    ctx.drawImage(can, 0, 0)
    return ctx.canvas
}
// Resize a ctx/canvas and preserve data.
export function resizeCtx(ctx, width, height) {
    const copy = cloneCanvas(ctx.canvas)
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.drawImage(copy, 0, 0)
}

// Set the ctx/canvas size if differs from width/height.
// It does not install a transform and assumes there is not one currently installed.
// The World object can do that for AgentSets.
export function setCanvasSize(can, width, height) {
    if (can.width !== width || can.height != height) {
        can.width = width
        can.height = height
    }
}

// Install identity transform for this context.
// Call ctx.restore() to revert to previous transform.
export function setIdentity(ctx) {
    ctx.save() // NOTE: Does not change state, only saves current state.
    ctx.setTransform(1, 0, 0, 1, 0, 0) // or ctx.resetTransform()
}
// Set the text font, align and baseline drawing parameters.
// Ctx can be either a canvas context or a DOM element
// See [reference](http://goo.gl/AvEAq) for details.
// * font is a HTML/CSS string like: "9px sans-serif"
// * align is left right center start end
// * baseline is top hanging middle alphabetic ideographic bottom
export function setTextParams(
    ctx,
    font,
    textAlign = 'center',
    textBaseline = 'middle'
) {
    // ctx.font = font; ctx.textAlign = align; ctx.textBaseline = baseline
    Object.assign(ctx, { font, textAlign, textBaseline })
}

// Return the (complete) ImageData object for this context object
export function ctxImageData(ctx) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
}
// Fill this context with the given css color string.
export function clearCtx(ctx) {
    setIdentity(ctx)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
}
// Fill this context with the given css color string.
export function fillCtx(ctx, cssColor) {
    setIdentity(ctx)
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
}
// These image functions use "imagable" objects: Image, ImageBitmap, Canvas ...
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource

// Fill this context with the given image. Will scale image to fit ctx size.
export function fillCtxWithImage(ctx, img) {
    setIdentity(ctx) // set/restore identity
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
}
// Fill this context with the given image, resizing it to img size if needed.
export function setCtxImage(ctx, img) {
    setCanvasSize(ctx.canvas, img.width, img.height)
    fillCtxWithImage(ctx, img)
}

// Use webgl texture to convert img to Uint8Array w/o alpha premultiply
// or color profile modification.
// Img can be Image, ImageData, Canvas: [See MDN](https://goo.gl/a3oyRA).
// `flipY` is used to invert image to upright.
// REMIND: use webgl12 if it works .. allows all imagables, not just Image.
const imageToBytesCtx = null
export function imageToBytes(img, flipY = false, imgFormat = 'RGBA') {
    // Create the gl context using the image width and height
    if (!imageToBytesCtx) {
        const can = createCanvas(0, 0)
        imageToBytesCtx = can.getContext('webgl', {
            premultipliedAlpha: false,
        })
    }

    const { width, height } = img
    const gl = imageToBytesCtx
    Object.assign(gl.canvas, { width, height })
    const fmt = gl[imgFormat]

    // Create and initialize the texture.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (flipY) {
        // Mainly used for pictures rather than data
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    }
    // Insure [no color profile applied](https://goo.gl/BzBVJ9):
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    // Insure no [alpha premultiply](http://goo.gl/mejNCK).
    // False is the default, but lets make sure!
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

    // Create the framebuffer used for the texture
    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    )

    // See if it all worked. Apparently not async.
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw Error(`imageToBytes: status not FRAMEBUFFER_COMPLETE: ${status}`)
    }

    // If all OK, create the pixels buffer and read data.
    const pixSize = imgFormat === 'RGB' ? 3 : 4
    const pixels = new Uint8Array(pixSize * width * height)
    // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    gl.readPixels(0, 0, width, height, fmt, gl.UNSIGNED_BYTE, pixels)

    // Unbind the framebuffer and return pixels
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return pixels
}
