import { randomInt } from './math.js'
import { convertArrayType } from './types.js'

// ### Arrays, Objects and Iteration

// Three handy functions for defaults & properties
// Identity fcn, returning its argument unchanged. Used in callbacks
export const identityFcn = o => o
// No-op function, does nothing. Used for default callback.
export const noopFcn = () => {}
// Return function returning an object's property.  Property in fcn closure.
export const propFcn = prop => o => o[prop]

export function arraysEqual(a1, a2) {
    if (a1.length !== a2.length) return false
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false
    }
    return true
}
export function removeArrayItem(array, item) {
    const ix = array.indexOf(item)
    if (ix !== -1) array.splice(ix, 1)
    // else throw Error(`removeArrayItem: ${item} not in array`)
    else console.log(`removeArrayItem: ${item} not in array`)
    return array // for chaining
}
// Return a string representation of an array of arrays
export const arraysToString = arrays => arrays.map(a => `${a}`).join(',')

// Execute fcn for all own member of an obj or array (typed OK).
// Return input arrayOrObj, transformed by fcn.
// - Unlike forEach, does not skip undefines.
// - Like map, forEach, etc, fcn = fcn(item, key/index, obj).
// - Alternatives are: `for..of`, array map, reduce, filter etc
export function forLoop(arrayOrObj, fcn) {
    if (arrayOrObj.slice) {
        // typed & std arrays
        for (let i = 0, len = arrayOrObj.length; i < len; i++) {
            fcn(arrayOrObj[i], i, arrayOrObj)
        }
    } else {
        // obj
        Object.keys(arrayOrObj).forEach(k => fcn(arrayOrObj[k], k, arrayOrObj))
    }
    // return arrayOrObj
}
// Repeat function f(i, a) n times, i in 0, n-1
// a is optional array, default a new Array.
// Return a.
export function repeat(n, f, a = []) {
    for (let i = 0; i < n; i++) f(i, a)
    return a
}
// Repeat function n times, incrementing i by step each call.
export function step(n, step, f) {
    for (let i = 0; i < n; i += step) f(i)
}
// Return range [0, length-1]. Note: 6x faster than Array.from!
export function range(length) {
    return repeat(length, (i, a) => {
        a[i] = i
    })
}

// REMIND: use set function on object keys
// export function override(defaults, options) {
//     return assign(defaults, options, Object.keys(defaults))
// }
export function override(defaults, options) {
    const overrides = defaults
    forLoop(defaults, (val, key) => {
        if (options[key]) {
            overrides[key] = options[key]
        }
    })
    return overrides
}

// Get subset of object by it's keys
// export function getObjectValues(obj, keys) {}

// Return a new array that is the concatination two arrays.
// The resulting Type is that of the first array.
export function concatArrays(array1, array2) {
    const Type = array1.constructor
    if (Type === Array) {
        return array1.concat(convertArrayType(array2, Array))
    }
    const array = new Type(array1.length + array2.length)
    // NOTE: typedArray.set() allows any Array or TypedArray arg
    array.set(array1)
    array.set(array2, array1.length)
    return array
}

// Convert obj to string via JSON. Use indent = 0 for one-liner
// jsKeys true removes the jsonKeys quotes
export function objectToString(obj, indent = 2, jsKeys = true) {
    let str = JSON.stringify(obj, null, indent)
    if (jsKeys) str = str.replace(/"([^"]+)":/gm, '$1:')
    return str
}

// Compare Objects or Arrays via JSON string. Note: TypedArrays !== Arrays
export const objectsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Return random one of array items.
export const oneOf = array => array[randomInt(array.length)]
export function otherOneOf(array, item) {
    if (array.length < 2) throw Error('otherOneOf: array.length < 2')
    do {
        var other = oneOf(array)
    } while (item === other) // note var use
    return other
}

// Random key/val of object
export const oneKeyOf = obj => oneOf(Object.keys(obj))
export const oneValOf = obj => obj[oneKeyOf(obj)]
// export function oneKeyOf(obj) {
//     return oneOf(Object.keys(obj))
// }
// export function oneValOf(obj) {
//     return obj[oneKeyOf(obj)]
// }

// You'd think this wasn't necessary, but I always forget. Damn.
// NOTE: this, like sort, sorts in place. Clone array if needed.
export function sortNums(array, ascending = true) {
    return array.sort((a, b) => (ascending ? a - b : b - a))
}
// Sort an array of objects w/ fcn(obj) as compareFunction.
// If fcn is a string, convert to propFcn.
export function sortObjs(array, fcn, ascending = true) {
    if (typeof fcn === 'string') fcn = propFcn(fcn)
    const comp = (a, b) => fcn(a) - fcn(b)
    return array.sort((a, b) => (ascending ? comp(a, b) : -comp(a, b)))
}
// Randomize array in-place. Use clone() first if new array needed
// The array is returned for chaining; same as input array.
// See [Durstenfeld / Fisher-Yates-Knuth shuffle](https://goo.gl/mfbdPh)
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

// Set operations on arrays
// union: elements in a1 or a2
export function union(a1, a2) {
    return Array.from(new Set(a1.concat(a2)))
}
// intersection: elements in a1 and a2
export function intersection(a1, a2) {
    // intersection = new Set([...set1].filter(x => set2.has(x)))
    const set2 = new Set(a2)
    return a1.filter(x => set2.has(x))
}
// Difference: elements from a1 not in a2
export function difference(a1, a2) {
    // difference = new Set([...set1].filter(x => !set2.has(x)))
    const set2 = new Set(a2)
    return a1.filter(x => !set2.has(x))
}

