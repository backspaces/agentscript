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

import {EditorState, basicSetup} from "@codemirror/basic-setup"
import {EditorView, keymap} from "@codemirror/view"
import {defaultTabBinding} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"

let editorExtensions = [
  basicSetup,
  keymap.of([defaultTabBinding]),
  javascript()
]
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
    model.step()
    view.draw()

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

  model = window.model = new Model(modelOpts)

  viewOpts.div = 'ide-canvas-container'
  document.querySelector(`#${viewOpts.div}`).innerHTML = ''
  
  view = new View(model, viewOpts, drawOpts)

  model.setup()
}

initEditor()

window.rebuildModel = rebuildModel
