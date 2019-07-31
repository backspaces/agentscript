import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'
// import util from '../src/util.js'
// util.toWindow({ Color, ColorMap, Animator, GUI, TwoView, HelloModel, util })

export default class HelloView extends TwoView {
    constructor(...args) {
        super(...args)
        this.colors = ColorMap.Basic16
        this.linkColor = this.colors.gray // colors.randomColor()
        this.shape = 'dart'
        this.shapeSize = 1
    }
    initPatches() {
        this.createPatchPixels(i => Color.randomGrayPixel(0, 100))
    }
    draw(model) {
        // if (!this.draws) this.draws = 0
        if (this.ticks === 0) this.initPatches()

        this.clear()
        this.drawPatches() // redraw patches colors

        this.drawLinks(model.links, { color: this.linkColor.css, width: 1 })
        this.drawTurtles(model.turtles, t => ({
            shape: this.shape,
            color: this.colors.atIndex(t.id).css,
            size: this.shapeSize,
        }))
        this.tick()
    }
}
