import Animator from '../src/Animator.js'
import GUI from '../src/GUI.js'
import HelloModel from '../models/HelloModel.js'
import HelloView from './HelloView.js'
import util from '../src/util.js'
util.toWindow({ Animator, GUI, HelloModel, HelloView, util })

const template = {
    fps: { value: 20, extent: [5, 60, 5], cmd: fps => animator.setRate(fps) },
    speed: { value: 0.1, extent: [0.01, 0.5, 0.01] },
    wiggle: { value: 0.2, extent: [0, 1, 0.1] },
    patchSize: { value: 12, extent: [1, 20, 1] },
    shape: { value: 'dart', extent: ['dart', 'circle', 'square'] },
    shapeSize: { value: 1, extent: [0.5, 5, 0.5] },
    run: { value: () => animator.toggle() },
    population: { value: 10, extent: [10, 1000, 10] },
}
const controls = new GUI(template).target

class MyHelloWorld extends HelloModel {
    step() {
        this.speed = controls.speed
        this.wiggle = controls.wiggle
        this.setPopulation(controls.population)
        super.step()
    }
}
const model = new MyHelloWorld()
model.setup()

class MyHelloView extends HelloView {
    draw(model) {
        if (controls.patchSize !== this.patchSize) {
            this.reset(controls.patchSize)
        }
        this.shape = controls.shape
        this.shapeSize = controls.shapeSize
        super.draw(model)
    }
}
const view = new MyHelloView('modelDiv', model.world, {
    useSprites: true,
    patchSize: controls.patchSize,
})

const animator = new Animator(model, view, controls.fps)
animator.start()
util.toWindow({ template, controls, model, view, animator })
