import util from './util.js'

// ### Sugar functions for running models:

export function testStartup(toWindowObj) {
    util.toWindow(toWindowObj)
    const usingPuppeteer = navigator.userAgent === 'Puppeteer'
    if (usingPuppeteer) util.randomSeed()
}

export function testSetup(model) {
    const { world, patches, turtles, links } = model
    util.printToPage('patches: ' + patches.length)
    util.printToPage('turtles: ' + turtles.length)
    util.printToPage('links: ' + links.length)
    const breeds = Object.assign({}, turtles.breeds, patches.breeds)
    util.forEach(breeds, (val, key) => {
        util.printToPage(key + ': ' + val.length)
    })
    util.toWindow({ world, patches, turtles, links, model })
}

export function testDone(model, propsNames = []) {
    const usingPuppeteer = navigator.userAgent === 'Puppeteer'
    util.printToPage('')
    util.printToPage('Done:')
    propsNames.forEach(name => {
        let val = model[name]
        if (util.isArray(val)) val = val.length
        if (util.isFunction(val)) val = model[name]()
        util.printToPage(`${name}: ${val}`)
    })
    // util.printToPage('')
    util.printToPage(modelIO.sampleObj(model))

    if (usingPuppeteer) {
        window.modelDone = model.modelDone = true
        window.modelSample = model.modelSample = modelIO.sampleJSON(model)
    }
}

// ### Utilities

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

// Print a message to an html element.
// If msg is an object, convert to JSON.
// export function printToPage(msg, element = document.body) {
//     if (util.isObject(msg)) {
//         msg = JSON.stringify(msg, null, 2)
//         msg = '<pre>' + msg + '</pre>'
//     }

//     element.style.fontFamily = 'monospace'
//     element.innerHTML += msg + '<br />'
// }
