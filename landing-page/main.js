import { createAntsView } from './models/createAntsView.js'
import { createFlockView } from './models/createFlockView.js'

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

function step() {
    currentView.view.model.step()
    currentView.view.draw()
    
    setTimeout(() => step(), 20)
}

async function run() {
    let modelsContainer = document.querySelector('.models-container')
    viewConfigs.forEach(({ view }) => {
        modelsContainer.appendChild(view.div)
        view.div.style.display = 'none'
    })

    nextModel()
    step()
}
run()

window.addEventListener('resize', () => {
    viewConfigs.forEach(({ view }) => {
        view.div.width = window.innerWidth
        view.div.height = window.innerHeight
    })
})