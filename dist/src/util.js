// A set of useful misc utils which will eventually move to individual files.
// Note we use arrow functions one-liners, more likely to be optimized.
// REMIND: Test optimization, if none, remove arrow one-liners.
import * as async from './utils/async.js'
import * as canvas from './utils/canvas.js'
import * as debug from './utils/debug.js'
import * as dom from './utils/dom.js'
import * as math from './utils/math.js'
import * as models from './utils/models.js'
import * as objects from './utils/objects.js'
import * as oofa from './utils/oofa.js'
import * as types from './utils/types.js'

const util = {}

Object.assign(
    util,

    async,
    canvas,
    debug,
    dom,
    math,
    models,
    objects,
    oofa,
    types
)

export default util
