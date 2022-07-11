import * as util from '../src/utils.js'

// Uses top level await to read css files (and add to <head>)
await util.fetchCssStyle('https://unpkg.com/leaflet/dist/leaflet.css')
await util.fetchCssStyle('./map.css')

// debug:
const styles = Array.from(document.head.children).filter(
    c => util.typeOf(c) === 'htmlstyleelement'
)
console.log(styles)

export default styles
