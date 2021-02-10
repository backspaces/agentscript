import { createAntsView } from './models/createAntsView.js'
import { createFlockView } from './models/createFlockView.js'

import HelloPlusModel from '../models/HelloPlusModel.js'
import TwoDraw from '../src/TwoDraw.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

window.util = util

// setup code blocks
document.querySelectorAll('.code').forEach(el => {
    el.style.height = el.scrollHeight + 5 + 'px'
})

document.querySelectorAll('.code-block').forEach(el => {
    let codeEl = el.querySelector('.code')
    let runOnceButton = el.querySelector('[run-once]')
    runOnceButton.addEventListener('click', () => {
        let code = codeEl.value
        eval(code)
    })
})

let viewConfigs = [
    { view: createFlockView() },
    {
        view: createAntsView(),
        readyFn: (model) => {
            model.reset()
            model.setup()
        }
    },
]
let currentViewIndex = -1
let currentView

function nextModel() {
    let prevView = currentView
    currentViewIndex = (currentViewIndex + 1) % viewConfigs.length
    currentView = viewConfigs[currentViewIndex]

    if (currentView.readyFn) {
        currentView.readyFn(currentView.view.model)
    }

    if (prevView) {
        prevView.view.div.style.display = 'none'
    }
    currentView.view.div.style.display = 'block'

    setTimeout(() => nextModel(), 7000)
}

let whatIsABMView
let fixedView
let model

function step() {
    currentView.view.model.step()
    currentView.view.draw()

    whatIsABMView.model.step()
    whatIsABMView.draw()

    fixedView.draw()
    
    setTimeout(() => step(), 20)
}

async function run() {
    let modelsContainer = document.querySelector('.models-container')

    // Add all the views to the document
    viewConfigs.forEach(({ view }) => {
        modelsContainer.appendChild(view.div)
        view.div.style.display = 'none'
    })

    const whatIsABMModel = model = new HelloPlusModel({
        minX: 0,
        maxX: 25,
        minY: 0,
        maxY: 25
    })
    whatIsABMView = new TwoDraw(whatIsABMModel, {
        div: document.querySelector('#what-is-agentscript'),
        patchSize: 20,
    })

    fixedView = new TwoDraw(whatIsABMModel, {
        div: document.querySelector('#fixed-canvas'),
        patchSize: 20,
    })
    fixedView.div.style.display = 'none'
    fixedView.div.style.left = whatIsABMView.div.offsetLeft + 'px'

    // Start cycling through models
    nextModel()

    // Start the animator
    step()
}
run()

document.addEventListener('scroll', (event) => {
    if (document.scrollingElement.scrollTop > whatIsABMView.div.offsetTop) {
        whatIsABMView.div.style.visibility = 'hidden'
        fixedView.div.style.display = 'block'
    } else {
        whatIsABMView.div.style.visibility = 'visible'
        fixedView.div.style.display = 'none'
    }
})

// window.addEventListener('resize', () => {
//     viewConfigs.forEach(({ view }) => {
//         view.div.width = window.innerWidth
//         view.div.height = window.innerHeight
//     })
// })