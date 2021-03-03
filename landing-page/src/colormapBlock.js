import * as util from 'https://cdn.skypack.dev/agentscript/src/utils.js'
import html from '../vendor/nanohtml.es6.js';

export const renderColorMapBlock = ({ codeContent }) => {
  let colorMap
  try {
    colorMap = eval(codeContent)
  } catch (e) {
    console.log(e)
    return
  }
  const canvas = util.createCanvas(colorMap.length, 1)
  const ctx = canvas.getContext('2d')
  colorMap.forEach((color, index) => {
    ctx.fillStyle = color.css
    ctx.fillRect(index, 0, 1, 1)
  })
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style['image-rendering'] = 'pixelated'

  // Prevent nanomorph from simply changing the canvas attributes instead of replacing
  // the entire element. See: https://github.com/choojs/nanomorph#prevent-morphing-particular-elements
  canvas.setAttribute('data-nanomorph-component-id', parseInt(1000 * Math.random()))
  
  return html`<div style="height: 40px; width: 100%; margin-top: 20px;">${canvas}</div>`
}