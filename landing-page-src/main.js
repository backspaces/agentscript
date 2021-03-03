import Model from 'https://cdn.skypack.dev/agentscript/src/Model.js'
import { initTutorial } from './src/tutorial.js'
import './src/landing-page.js'

document.querySelector('[learn-more-button]').addEventListener('click', () => {
  document.querySelector('[learn-more-button-target]').scrollIntoView({ behavior: 'smooth' })
})

initTutorial(new Model({
  minX: -5,
  maxX: 5,
  minY: -5,
  maxY: 5
}))
