import test from 'ava'

const liveServer = require('live-server')
const puppeteer = require('puppeteer')
const shell = require('shelljs')

const port = 9008
const useWorkers = true
// const useWorkers = false // debug
const compareSamples = true

liveServer.start({
    open: false,
    logLevel: 0,
    ignore: '*',
    port: port,
})

const samplesFile = 'test/samples.txt' // Store model samples here
// const lastSamples = JSON.parse(shell.cat(samplesFile)) // Last set of samples
const lastSamples = shell.cat(samplesFile) // Last set of samples
const currentSamples = {} // This set of samples

let models = shell
    .ls('models/*Model.js') // Just the Model files
    .sed(/^models\//, '')
    .sed(/Model.js$/, '')
    .replace(/\n$/, '')
    .split('\n')
    .map(str => str.charAt(0).toLowerCase() + str.slice(1))

// models = ['flock'] // debug. Also headless below
// models = ['droplets'] // debug. Also headless below
// models = models.filter(m => m !== 'droplets')
// models = models.filter(m => !['droplets', 'gridPath'].includes(m))

shell.echo(models)

async function runModels() {
    for (const model of models) {
        await test.serial(model, async t => {
            const sample = await runModel(model)
            // console.log(model, sample)

            currentSamples[model] = sample
            const testSample = lastSamples[model]

            if (testSample && compareSamples) {
                t.is(sample, testSample)
            } else {
                t.pass()
            }

            if (model === models[models.length - 1]) {
                const json = JSON.stringify(currentSamples, null, 2)
                // Echo w/ to() still prints to terminal, alas.
                // Use ShellString stunt to avoid.
                // shell.echo(currentSamples).to(samplesFile)
                new shell.ShellString(json).to(samplesFile)
                // shell.echo(json).to(samplesFile)
            }
        })
    }
}
runModels()

async function runModel(model) {
    const url =
        useWorkers && model !== 'droplets' // use list of non-worker models
            ? `http://127.0.0.1:${port}/models/worker.html?${model}`
            : `http://127.0.0.1:${port}/models/test.html?${model}`

    const browser = await puppeteer.launch({
        args: [
            // Let model know it is being run by Puppeteer:
            '--user-agent=Puppeteer',
            // let workers use es6 imports
            // '--enable-experimental-web-platform-features',
            // Don't know if these still needed: CI needed a while back?
            // '--no-sandbox',
            // '--disable-setuid-sandbox',
        ],
        headless: true, // use false for useful debugging!
        // headless: false, // use false for useful debugging!
    })
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(200000)

    await page.goto(url)
    const sample = await page.evaluate(() => {
        return new Promise(resolve => {
            function waitOn() {
                if (window.modelSample) {
                    return resolve(window.modelSample)
                } else {
                    setTimeout(waitOn, 10)
                }
            }
            waitOn()
        })
    })
    await page.close()
    await browser.close()

    return sample
}
