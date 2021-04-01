import {EditorState, basicSetup} from "../snowpack/pkg/@codemirror/basic-setup.js"
import {EditorView, keymap} from "../snowpack/pkg/@codemirror/view.js"
import {defaultTabBinding} from "../snowpack/pkg/@codemirror/commands.js"
import {javascript} from "../snowpack/pkg/@codemirror/lang-javascript.js"
import _ from "../vendor/underscore-esm-min.js"
import html from '../vendor/nanohtml.es6.js';
import morph from '../vendor/nanomorph.es6.js';

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

let editor = window.editor = new EditorView({
  state: EditorState.create({
    doc: '',
    extensions: editorExtensions
  }),
  parent: document.querySelector(".ide-container")
})

let model
let view

let src = {
  model: null,
  view: null
}

let currentTab = 'model'

async function initEditor() {
  src.model = await fetch('./flock.model.js').then(res => res.text())
  src.view = await fetch('./flock.view.js').then(res => res.text())

  let urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('src.model')) {
    src.model = decodeURIComponent(atob(urlParams.get('src.model')))
  }
  if (urlParams.get('src.view')) {
    src.view = decodeURIComponent(atob(urlParams.get('src.view')))
  }

  renderEditor()

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

async function importSrcString(src) {
  const uri = 'data:text/javascript;charset=utf-8,'
    + encodeURIComponent(src)
  return await import(uri)
}

async function rebuildModel() {
  window.history.replaceState(null, null, `?src.model=${btoa(encodeURIComponent(src.model))}&src.view=${btoa(encodeURIComponent(src.view))}`)
  
  let Model = (await importSrcString(src.model)).default

  let {
    worldOpts,
    View,
    viewOpts
  } = await importSrcString(src.view)

  // debug
  window.Model = Model

  model = window.model = new Model(worldOpts)

  viewOpts.div = 'ide-canvas-container'
  document.querySelector(`#${viewOpts.div}`).innerHTML = ''
  
  view = new View(model, viewOpts)

  model.setup()
}

let lastWorldOpts
async function reloadModel(forceRebuild = false) {
  try {
    if (currentTab === 'model') {
      src.model = editor.state.doc
    } else if (currentTab === 'view') {
      src.view = editor.state.doc
    }

    window.history.replaceState(null, null, `?src.model=${btoa(encodeURIComponent(src.model))}&src.view=${btoa(encodeURIComponent(src.view))}`)
    
    let Model = (await importSrcString(src.model)).default

    let {
      worldOpts,
      View,
      viewOpts
    } = await importSrcString(src.view)

    for (let key of Object.getOwnPropertyNames(Model.prototype)) {
      window.model[key] = Model.prototype[key].bind(window.model)
    }

    let setupChanged = Model.prototype['setup'].toString() !== Object.getPrototypeOf(model).setup.toString()
    let worldOptsChanged = !lastWorldOpts || (JSON.stringify(worldOpts) !== JSON.stringify(lastWorldOpts))
    if (forceRebuild || setupChanged || worldOptsChanged) {
      console.log('rebuilding model and view')
      model = window.model = new Model(worldOpts)

      viewOpts.div = 'ide-canvas-container'
      document.querySelector(`#${viewOpts.div}`).innerHTML = ''
      
      view = new View(model, viewOpts)

      model.setup()
    }

    lastWorldOpts = worldOpts

    renderError({ setupError: null })
  } catch (e) {
    console.error(e)
    renderError({ setupError: e })
  }
}

function renderEditor() {
  // render code
  if (currentTab === 'model') {
    editor.setState(EditorState.create({ doc: src.model, extensions: editorExtensions }))
  } else {
    editor.setState(EditorState.create({ doc: src.view, extensions: editorExtensions }))
  }

  // render tabs
  function setTab(tab) {
    currentTab = tab
    renderEditor()
  }
  
  morph(document.querySelector('.tabs'), html`
    <div class="tabs">
      <div class="tab ${currentTab === 'model' ? 'active' : ''}" onclick=${() => setTab('model')}>Model</div>
      <div class="tab ${currentTab === 'view' ? 'active' : ''}" onclick=${() => setTab('view')}>View</div>
    </div>
  `)
}

initEditor()

window.reloadModel = reloadModel
