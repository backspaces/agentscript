import * as util from 'https://agentscript.org/src/utils.js'
import HelloModel from 'https://agentscript.org/models/HelloModel.js'
import {
    createCanvas,
    dataURLtoFile,
    loadImage,
} from 'https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/master/mod.ts'
import PatchesView from './DenoPatchesView.js'
// deno run --allow-read --allow-net deno/helloview.js

// const canvas = createCanvas(200, 200)
// const ctx = canvas.getContext('2d')

async function run() {
    console.log(`Running for 500 steps. Takes a while!`)

    const model = new HelloModel()
    await model.startup()
    model.setup()

    await util.timeoutLoop(() => {
        model.step()
    }, 500)

    const sample = util.sampleModel(model)
    console.log(sample)

    return model
}
const model = await run()

const patchSize = 20
const { width, height } = model.world

const pview = new PatchesView(width, height)
// console.log(patchesView)
const { ctx, canvas, imageData } = pview
// console.log(imageData) //, ctx)

// import Canvas from 'https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/master/mod.ts'

// import Canvas from 'https://deno.land/x/canvas@v.1.0.5'
// import Canvas, {
//     CanvasRenderingContext2D,
//     dataURLtoFile,
// } from 'https:/import/deno.land/x/canvas@vv.1.0.5/mod.ts'

// import Canvas, {
//     CanvasRenderingContext2D,
//     dataURLtoFile,
// } from 'https://deno.land/x/canvas@v1.0.0/mod.ts'

// import {
//     createCanvas,
//     CanvasRenderingContext2D,
//     dataURLtoFile,
// } from 'https://deno.land/x/canvas@v1.0.0/mod.ts'
