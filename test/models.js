import test from 'ava'
const liveServer = require('live-server')
const puppeteer = require('puppeteer')
const shell = require('shelljs')

liveServer.start({
    open: false,
    logLevel: 0,
    ignore: '*',
})

const models = shell
    .ls('models/[a-z]*.js') // Avoid FooModel.js, just foo.js
    .sed(/^models./, '')
    .sed(/.js$/, '')
    .replace(/\n$/, '')
    .split('\n')
shell.echo(models)

const delay = (seconds = 1) =>
    new Promise(resolve => setTimeout(resolve, seconds * 1000))

const puppeteerHeadless = true
const [width, height] = [500, 500]

models.forEach(async model => {
    await test.serial(model, async t => {
        // const url = `http://127.0.0.1:8080/docs/models/?${model}`
        const url = `http://127.0.0.1:8080/models/?${model}`
        // Let model know it is being run by Puppeteer:
        const browser = await puppeteer.launch({
            args: [
                '--user-agent=Puppeteer',
                `--window-size=${width},${height}`,
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            headless: puppeteerHeadless,
        })
        const page = await browser.newPage()
        // await page.setViewport({ width, height })
        await page.setDefaultNavigationTimeout(200000)

        await page.goto(url)
        // Typically modelDone returns true immediately!
        while (!(await page.evaluate(() => window.modelDone))) {
            console.log('Puppeteer waiting till model done:', model)
            await delay()
        }

        const testSample = testSamples[model]
        const sample = await page.evaluate('model.modelSample')
        console.log(`\nTesting: ${model} ${url}\n${model}: '${sample}',`)
        if (testSamples[model]) {
            t.is(testSample, testSamples[model])
        } else {
            t.pass()
        }
        if (!puppeteerHeadless) await delay(2)

        await page.close()
        await browser.close()
    })
})

const testSamples = {
    diffuse:
        '{"model":["worldOptions","world","patches","turtles","links","population","radius","modelDone"],"patches":80601,"patch":{"id":45451,"ran":0.5300913129775815,"_diffuseNext":0,"neighbors":[45049,45050,45051,45452,45853,45852,45851,45450]},"turtles":2,"turtle":{"id":1,"theta":3.629027286903738,"x":141.86152785070743,"y":77.14560949853987},"links":0}',

    droplets:
        '{"model":["worldOptions","world","patches","turtles","links","stepType","killOffworld","elevation","dzdx","dzdy","slope","aspect","speed","localMins","modelDone"],"patches":10201,"patch":{"id":5057,"elevation":1729.07421875,"aspect":4.363121122510324,"neighbors":[4955,4956,4957,5058,5159,5158,5157,5056],"turtles":[]},"turtles":10201,"turtle":{"id":7694,"theta":5.176785652915809,"x":-4.519901971517734,"y":-21.148097732906376},"links":0}',

    exit:
        '{"model":["worldOptions","world","patches","turtles","links","exits","inside","wall","numExits","population","modelDone"],"patches":5041,"patch":{"id":4012,"neighbors4":[3941,4013,4083,4011],"turtles":[],"neighbors":[3940,3941,3942,4013,4084,4083,4082,4011]},"turtles":9,"turtle":{"id":1039,"theta":-0.7853981633974483,"x":15,"y":-22,"exit":{"id":4313,"turtles":[]}},"links":0}',

    fire:
        '{"model":["worldOptions","world","patches","turtles","links","fires","embers","patchTypes","dirtType","treeType","fireType","density","burnedTrees","initialTrees","modelDone"],"patches":63001,"patch":{"id":52543,"type":"ember0","neighbors4":[52292,52544,52794,52542]},"turtles":0,"links":0}',

    flock:
        '{"model":["worldOptions","world","patches","turtles","links","maxTurn","vision","minSeparation","population","modelDone"],"patches":1089,"patch":{"id":73,"turtles":[]},"turtles":1000,"turtle":{"id":702,"theta":0.22358752713079966,"x":14.132476741749116,"y":-8.828664512153638},"links":0}',

    hello:
        '{"model":["worldOptions","world","patches","turtles","links","modelDone"],"patches":1089,"patch":{"id":927},"turtles":10,"turtle":{"id":3,"theta":2.7061032805170213,"x":-11.510946140955705,"y":-5.2732108535965985,"links":[3,4]},"links":10,"link":{"id":9,"end0":{"id":9,"theta":-3.3554230749809055,"x":-11.573610523130423,"y":2.336477979400482,"links":[3,9]},"end1":{"id":5,"theta":-0.44541933510977116,"x":15.22704526570047,"y":-16.193063366898038,"links":[5,9]}}}',

    links:
        '{"model":["worldOptions","world","patches","turtles","links","modelDone"],"patches":1089,"patch":{"id":29,"data":18.602775287444494},"turtles":1000,"turtle":{"id":599,"theta":-3.9367635259649543,"speed":0.03751516450896409,"links":[521,639],"x":16.26826336890812,"y":5.787866167151324},"links":709,"link":{"id":398,"end0":{"id":433,"theta":2.4317561386909046,"speed":0.029626690521488613,"links":[398],"x":-1.7391858434302705,"y":12.859325765101936},"end1":{"id":464,"theta":-0.415126099473188,"speed":0.04392360805899241,"links":[398,661,673],"x":-13.069989791023367,"y":-5.613949040818139},"data":8}}',

    test:
        '{"model":["worldOptions","world","patches","turtles","links","modelDone"],"patches":1089,"patch":{"id":1042},"turtles":1000,"turtle":{"id":847,"theta":0.06518531533645179,"data":0.3095972803976361,"links":[44,404],"x":4.989380947600663,"y":0.3256958085700967},"links":712,"link":{"id":601,"end0":{"id":736,"theta":4.380421401984836,"data":0.2792722358640956,"links":[601],"x":-1.6295190621506648,"y":-4.72701466319787},"end1":{"id":220,"theta":0.0571564054412216,"data":0.4665967027811303,"links":[218,601],"x":4.9918350864545875,"y":0.2856264512281762},"data":63}}',

    turtles:
        '{"model":["worldOptions","world","patches","turtles","links","modelDone"],"patches":1089,"patch":{"id":624},"turtles":10000,"turtle":{"id":758,"theta":5.215523556289598,"speed":0.04402307923326556,"x":8.389262507841408,"y":12.916766215385438},"links":0}',

    water:
        '{"model":["worldOptions","world","patches","turtles","links","strength","surfaceTension","friction","modelDone"],"patches":10201,"patch":{"id":1371,"zpos":-0.4077752004758064,"deltaZ":-0.036026089818331775,"neighbors4":[1270,1372,1472,1370]},"turtles":0,"links":0}',
}
