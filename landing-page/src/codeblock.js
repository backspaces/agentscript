import Nanocomponent from '../vendor/nanocomponent.es6.js';
import html from '../vendor/nanohtml.es6.js';

export class CodeBlock extends Nanocomponent {
  constructor(model) {
    super()
    this.model = model
    this.isRunning = false
  }
  createElement(opts) {
    this.opts = opts
    let { codeContent, hasForeverButton } = opts
    let foreverButtonEl = html`
      <div class="button forever ${ this.isRunning ? 'running' : '' }" onclick="${() => this.toggleRunForever()}">${ this.isRunning ? 'stop running' : 'run forever' }</div>
    `;
    let textAreaEl = html`<textarea class="code">${codeContent}</textarea>`
    textAreaEl.isSameNode = () => true // never rerender the textarea
    return html`
      <div class="code-block">
        ${textAreaEl}
        <div class="code-buttons">
          <div class="button" onclick="${() => this.runOnce()}">run once</div>
          ${hasForeverButton ? foreverButtonEl : ''}
        </div>
      </div>
    `
  }
  load(el) {
    console.log('resizing')
    let textAreaEl = el.querySelector('textarea')
    textAreaEl.style.height = textAreaEl.scrollHeight + 5 + 'px'
  }
  runOnce() {
    let fn = new Function(this.opts.codeContent.replaceAll('model.', 'this.model.'))
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
