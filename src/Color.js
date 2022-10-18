import * as util from './utils.js'

// /** @module  */

/**
 *
 * A general color module, supporting css string colors, canvas2d pixel
 * colors, webgl and canvas2d Uint8ClampedArray r,g,b,a arrays.
 *
 * #### CSS Color Strings.
 *
 * CSS colors in HTML are strings, see [Mozillas Color Reference](
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value),
 * taking one of 7 forms:
 *
 * - Names: over 140 color case-insensitive names like
 *   Red, Green, CadetBlue, etc.
 * - Hex, short and long form: #0f0, #ff10a0
 * - RGB: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
 * - HSL: hsl(120, 100%, 50%), hsla(120, 100%, 50%, 0.8)
 *
 * See [this wikipedia article](https://goo.gl/ev8Kw0)
 * on differences between HSL and HSB/HSV.
 *
 */

/** @namespace */
const Color = {
    /**
     * Convert 4 r,g,b,a ints in [0-255] ("a" defaulted to 255) to a
     * css color string.
     *
     * @param {number} r integer in [0, 255] for red channel
     * @param {number} g integer in [0, 255] for green channel
     * @param {number} b integer in [0, 255] for blue channel
     * @param {number} [a=255] integer in [0, 255] for alpha/opacity channel
     * @returns {string} A rgb(r,g,b) or rgba(r,g,b,a) css color string
     */
    rgbaCssColor(r, g, b, a = 255) {
        a = a / 255
        const a2 = a.toPrecision(2)
        return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a2})`
    },

    /**
     * Convert 4 ints, h,s,l,a, h in [0-360], s,l in [0-100]% a in [0-255] to a
     * css color string.
     * See [hsl()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl).
     *
     * NOTE: h=0 and h=360 are the same, use h in 0-359 for unique colors.
     *
     * @param {number} h
     * @param {number} [s=100]
     * @param {number} [l=50]
     * @param {number} [a=255]
     * @returns {string} A css HSL color string
     */
    hslCssColor(h, s = 100, l = 50, a = 255) {
        a = a / 255
        const a4 = a.toPrecision(4)
        return a === 1
            ? `hsl(${h},${s}%,${l}%)`
            : `hsla(${h},${s}%,${l}%,${a4})`
    },
    /**
     * Return a html/css hex color string for an r,g,b opaque color (a=255).
     * Hex strings do not support alpha.
     * Both #nnn and #nnnnnn forms supported.
     * Default is to check for the short hex form.
     * @param {number} r Integer value for red channel
     * @param {number} g Integer value for green channel
     * @param {number} b Integer value for blue channel
     * @returns {string} A css hex color string #nnn or #nnnnnn, n in [0,F] hex
     */
    hexCssColor(r, g, b) {
        return `#${(0x1000000 | (b | (g << 8) | (r << 16)))
            .toString(16)
            .slice(-6)}`
    },

    // cssColor is a hybrid string and is our standard.  It returns:
    //
    // * rgbaCssColor if a not 255 (i.e. not opaque)
    // * hexCssColor otherwise
    cssColor(r, g, b, a = 255) {
        return a === 255
            ? this.hexCssColor(r, g, b)
            : this.rgbaCssColor(r, g, b, a)
    },

    randomCssColor() {
        const r255 = () => util.randomInt(256) // random int in [0,255]
        return this.cssColor(r255(), r255(), r255())
    },

    randomGrayCssColor(min = 0, max = 255) {
        const gray = util.randomInt2(min, max) // random int in [min,max]
        return this.cssColor(gray, gray, gray)
    },

    // ### Pixels

    cssToPixel(string) {
        const rgba = this.cssToUint8Array(string)
        return this.rgbaToPixel(...rgba)
    },

    rgbaToPixel(r, g, b, a = 255) {
        const rgba = new Uint8Array([r, g, b, a])
        const pixels = new Uint32Array(rgba.buffer)
        return pixels[0]
    },

    randomPixel() {
        const r255 = () => util.randomInt(256) // random int in [0,255]
        return this.rgbaToPixel(r255(), r255(), r255())
    },

    randomGrayPixel(min = 0, max = 255) {
        const gray = util.randomInt2(min, max) // random int in [min,max]
        return this.rgbaToPixel(gray, gray, gray)
    },

    // ### CSS String Conversions

    // Return 4 element array given any legal CSS string color.
    //
    // Because strings vary widely: CadetBlue, #0f0, rgb(255,0,0),
    // hsl(120,100%,50%), we do not parse strings, instead we let
    // the browser do our work: we fill a 1x1 canvas with the css string color,
    // returning the r,g,b,a canvas ImageData TypedArray.

    // The shared 1x1 canvas 2D context.
    sharedCtx1x1: util.createCtx(1, 1, false, { willReadFrequently: true }),
    // sharedCtx1x1: util.createCtx(1, 1),

    // Convert any css string to 4 element Uint8ClampedArray TypedArray.
    // If you need a JavaScript Array, use `new Array(...TypedArray)`
    // Slow, but works for all css strings: hsl, rgb, .. as well as names.
    cssToUint8Array(string) {
        this.sharedCtx1x1.clearRect(0, 0, 1, 1)
        this.sharedCtx1x1.fillStyle = string
        this.sharedCtx1x1.fillRect(0, 0, 1, 1)
        return this.sharedCtx1x1.getImageData(0, 0, 1, 1).data
    },

    // ### Typed Color
    // A TypedColor is a 4 element ArrayBuffer, with two views:
    //
    // * pixelArray: A single element Uint32Array view
    // * u8array: A 4 element r,g,b,a Uint8ClampedArray view
    //
    // getters/setters are provided for multiple other color types:
    //  'css', 'pixel', 'rgb', 'webgl'
    // If g is undefinec, returns toTypedColor(g)
    typedColor(r, g, b, a = 255) {
        if (g === undefined) return this.toTypedColor(r)
        const u8array = new Uint8ClampedArray([r, g, b, a])
        u8array.pixelArray = new Uint32Array(u8array.buffer) // one element array
        // Make this an instance of TypedColorProto
        Object.setPrototypeOf(u8array, TypedColorProto)
        return u8array
    },

    isTypedColor(any) {
        return any && any.constructor === Uint8ClampedArray && any.pixelArray
    },

    // Return a typedColor given a value and optional colorType
    // If the value already is a typedColor, simply return it
    // If colorType not defined, assume css (string) or pixel (number)
    // or array [r,g,b,a=255]
    // The colorType can be: 'css', 'pixel', 'rgb', 'webgl'
    // Note rgb and webgl are int arrays & float arrays respectively.
    toTypedColor(value, colorType) {
        if (this.isTypedColor(value)) return value

        const tc = this.typedColor(0, 0, 0, 0) // "empty" typed color
        if (colorType == null) {
            if (util.isString(value)) tc.css = value
            else if (util.isNumber(value)) tc.pixel = value
            else if (util.isArray(value)) tc.rgb = value
            else if (util.isTypedArray(value)) tc.rgb = value
            else throw Error(`toTypedColor: illegal value ${value}`)
        } else {
            // REMIND: type check value & colorType?
            tc[colorType] = value
        }
        return tc
    },

    // Random typedColor, rgb or gray, alpha = 255 for both:
    randomTypedColor() {
        const r255 = () => util.randomInt(256) // random int in [0,255]
        return this.typedColor(r255(), r255(), r255())
    },
    // Random gray color, alpha = 255
    randomGrayTypedColor(min = 0, max = 255) {
        const gray = util.randomInt2(min, max) // random int in [min,max]
        return this.typedColor(gray, gray, gray)
    },
    // Arrays of random typed colors, very useful for patch colors
    randomColorArray(length) {
        const colors = new Array(length)
        util.forLoop(colors, (c, i) => (colors[i] = this.randomTypedColor()))
        return colors
    },
    randomGrayArray(length, min = 0, max = 255) {
        const grays = new Array(length)
        util.forLoop(
            grays,
            (g, i) => (grays[i] = this.randomGrayTypedColor(min, max))
        )
        return grays
    },
}

// Prototype for Color. Getters/setters for usability, may be slower.
const TypedColorProto = {
    // Inherit from Uint8ClampedArray
    __proto__: Uint8ClampedArray.prototype,

    // Set the Color to new rgba values.
    setColor(r, g, b, a = 255) {
        this.checkColorChange()
        this[0] = r
        this[1] = g
        this[2] = b
        this[3] = a
    },
    // No real need for getColor, it *is* the typed Uint8 array
    set rgb(rgbaArray) {
        this.setColor(...rgbaArray)
    },
    get rgb() {
        return this
    },

    // Set opacity to a value in 0-255
    setAlpha(alpha) {
        this.checkColorChange()
        this[3] = alpha // Uint8ClampedArray will clamp to 0-255
    },
    getAlpha() {
        return this[3]
    },
    get alpha() {
        return this.getAlpha()
    },
    set alpha(alpha) {
        this.setAlpha(alpha)
    },

    // Set the Color to a new pixel value
    setPixel(pixel) {
        this.checkColorChange()
        this.pixelArray[0] = pixel
    },
    // Get the pixel value
    getPixel() {
        return this.pixelArray[0]
    },
    get pixel() {
        return this.getPixel()
    },
    set pixel(pixel) {
        this.setPixel(pixel)
    },

    // Set pixel/rgba values to equivalent of the css string.
    // 'red', '#f00', 'ff0000', 'rgb(255,0,0)', etc.
    //
    // Does *not* set the chached this.string, which will be lazily evaluated
    // to its common cssColor by getCss(). The above would all return '#f00'.
    setCss(string) {
        return this.setColor(...Color.cssToUint8Array(string))
    },
    // Return the cssColor for this Color, cached in the @string value
    getCss() {
        if (this.string == null) this.string = Color.cssColor(...this)
        return this.string
    },
    get css() {
        return this.getCss()
    },
    set css(string) {
        this.setCss(string)
    },

    // Note: webgl colors are 3 RGB floats (no A)
    setWebgl(array) {
        if (array.length !== 3)
            throw Error(
                'setWebgl array length must be 3, length:',
                array.length
            )
        this.setColor(
            // OK if float * 255 non-int, setColor stores into uint8 array
            array[0] * 255,
            array[1] * 255,
            array[2] * 255
        )
    },
    getWebgl() {
        return [this[0] / 255, this[1] / 255, this[2] / 255]
    },
    get webgl() {
        return this.getWebgl()
    },
    set webgl(array) {
        this.setWebgl(array)
    },

    // Housekeeping when the color is modified.
    checkColorChange() {
        // Reset string & webgl on color change.
        this.string = null // will be lazy evaluated via getCss.
        // this.floatArray = null
    },
    // Return true if color is same value as myself, comparing pixels
    equals(color) {
        return this.getPixel() === color.getPixel()
    },
    toString() {
        return `[${Array.from(this).toString()}]`
    },
    // Return a [distance metric](
    // http://www.compuphase.com/cmetric.htm) between two colors.
    // Max distance is roughly 765 (3*255), for black & white.
    // For our purposes, omitting the sqrt will not effect our results
    rgbDistance(r, g, b) {
        const [r1, g1, b1] = this
        const rMean = Math.round((r1 + r) / 2)
        const [dr, dg, db] = [r1 - r, g1 - g, b1 - b]
        const [dr2, dg2, db2] = [dr * dr, dg * dg, db * db]
        const distanceSq =
            (((512 + rMean) * dr2) >> 8) +
            4 * dg2 +
            (((767 - rMean) * db2) >> 8)
        return distanceSq // Math.sqrt(distanceSq)
    },
}

export default Color
