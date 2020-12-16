import { inWorker } from './dom.js'

function offscreenOK() {
    // return !!self.OffscreenCanvas
    // return typeof OffscreenCanvas !== 'undefined'
    return inWorker()
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
export function setTextProperties(
    ctx,
    font,
    textAlign = 'center',
    textBaseline = 'middle'
) {
    Object.assign(ctx, { font, textAlign, textBaseline })
}

// Draw string of the given color at the xy location, in ctx pixel coords.
// Use setIdentity .. reset if a transform is being used by caller.
export function drawText(ctx, string, x, y, color, useIdentity = true) {
    if (useIdentity) setIdentity(ctx)
    ctx.fillStyle = color.css || color // OK to use Color.typedColor
    ctx.fillText(string, x, y)
    if (useIdentity) ctx.restore()
}

// # Draw string of the given color at the xy location, in ctx pixel coords.
// # Use setIdentity .. reset if a transform is being used by caller.
// ctxDrawText: (ctx, string, x, y, color, setIdentity = true) ->
//   @setIdentity(ctx) if setIdentity
//   ctx.fillStyle = color.css # @colorStr color
//   ctx.fillText(string, x, y)
//   ctx.restore() if setIdentity

// Return the (complete) ImageData object for this context object
export function ctxImageData(ctx) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
}
// Clear this context using the cssColor.
// If no color or if color === 'transparent', clear to transparent.
export function clearCtx(ctx, cssColor) {
    const { width, height } = ctx.canvas

    setIdentity(ctx)
    if (!cssColor || cssColor === 'transparent') {
        ctx.clearRect(0, 0, width, height)
    } else {
        ctx.fillStyle = cssColor
        ctx.fillRect(0, 0, width, height)
    }
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
