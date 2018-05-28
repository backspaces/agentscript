// See stack overflow Ramda fcn: https://goo.gl/VNb362
// REMIND: util.isObject(msg)

function type(val) {
    return val === null
        ? 'Null'
        : val === undefined
            ? 'Undefined'
            : Object.prototype.toString.call(val).slice(8, -1)
}

export function toJSON(obj, indent = 0, topLevelArrayOK = true) {
    let firstCall = topLevelArrayOK
    const blackList = ['rectCache']
    const json = JSON.stringify(
        obj,
        (key, val) => {
            if (blackList.includes(key)) return undefined
            const isAgentArray =
                Array.isArray(val) &&
                val.length > 0 &&
                Number.isInteger(val[0].id)

            if (isAgentArray && !firstCall) {
                return val.map(v => v.id)
            }

            firstCall = false
            return val
        },
        indent
    )
    return json
}

export function sampleObj(model) {
    const obj = {
        model: Object.keys(model),
        patches: model.patches.length,
        patch: model.patches.oneOf(),
        turtles: model.turtles.length,
        turtle: model.turtles.oneOf(),
        links: model.links.length,
        link: model.links.oneOf(),
    }
    const json = toJSON(obj)
    return JSON.parse(json)
}

export function sampleJSON(model, indent = 0) {
    return toJSON(sampleObj(model), indent)
}
// export function samplePrettyJSON (model) {
//   return toJSON(sampleObj(model), 2)
// }

// Print a message to an html element.
// If msg is an object, convert to JSON.
export function printToPage(msg, element = document.body) {
    // if (this.isObject(msg)) msg = JSON.stringify(msg, null, 2)
    if (type(msg) === 'Object') {
        msg = JSON.stringify(msg, null, 2)
        msg = '<pre>' + msg + '</pre>'
    }
    // const isObj = type(msg) === 'Object'

    element.style.fontFamily = 'monospace'
    element.innerHTML += msg + '<br />'
}
