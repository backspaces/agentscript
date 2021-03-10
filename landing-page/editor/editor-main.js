// Option 1
// Load the example js file, dump it to the text area,
// first time: import the contents of the text area,
// on change: replace the runtime methods


// Option 1
// interpret textarea as js module; use import()

// Option 2
// interpret textarea as function bodies; use new Function() or eval()


// import Model

// class SomeModel extends Model {
//   constructor() {

//   }

//   setup() {

//   }

//   step() {

//   }

//   helperFn() {

//   }
// }

// textarea.value = code


// import {
//   Model,
//   modelOpts,
//   View,
//   viewOpts,
//   drawOpts
// } from './flock-example-for-editor.js'

import {EditorState, basicSetup} from "../_snowpack/pkg/@codemirror/basic-setup.js"
import {EditorView, keymap} from "../_snowpack/pkg/@codemirror/view.js"
import {defaultTabBinding} from "../_snowpack/pkg/@codemirror/commands.js"
import {javascript} from "../_snowpack/pkg/@codemirror/lang-javascript.js"
import _ from "../vendor/underscore-esm-min.js"
import html from '../vendor/nanohtml.es6.js';

let editorExtensions = [
  basicSetup,
  keymap.of([defaultTabBinding]),
  javascript(),
  // This is how you register an event listener lol???
  EditorView.updateListener.of(update => {
    if (update.docChanged) {
      onDocChange()
    }
  })
]

let onDocChange = _.debounce(() => {
  reloadModel()
}, 300)

let lastStepError
let lastSetupError
let renderError = ({ stepError, setupError }) => {
  let stepErrorContainer = document.querySelector('.step-error-container')
  if (typeof stepError !== 'undefined') {
    if (stepError === null) {
      stepErrorContainer.innerHTML = ''
    } else if (!lastStepError || lastStepError.message !== stepError.message) {
      stepErrorContainer.innerHTML = ''
      stepErrorContainer.appendChild(html`<div>${stepError.toString()}</div>`)
      lastStepError = stepError
    }
  }

  let setupErrorContainer = document.querySelector('.setup-error-container')
  if (typeof setupError !== 'undefined') {
    if (setupError === null) {
      setupErrorContainer.innerHTML = ''
    } else if (!lastSetupError || lastSetupError.message !== setupError.message) {
      setupErrorContainer.innerHTML = ''
      setupErrorContainer.appendChild(html`<div>${setupError.toString()}</div>`)
      lastSetupError = setupError
    }
  }
}

let editor = new EditorView({
  state: EditorState.create({
    doc: '',
    extensions: editorExtensions
  }),
  parent: document.querySelector(".ide-container")
})

let model
let view

async function initEditor() {
  let code = await fetch('./flock-example-for-editor.js').then(res => res.text())
  editor.setState(EditorState.create({ doc: code, extensions: editorExtensions }))

  await rebuildModel()

  function step() {
    try {
      model.step()
      view.draw()
      renderError({ stepError: null })
    } catch (e) {
      console.error(e)
      renderError({ stepError: e })
    }

    setTimeout(() => step(), 20)
  }

  step()

}

async function rebuildModel() {
  let code = editor.state.doc
  
  const dataUri = 'data:text/javascript;charset=utf-8,'
    + encodeURIComponent(code)
  
  let {
    Model,
    modelOpts,
    View,
    viewOpts,
    drawOpts
  } = await import(dataUri)

  window.Model = Model

  model = window.model = new Model(modelOpts)

  viewOpts.div = 'ide-canvas-container'
  document.querySelector(`#${viewOpts.div}`).innerHTML = ''
  
  view = new View(model, viewOpts, drawOpts)

  model.setup()
}

async function reloadModel() {
  try {
    let code = editor.state.doc
  
    const dataUri = 'data:text/javascript;charset=utf-8,'
      + encodeURIComponent(code)
    
    let {
      Model,
      modelOpts,
      View,
      viewOpts,
      drawOpts
    } = await import(dataUri)

    for (let key of Object.getOwnPropertyNames(Model.prototype)) {
      window.model[key] = Model.prototype[key].bind(window.model)
    }

    if (Model.prototype['setup'].toString() !== Object.getPrototypeOf(model).setup.toString()) {
      console.log('setup changed')
      model = window.model = new Model(modelOpts)

      viewOpts.div = 'ide-canvas-container'
      document.querySelector(`#${viewOpts.div}`).innerHTML = ''
      
      view = new View(model, viewOpts, drawOpts)

      model.setup()
    }

    renderError({ setupError: null })
  } catch (e) {
    console.error(e)
    renderError({ setupError: e })
  }
}

initEditor()

window.rebuildModel = rebuildModel
