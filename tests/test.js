// import { setCssStyle } from '../src/utils.js'

// import css from 'https://unpkg.com/uplot/dist/uPlot.min.css'
import css from 'https://cdn.skypack.dev/uplot/dist/uPlot.min.css'
document.head.innerHTML += `<style>${css}</style>`

// class Test {
//     two = 2
//     constructor() {
//         this.one = 1
//     }
// }

// async function run() {
//     await setCssStyle('https://unpkg.com/uplot/dist/uPlot.min.css')
//     // export default Test
// }
// // await run() // fails: await only w/in an async function
// run()

console.log(document.head)

// export default Test
