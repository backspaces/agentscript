import Model from 'https://cdn.skypack.dev/agentscript/src/Model.js'

import { initTutorial } from '../../src/tutorial.js'

let startingModel = new Model({
  minX: -20,
  maxX: 20,
  minY: -20,
  maxY: 20
})

initTutorial(startingModel)
