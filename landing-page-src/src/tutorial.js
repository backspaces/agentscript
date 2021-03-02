import HelloPlusModel from 'https://cdn.skypack.dev/agentscript/models/HelloPlusModel.js'
import TwoDraw from 'https://cdn.skypack.dev/agentscript/src/TwoDraw.js'
import Model from 'https://cdn.skypack.dev/agentscript/src/Model.js'
import Color from 'https://cdn.skypack.dev/agentscript/src/Color.js'
import ColorMap from 'https://cdn.skypack.dev/agentscript/src/ColorMap.js'
import * as util from 'https://cdn.skypack.dev/agentscript/src/utils.js'

import { CodeBlock } from './codeblock.js'

window.util = util
window.Color = Color
window.ColorMap = ColorMap

let whatIsABMView
let fixedView
let tutorialModelContainer
let fixedModelContainer
let model

function step() {
  whatIsABMView.model.step()
  whatIsABMView.draw()

  fixedView.draw()
  
  setTimeout(() => step(), 20)
}

async function run() {
  // const whatIsABMModel = model = new HelloPlusModel({
  //     minX: 0,
  //     maxX: 25,
  //     minY: 0,
  //     maxY: 25
  // })
  const whatIsABMModel = window.model = new Model({
      minX: -5,
      maxX: 5,
      minY: -5,
      maxY: 5
  })
  whatIsABMView = new TwoDraw(whatIsABMModel, {
      div: document.querySelector('#tutorial-model'),
      patchSize: 40,
  },{
      patchesColor: (p) => p.color ? p.color : Color.typedColor('black')
  })

  fixedView = new TwoDraw(whatIsABMModel, {
      div: document.querySelector('#tutorial-model-fixed'),
      patchSize: 40,
  }, {
      patchesColor: (p) => p.color ? p.color : Color.typedColor('black')
  })

  tutorialModelContainer = document.querySelector('.tutorial-model-container')
  fixedModelContainer = document.querySelector('.tutorial-model-container-fixed')
  fixedModelContainer.style.display = 'none'
  fixedModelContainer.style.left = whatIsABMView.div.offsetLeft + 'px'

  // Set up code blocks
  document.querySelectorAll('[code-block]').forEach(el => {
    let codeContent = el.textContent
    let hasForeverButton = el.getAttribute('forever-button') !== null
    el.innerHTML = ''
    el.appendChild(new CodeBlock(whatIsABMModel).render({ codeContent, hasForeverButton }))
  })

  // Start the animator
  step()
}
run()

document.addEventListener('scroll', (event) => {
    // Code smell. Must match .tutorial-model-container-fixed top css property
    let topPadding = 80;
    if (document.scrollingElement.scrollTop > (tutorialModelContainer.offsetTop - topPadding)) {
        tutorialModelContainer.style.visibility = 'hidden'
        fixedModelContainer.style.display = 'block'
    } else {
        tutorialModelContainer.style.visibility = 'visible'
        fixedModelContainer.style.display = 'none'
    }
})

document.querySelectorAll('[reset-model]').forEach(el => {
    el.addEventListener('click', () => window.model.reset())
})
