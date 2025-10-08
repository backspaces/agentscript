// import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'
import { getWebDAVClient } from '/examples/getWebDAVClient.js'
const [client, baseURL] = getWebDAVClient()

console.log('client', client)

const urlParams = new URLSearchParams(window.location.search)

function getUser() {
    let user = urlParams.get('user') // ✅ FIXED

    if (!user) {
        user = localStorage.getItem('agentscriptUser')
        if (!user) {
            const rand = Math.floor(Math.random() * 10000)
            user = `user-${rand}`
            localStorage.setItem('agentscriptUser', user)
        }
    }
    return user
}

async function ensureUserModelCopied(user, model) {
    const base = `/agentscript/users/${user}/${model}`
    const src = `/agentscript/ide/examples/${model}`

    try {
        // check if Model.js already exists
        await client.stat(`${base}/Model.js`)
        console.log(`✅ ${model} already exists for ${user}`)
    } catch {
        console.warn(`🛠 Copying ${model} to ${base}...`)
        try {
            // ensure user folder
            await client
                .createDirectory(`/agentscript/users/${user}`)
                .catch(err => {
                    if (err?.status !== 405 && err?.status !== 409) throw err
                })

            // ensure model folder
            await client.createDirectory(base).catch(err => {
                if (err?.status !== 405 && err?.status !== 409) throw err
            })

            const files = ['Model.js', 'View.js', 'index.html']
            for (const file of files) {
                console.log(`📤 Copying ${file}...`)
                await client.copyFile(`${src}/${file}`, `${base}/${file}`)
            }

            console.log(`✅ Copied ${model} to ${base}`)
        } catch (err) {
            console.error(`❌ Failed to copy ${model}:`, err)
        }
    }
}

const user = getUser()
const model = urlParams.get('model') || 'Ants'
const folder = `/agentscript/users/${user}/${model}`

await ensureUserModelCopied(user, model)

console.log('user', user)
console.log('model', model)
console.log('folder', folder)

document.getElementById('folderName').textContent = `${user}/${model}`

const modelPath = `${folder}/Model.js`
const viewPath = `${folder}/View.js`
const indexPath = `${folder}/index.html`

let currentFile = modelPath
const iframe = document.getElementById('preview')
const editor = document.getElementById('editor')

function loadIframe() {
    iframe.src =
        `https://agentscript.webdav.acequia.io:3334${indexPath}` +
        '?v=' +
        Date.now()
}

const fileMap = {
    [indexPath]: 'htmlBtn',
    [modelPath]: 'modelBtn',
    [viewPath]: 'viewBtn',
}

async function loadFile(path) {
    try {
        const code = await client.getFileContents(path, { format: 'text' })
        editor.textContent = code

        document.getElementById(fileMap[currentFile]).classList.remove('active')
        currentFile = path
        document.getElementById(fileMap[currentFile]).classList.add('active')
    } catch (err) {
        console.error('Failed to load', path, err)
    }
}

async function saveFile() {
    const newCode = editor.textContent
    try {
        await client.putFileContents(currentFile, newCode, { overwrite: true })
        loadIframe()
    } catch (err) {
        alert('Failed to save file')
        console.error(err)
    }
}

window.formatCode = function () {
    try {
        const parser = currentFile.endsWith('.html') ? 'html' : 'babel'
        const formatted = prettier.format(editor.textContent, {
            parser,
            plugins: prettierPlugins,
        })
        editor.textContent = formatted
    } catch (err) {
        console.error('Formatting failed:', err)
    }
}

// Load initial Model.js and iframe
loadFile(indexPath)
loadIframe()

let timeout
editor.addEventListener('input', () => {
    clearTimeout(timeout)
    timeout = setTimeout(saveFile, 500)
})

document
    .getElementById('htmlBtn')
    .addEventListener('click', () => loadFile(indexPath))
document
    .getElementById('modelBtn')
    .addEventListener('click', () => loadFile(modelPath))
document
    .getElementById('viewBtn')
    .addEventListener('click', () => loadFile(viewPath))

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const folderName = document.getElementById('folderName').textContent.trim()

    try {
        const modelText = await client.getFileContents(modelPath, {
            format: 'text',
        })
        const viewText = await client.getFileContents(viewPath, {
            format: 'text',
        })
        const htmlText = await client.getFileContents(indexPath, {
            format: 'text',
        })

        const zip = new JSZip()
        const zipFolder = zip.folder(folderName.split('/').pop())
        zipFolder.file('Model.js', modelText)
        zipFolder.file('View.js', viewText)
        zipFolder.file('index.html', htmlText)

        const blob = await zip.generateAsync({ type: 'blob' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${folderName}.zip`
        a.click()
    } catch (err) {
        alert('Failed to create zip')
        console.error(err)
    }
})
