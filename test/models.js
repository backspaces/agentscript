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
    ants:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","population","speed","maxPheromone","diffusionRate","evaporationRate","wiggleAngle","modelDone"],"patches":6561,"patch":{"id":4228,"isFood":false,"isNest":false,"foodPheromone":0.2786201326777384,"nestPheromone":0.0003394546214499573,"_diffuseNext":0,"neighbors":[4146,4147,4148,4229,4310,4309,4308,4227]},"turtles":255,"turtle":{"id":137,"theta":1.9848532531501206,"x":-15.749383890402344,"y":5.916090567673656,"carryingFood":false,"pheromone":0.09586246074836942},"links":0}',
    buttons:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","population","clusterSize","done","newCluster","modelDone"],"patches":1089,"patch":{"id":607},"turtles":200,"turtle":{"id":154,"theta":3.9992897360690383,"x":8,"y":-10,"links":[8,60,104,195,294,296,335,421,494]},"links":500,"link":{"id":83,"end0":{"id":175,"theta":4.773036644214088,"x":-1,"y":14,"links":[68,80,83,94,113,235,273,284,304,334]},"end1":{"id":8,"theta":2.385314704793288,"x":0,"y":3,"links":[83,138,204,311]}}}',
    diffuse:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","population","speed","maxPheromone","diffusionRate","evaporationRate","wiggleAngle","modelDone"],"patches":6561,"patch":{"id":4228,"isFood":false,"isNest":false,"foodPheromone":0.2786201326777384,"nestPheromone":0.0003394546214499573,"_diffuseNext":0,"neighbors":[4146,4147,4148,4229,4310,4309,4308,4227]},"turtles":255,"turtle":{"id":137,"theta":1.9848532531501206,"x":-15.749383890402344,"y":5.916090567673656,"carryingFood":false,"pheromone":0.09586246074836942},"links":0}',
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
    linktravel:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","layoutCircle","numNodes","numDrivers","speed","speedDelta","nodes","drivers","modelDone"],"patches":1089,"patch":{"id":2},"turtles":130,"turtle":{"id":81,"theta":-3.036872898470133,"x":8.356473573627738,"y":-7.987043302307197,"fromNode":{"id":10,"theta":-0.5235987755982987,"x":12.99038105676658,"y":-7.499999999999997,"links":[16,17,35]},"toNode":{"id":19,"theta":-2.4085543677521746,"x":-11.147172382160912,"y":-10.036959095382874,"links":[34,35,48]},"speed":0.1164858085256869},"links":56,"link":{"id":15,"end0":{"id":9,"theta":-0.3141592653589793,"x":14.265847744427303,"y":-4.635254915624211,"links":[14,15,17,18,24,37]},"end1":{"id":4,"theta":0.7330382858376184,"x":11.147172382160914,"y":10.036959095382873,"links":[4,5,7,9,12,15,19,23,49]}}}',
    tsp:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","nodeCount","travelersCount","growPopulation","useInversion","stopTickDifference","nodes","travelers","done","bestTourNodes","bestTourLength","bestTourTick","modelDone"],"patches":10201,"patch":{"id":5700},"turtles":150,"turtle":{"id":9,"theta":6.048065976382463,"x":10,"y":43,"links":[6011,6012]},"links":50,"link":{"id":6011,"end0":{"id":28,"theta":3.0789942689603693,"x":1,"y":45,"links":[6010,6011]},"end1":{"id":9,"theta":6.048065976382463,"x":10,"y":43,"links":[6011,6012]}}}',
    walkers:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","population","speed","speedDelta","wiggle","modelDone"],"patches":1089,"patch":{"id":289},"turtles":10,"turtle":{"id":0,"theta":5.197330998836827,"speed":0.09072932505815227,"x":-15.240697697467809,"y":-6.576199881118134},"links":0}',
    wallfollower:
        '{"model":["worldOptions","ticks","world","patches","turtles","links","population","wallPercent","walls","lefty","righty","modelDone"],"patches":5041,"patch":{"id":1842,"neighbors4":[1771,1843,1913,1841]},"turtles":40,"turtle":{"id":8,"theta":4.71238898038469,"x":-3.0000000000000107,"y":2},"links":0}',
    water:
        '{"model":["worldOptions","world","patches","turtles","links","strength","surfaceTension","friction","modelDone"],"patches":10201,"patch":{"id":1371,"zpos":-0.4077752004758064,"deltaZ":-0.036026089818331775,"neighbors4":[1270,1372,1472,1370]},"turtles":0,"links":0}',
}
