// deno [OPTIONS] [SUBCOMMAND]
import * as util from 'https://code.agentscript.org/src/utils.js'
import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'

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
}
run()
