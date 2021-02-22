import morph from '../vendor/nanomorph.es6.js';
import html from '../vendor/nanohtml.es6.js';
import onLoad from '../vendor/on-load.es6.js';

export class CodeBlock {
  constructor(model) {
    // super()
    this.model = model
    this.isRunning = false
  }
  createElement(opts) {
    this.opts = opts
    let { codeContent, hasForeverButton } = opts
    let foreverButtonEl = html`
      <div class="button forever ${ this.isRunning ? 'running' : '' }" onclick="${() => this.toggleRunForever()}">${ this.isRunning ? 'stop running' : 'run forever' }</div>
    `;
    
    // It looks here like we create a new textarea on every render, but
    // we really always reuse the same one because isSameNode always returns true
    let textAreaEl = html`<textarea class="code" onkeydown="${(e) => this.handleEnterKey(e)}">${codeContent}</textarea>`
    textAreaEl.isSameNode = () => true // never rerender the textarea
    
    if (!this.textAreaEl) {
      this.textAreaEl = textAreaEl
    }

    let codeblockEl = html`
      <div class="code-block">
        ${textAreaEl}
        <div class="code-buttons">
          <div class="button" onclick="${() => this.runOnce()}">run once</div>
          ${hasForeverButton ? foreverButtonEl : ''}
        </div>
      </div>
    `
    
    return codeblockEl
  }
  render(opts) {
    this.lastOpts = opts
    if (!this.element) {
      this.element = this.createElement(opts)
      onLoad(this.element, (el) => this.afterRender(el))
    } else {
      this.element = morph(this.element, this.createElement(opts))
    }
    return this.element
  }
  rerender() {
    this.render(this.lastOpts)
  }
  afterRender(el) {
    this.textAreaEl.style.height = this.textAreaEl.scrollHeight + 5 + 'px'
  }
  handleEnterKey(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      this.runOnce()
    }
  }
  runOnce() {
    // this.textAreaEl = this.element.querySelector('textarea')
    let currentCode = this.textAreaEl.value
    let fn = new Function(currentCode.replaceAll('model.', 'this.model.'))
    fn.apply(this)
  }
  runForever() {
    if (this.isRunning) {
      this.runOnce()
      this.runForeverTimeout = setTimeout(() => this.runForever(), 20)
    }
  }
  toggleRunForever() {
    if (!this.isRunning) {
      this.isRunning = true
      this.runForever()
    } else {
      this.isRunning = false
      clearTimeout(this.runForeverTimeout)
    }
    this.rerender()
  }
}
