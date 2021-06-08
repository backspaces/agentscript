// deno run --allow-read --allow-net deno/image.js
import * as util from 'http://code.agentscript.org/src/utils.js'
import { Image } from 'https://deno.land/x/imagescript@1.1.13/mod.ts'

// const file = await Deno.open('./deno/data/redfish.png')
// const file = await Deno.readFileSync('./deno/data/redfish.png')

function tileUrl(z, x, y) {
    return `https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/${z}/${x}/${y}.png`
}
const url = tileUrl(13, 1594, 3339)
console.log(url)
// const file = await Deno.readFileSync(url)
let abuf = await fetch(url).then(response => response.arrayBuffer())
// .then(blob => blob.arrayBuffer())

console.log(abuf)

// const image = new Image(100, 100)
let img = await Image.decode(abuf)
console.log(img, img.width, img.height)

// let extent =

// const file = await fetch(url)
//     .then(response => {
//         if (!response.ok) throw Error('danm')
//         return response.blob()
//         // return response.arrayBuffer()
//     })
//     .then(blob => blob.arrayBuffer())
