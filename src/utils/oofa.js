import { isObject, isTypedArray } from './types.js'
import { forLoop } from './objects.js'

// ### OofA/AofO

export function isOofA(data) {
    if (!isObject(data)) return false
    return Object.values(data).every(v => isTypedArray(v))
}
export function toOofA(aofo, spec) {
    const length = aofo.length
    const keys = Object.keys(spec)
    const oofa = {}
    keys.forEach(k => {
        oofa[k] = new spec[k](length)
    })
    forLoop(aofo, (o, i) => {
        keys.forEach(key => (oofa[key][i] = o[key]))
    })
    return oofa
}
export function oofaObject(oofa, i, keys) {
    const obj = {}
    keys.forEach(key => {
        obj[key] = oofa[key][i]
    })
    return obj
}
export function toAofO(oofa, keys = Object.keys(oofa)) {
    const length = oofa[keys[0]].length
    const aofo = new Array(length)
    forLoop(aofo, (val, i) => {
        aofo[i] = oofaObject(oofa, i, keys)
    })
    return aofo
}
export function oofaBuffers(postData) {
    const buffers = []
    forLoop(postData, obj => forLoop(obj, a => buffers.push(a.buffer)))
    return buffers
}