// Return a "ramp" (array of uniformly ascending/descending floats)
// in [start,stop] with numItems (positive integer > 1).
// OK for start>stop. Will always include start/stop w/in float accuracy.
export function floatRamp(start, stop, numItems) {
    // NOTE: start + step*i, where step is (stop-start)/(numItems-1),
    // has float accuracy problems, must recalc step each iteration.
    if (numItems <= 1) throw Error('floatRamp: numItems must be > 1')
    const a = []
    for (let i = 0; i < numItems; i++) {
        a.push(start + (stop - start) * (i / (numItems - 1)))
    }
    return a
}
// Integer version of floatRamp, start & stop integers, rounding each element.
// Default numItems yields unit step between start & stop.
export function integerRamp(
    start,
    stop,
    numItems = Math.abs(stop - start) + 1
) {
    return floatRamp(start, stop, numItems).map(a => Math.round(a))
}

// Return an array normalized (lerp) between lo/hi values
// export function normalize(array, lo = 0, hi = 1) {
//     const [min, max] = [arrayMin(array), arrayMax(array)]
//     const scale = 1 / (max - min)
//     return array.map(n => lerp(lo, hi, scale * (n - min)))
// }
// // Return Uint8ClampedArray normalized in 0-255
// export function normalize8(array) {
//     return new Uint8ClampedArray(normalize(array, -0.5, 255.5))
// }
// // Return Array normalized to integers in lo-hi
// export function normalizeInt(array, lo, hi) {
//     return normalize(array, lo, hi).map(n => Math.round(n))
// }

// // get nested property like obj.foo.bar.baz:
// //   const val = nestedProperty(obj, 'foo.bar.baz')
// // Optimized for path length up to 4, else uses path.reduce()
// export function nestedProperty(obj, path) {
//     if (typeof path === 'string') path = path.split('.')
//     switch (path.length) {
//         case 1:
//             return obj[path[0]]
//         case 2:
//             return obj[path[0]][path[1]]
//         case 3:
//             return obj[path[0]][path[1]][path[2]]
//         case 4:
//             return obj[path[0]][path[1]][path[2]][path[3]]
//         default:
//             return path.reduce((obj, param) => obj[param], obj)
//     }
// }

// // Assign values from one object to another.
// // keys is an array of keys or a string of space separated keys.
// // Similar to Object.assign:
// //    util.assign(model, controls, 'speed wiggle population')
// // is equivalent to
// //    {
// //        const { speed, wiggle, population } = controls
// //        Object.assign(model, { speed, wiggle, population })
// //    }
// export function assign(to, from, keys) {
//     if (typeof keys === 'string') keys = keys.split(' ')
//     forLoop(keys, key => {
//         to[key] = from[key]
//     })
//     return to
// }

// // Function <> String for Cap F functions
// export function functionToStrings(fcn, simplify = true) {
//     const str = fcn.toString()
//     const args = str.replace(/.*\(/, '').replace(/\).*/s, '')
//     let body = str.replace(/.*\) {/, '').replace(/}$/, '')
//     if (simplify) body = simplifyFunctionString(body)
//     return [args, body]
// }
// export function stringsToFunction(args, body) {
//     return new Function(args, body)
// }
// export function simplifyFunctionString(str) {
//     // str = str.replace(/\n/g, ' ')
//     // str = str.replace(/^ */, '')
//     // str = str.replace(/ *$/g, '')
//     // str = str.replace(/  */g, ' ')

//     // str = str.replace(/^ */gm, '')
//     // str = str.replace(/ *$/gm, '')
//     // str = str.replace(/  */g, ' ')

//     str = str.replace(/^ */gm, '')
//     str = str.replace(/^\n/, '')
//     str = str.replace(/\n$/, '')

//     return str
// }

// // Create a histogram, given an array, a bin size, and a
// // min bin defaulting to min of of the array.
// // Return an object with:
// // - min/maxBin: the first/last bin with data
// // - min/maxVal: the min/max values in the array
// // - bins: the number of bins
// // - hist: the array of bins
// export function histogram(
//     array,
//     bins = 10,
//     min = arrayMin(array),
//     max = arrayMax(array)
// ) {
//     const binSize = (max - min) / bins
//     const hist = new Array(bins)
//     hist.fill(0)
//     forLoop(array, val => {
//         // const val = key ? a[key] : a
//         if (val < min || val > max) {
//             throw Error(`histogram bounds error: ${val}: ${min}-${max}`)
//         } else {
//             let bin = Math.floor((val - min) / binSize)
//             if (bin === bins) bin-- // val is max, round down
//             hist[bin]++
//         }
//     })
//     hist.parameters = { bins, min, max, binSize, arraySize: array.length }
//     return hist
// }

// export const arrayFirst = array => array[0]
export const arrayLast = array => array[array.length - 1]
// export const arrayMax = array => array.reduce((a, b) => Math.max(a, b))
// export const arrayMin = array => array.reduce((a, b) => Math.min(a, b))
// export const arrayExtent = array => [arrayMin(array), arrayMax(array)]

// // Return a new shallow of array (either Array or TypedArray)
// export function clone(array) {
//     return array.slice(0)
// }

// // Simple uniq on sorted or unsorted array.
// export const uniq = array => Array.from(new Set(array))
