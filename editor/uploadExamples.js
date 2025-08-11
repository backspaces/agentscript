// Upload all local models in ./examples/ to the WebDAV examples folder
// deno -A uploadExamples.js

// import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'
import { getWebDAVClient } from './getWebDAVClient.js'
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts'

const [client, baseURL] = getWebDAVClient('acequia') /// 'deno' or 'acequia'
console.log('client', client)
console.log('baseURL', baseURL)

const LOCAL_EXAMPLES_DIR = './examples'
const REMOTE_BASE = '/agentscript/ide/examples/'

if (!(await client.exists(REMOTE_BASE))) {
    await client.createDirectory(REMOTE_BASE)
    console.log('📁 Created:', REMOTE_BASE)
} else {
    console.log(`📁 ${REMOTE_BASE} Already exists`)
}

// --- Upload a single model folder ---
async function uploadExample(modelName) {
    const localDir = join(LOCAL_EXAMPLES_DIR, modelName)
    const remoteDir = REMOTE_BASE + modelName + '/'

    try {
        if (!(await client.exists(remoteDir))) {
            await client.createDirectory(remoteDir)
            console.log(`📁 Created remote folder: ${remoteDir}`)
        }

        for (const filename of ['index.html', 'Model.js', 'View.js']) {
            const localPath = join(localDir, filename)
            const remotePath = remoteDir + filename

            try {
                const content = await Deno.readTextFile(localPath)
                await client.putFileContents(remotePath, content, {
                    overwrite: true,
                })
                console.log(`✅ Uploaded: ${remotePath}`)
            } catch (err) {
                console.warn(`⚠️ Skipped missing file: ${localPath}`)
            }
        }
    } catch (err) {
        console.error(`❌ Failed to upload ${modelName}:`, err)
    }
}

// --- Main Loop ---
const entries = []
for await (const dirEntry of Deno.readDir(LOCAL_EXAMPLES_DIR)) {
    if (dirEntry.isDirectory) entries.push(dirEntry.name)
}

console.log(`🚀 Uploading ${entries.length} models to WebDAV...`)
for (const modelName of entries) {
    await uploadExample(modelName)
}
console.log('✅ Done.')
