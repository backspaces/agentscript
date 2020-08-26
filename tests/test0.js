import util from '../src/util.js'
import { isIntArray } from '../src/utils/types.js'

let Turtles
async function imit(use3d) {
    if (use3d) {
        Turtles = await import('../src/Turtles.js')
    } else {
        Turtles = await import('../src/Turtles.js')
    }
}
init(true)

export default class Foo {
    constructor() {
        this.Turtles = Turtles
    }
}
