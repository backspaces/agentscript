// ### Types

// Fix the javascript typeof operator https://goo.gl/Efdzk5
export const typeOf = obj =>
    ({}.toString
        .call(obj)
        .match(/\s(\w+)/)[1]
        .toLowerCase())
export const isType = (obj, string) => typeOf(obj) === string
export const isOneOfTypes = (obj, array) => array.includes(typeOf(obj))

export const isString = obj => isType(obj, 'string')
export const isObject = obj => isType(obj, 'object')
// export const isArray = obj => isType(obj, 'array')
export const isArray = obj => Array.isArray(obj)
export const isNumber = obj => isType(obj, 'number')
export const isFunction = obj => isType(obj, 'function')

// Is a number an integer (rather than a float w/ non-zero fractional part)
export const isInteger = n => Number.isInteger(n) // assume es6, babel otherwise.
export const isFloat = n => isNumber(n) && n % 1 !== 0 // https://goo.gl/6MS0Tm
export const isCanvas = obj =>
    isOneOfTypes(obj, ['htmlcanvaselement', 'offscreencanvas'])

export const isImageable = obj =>
    isOneOfTypes(obj, [
        'image',
        'htmlimageelement',
        'htmlcanvaselement',
        'offscreencanvas',
        'imagebitmap',
    ])

// Typed Arrays:
export const isTypedArray = obj => typeOf(obj.buffer) === 'arraybuffer'
export const isUintArray = obj => /^uint.*array$/.test(typeOf(obj))
export const isIntArray = obj => /^int.*array$/.test(typeOf(obj))
export const isFloatArray = obj => /^float.*array$/.test(typeOf(obj))

// export const isWebglArray = obj =>
//     Array.isArray(obj) && obj.length === 3 && util.arrayMax(obj) <= 1

export function isLittleEndian() {
    const d32 = new Uint32Array([0x01020304])
    return new Uint8ClampedArray(d32.buffer)[0] === 4
}

// Convert Array or TypedArray to given Type (Array or TypedArray).
// Result same length as array, precision may be lost.
export function convertArrayType(array, Type) {
    const Type0 = array.constructor
    if (Type0 === Type) return array // return array if already same Type
    return Type.from(array) // Use .from (both TypedArrays and Arrays)
}

// Unused:
// isHtmlElement: obj => /^html.*element$/.test(typeOf(obj))
// isImage: obj => isType(obj, 'image')
// isImageBitmap: obj => isType(obj, 'imagebitmap')
// // Is undefined, null, bool, number, string, symbol
// isPrimitive: obj => obj == null || 'object' != typeof obj
// Return array's type (Array or TypedArray variant)
// typeName: obj => obj.constructor.name
