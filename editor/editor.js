// import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'
import { getWebDAVClient } from './getWebDAVClient.js'
const [client, baseURL] = getWebDAVClient()

console.log('client', client)

const urlParams = new URLSearchParams(window.location.search)
const user = urlParams.get('user') || 'bob'
const model = urlParams.get('model') || 'Ants'
const folder = `/agentscript/users/${user}/${model}`

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
