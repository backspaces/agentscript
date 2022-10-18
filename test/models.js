import test from 'ava'

// does not have the crlf problem
// const liveServer = require('live-server')
// const httpServer = require('http-server')

const puppeteer = require('puppeteer')
const shell = require('shelljs')

const headless = true
const port = 9008
const useWorkers = true
const compareSamples = true
const debug = false
const nonWorker = model => [].includes(model)
// const nonWorker = model => ['droplets'].includes(model)

// liveServer.start({
//     open: false,
//     logLevel: 0,
//     ignore: '*',
//     port: port,
// })
const child = shell.exec(`http-server -s -p ${port}`, {
    async: true,
    silent: true,
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

// if (!headless) models = ['droplets', 'mouse'] // debug. Also headless below
// models = ['hello', 'droplets'] // debug. Also headless below
// models = models.filter(m => m !== 'droplets')
// models = models.filter(m => !['droplets', 'gridPath'].includes(m))

shell.echo(models)
shell.echo('using Workers:', useWorkers)

async function runModels() {
    for (const model of models) {
        if (debug) console.log('model', model)
        await test.serial(model, async t => {
            if (debug) console.log('calling runModel')
            const sample = await runModel(model)
            if (debug) console.log('sample', sample)

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

                child.kill()
            }
        })
    }

    // child.kill()
}
runModels()

async function runModel(model) {
    const url =
        useWorkers && !nonWorker(model) // use list of non-worker models
            ? `http://127.0.0.1:${port}/models/worker.html?${model}`
            : `http://127.0.0.1:${port}/models/test.html?${model}`
    if (debug) console.log('in runModel, url = ', url)
    // ? `http://localhost/src/agentscript/models/worker.html?${model}`
    // : `http://localhost/src/agentscript/models/test.html?${model}`

    const browser = await puppeteer.launch({
        args: ['--user-agent=Puppeteer'], // model: show being run by Puppeteer
        headless: headless, // use for useful debugging!
    })
    if (debug) console.log('puppeteer launched, browser = ', browser)

    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(200000)
    if (debug) console.log('browser.newPage() = ', page)

    await page.goto(url)
    if (debug) console.log('called page.goto(url), calling page.evaluate')
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
    if (debug) console.log('returned from page.evaluate, sample: ', sample)

    await page.close()
    await browser.close()

    return sample
}
