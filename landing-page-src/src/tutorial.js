import TwoDraw from 'https://cdn.skypack.dev/agentscript/src/TwoDraw.js'
import Color from 'https://cdn.skypack.dev/agentscript/src/Color.js'
import ColorMap from 'https://cdn.skypack.dev/agentscript/src/ColorMap.js'
import * as util from 'https://cdn.skypack.dev/agentscript/src/utils.js'

import { CodeBlock } from './codeblock.js'
import { renderColorMapBlock } from './colormapBlock.js'

window.util = util
window.Color = Color
window.ColorMap = ColorMap

let relativeView
let fixedView
let tutorialModelContainer
let fixedModelContainer
let model

function step() {
  relativeView.model.step()
  relativeView.draw()

  fixedView.draw()
  
  setTimeout(() => step(), 20)
}

export async function initTutorial(startingModel) {
  window.model = startingModel
  
  let modelColumnWidth = 500
  let patchSize = Math.round(modelColumnWidth / startingModel.world.width)

  relativeView = new TwoDraw(startingModel, {
      div: document.querySelector('#tutorial-model'),
      patchSize: patchSize,
  },{
      patchesColor: (p) => p.color ? p.color : Color.typedColor('black')
  })

  fixedView = new TwoDraw(startingModel, {
      div: document.querySelector('#tutorial-model-fixed'),
      patchSize: patchSize,
  }, {
      patchesColor: (p) => p.color ? p.color : Color.typedColor('black')
  })

  tutorialModelContainer = document.querySelector('.tutorial-model-container')
  fixedModelContainer = document.querySelector('.tutorial-model-container-fixed')
  fixedModelContainer.style.display = 'none'
  fixedModelContainer.style.left = relativeView.div.offsetLeft + 'px'

  // Set up code blocks
  document.querySelectorAll('[code-block]').forEach(el => {
    let codeContent = el.textContent
    let hasForeverButton = el.getAttribute('forever-button') !== null
    let isDisabled = el.getAttribute('disabled') !== null
    let colorMapCode = el.getAttribute('colormap')
    el.innerHTML = ''
    el.appendChild(new CodeBlock(startingModel).render({ codeContent, hasForeverButton, isDisabled, colorMapCode }))
  })

  // document.querySelectorAll('[colormap-block]').forEach(el => {
  //   let codeContent = el.textContent
  //   el.innerHTML = ''
  //   el.appendChild(renderColorMapBlock({ codeContent }))
  // })

  // Start the animator
  step()
}

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
