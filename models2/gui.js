import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import Animator from '../src/Animator.js'
import GUI from '../src/GUI.js'
import TwoView from '../src/TwoView.js'
import HelloModel from '../models/HelloModel.js'
import util from '../src/util.js'
util.toWindow({ Color, ColorMap, Animator, GUI, TwoView, HelloModel, util })

const template = {
    fps: { value: 20, extent: [5, 60, 5], cmd: fps => anim.setRate(fps) },
    speed: { value: 0.1, extent: [0.01, 0.5, 0.01] },
    wiggle: { value: 0.2, extent: [0, 1, 0.1] },
    patchSize: { value: 12, extent: [1, 20, 1] },
    shape: { value: 'dart', extent: ['dart', 'circle', 'square'] },
    shapeSize: { value: 1, extent: [0.5, 5, 0.5] },
    run: { value: () => anim.toggle() },
    population: { value: 10, extent: [10, 1000, 10] },
}
const controls = new GUI(template).target

const colors = ColorMap.Basic16
const linkColor = colors.gray // colors.randomColor()

class HelloModelCtl extends HelloModel {
    step() {
        this.speed = controls.speed
        this.wiggle = controls.wiggle
        this.setPopulation(controls.population)
        super.step()
    }
    setPopulation(population) {
        const delta = population - this.turtles.length
        if (delta === 0) return

        this.population = population
        const { turtles, links } = this
        const newLink = t => links.create(t, turtles.otherOneOf(t))

        if (delta < 0) {
            while (turtles.length !== population) turtles.oneOf().die()
            turtles.ask(t => {
                if (t.links.length === 0) newLink(t)
            })
        } else {
            turtles.create(delta, t => newLink(t))
        }
    }
}
const model = new HelloModelCtl()
model.setup()

class HelloView extends TwoView {
    initPatches() {
        this.createPatchPixels(i => Color.randomGrayPixel(0, 100))
    }
    draw() {
        if (controls.patchSize !== view.patchSize) {
            view.reset(controls.patchSize)
        }
        if (!this.draws) this.draws = 0
        if (this.draws === 0) this.initPatches()

        this.clear()
        this.drawPatches() // redraw patches colors

        this.drawLinks(model.links, { color: linkColor.css, width: 1 })
        this.drawTurtles(model.turtles, t => ({
            shape: controls.shape,
            color: colors.modColor(t.id).css,
            size: controls.shapeSize,
        }))
        this.draws++
    }
}
const view = new HelloView('modelDiv', model.world, {
    useSprites: true,
    patchSize: controls.patchSize,
})

const anim = new Animator(model, view, controls.fps)
anim.start()
util.toWindow({ template, controls, model, view, colors, anim })
