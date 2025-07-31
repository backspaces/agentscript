import { AuthType, createClient } from 'https://esm.sh/webdav@5.8.0'
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm'

const webdavServer = 'https://agentscript.webdav.acequia.io:3334/'

const token =
    'eyJhbGciOiJQUzI1NiIsImtpZCI6Ik9uU1RDMDhjbXhWendBMUtrb3YxdDNTQ3RNUWtyR3FOa1RzN1NjSHhlM28ifQ.eyJzdWJkb21haW4iOiJhZ2VudHNjcmlwdCIsInJvbGVzIjpbImFkbWluIl0sInN1YiI6ImV5M3FweDR2dDg5aWd0YzhvajhoZzJ3aiIsImlhdCI6MTc1MzEyNDczMSwiaXNzIjoiZXkzcXB4NHZ0ODlpZ3RjOG9qOGhnMndqIn0.2kdGyLZ64QNNTzEs4sNDK1dL0rclxOWtD_HiQTOXiiw1V0x_qIpvnM7l9bvKId7XHLePc1YnzaBwf0P2RjGb092YcwMK_4phospSWjRWSLU4nYRZcjvnV2xJ3c8IlBsmFI4Kw7k5BlSrvi5tznjwyNt5PZwn5XMwtdRG-qBktSbY3JJGxNFflFdyxPVWoPQNdXBHg-JFNNzQ6YcIvrr5R0L3RabX6M45tuNbcF0IBDDD2jO_NXSIPyTbcfvau5AyyQaP0vrLJqxaP_InRVj7JGoymyIZbxgmSS5edA_mzUPZ4LZfZEZ10Ukc0WYQzXpRwVVmYtbYkoILyEfum_1QEQ'

const client = createClient(webdavServer, {
    authType: AuthType.Token,
    token: {
        token_type: 'Bearer',
        access_token: token,
    },
})

const urlParams = new URLSearchParams(window.location.search)
const user = urlParams.get('user') || 'bob'
const model = urlParams.get('model') || 'Template'
const folder = `agentscript/users/${user}/${model}`

console.log('user', user)
console.log('model', model)
console.log('folder', folder)

document.getElementById('folderName').textContent = `${user}/${model}`

const modelPath = `${folder}/Model.js`
const viewPath = `${folder}/View.js`
// const indexPath = `${folder}/index.html`
const indexPath = `https://agentscript.webdav.acequia.io:3334/${folder}/index.html`

console.log('modelPath', modelPath)
console.log('viewPath', viewPath)
console.log('indexPath', indexPath)

let currentFile = modelPath
const iframe = document.getElementById('preview')
const editor = document.getElementById('editor')

function loadIframe() {
    iframe.src = indexPath + '?v=' + Date.now()
}

async function loadFile(path) {
    try {
        const code = await client.getFileContents(path, { format: 'text' })
        editor.textContent = code
        currentFile = path
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

debugger

// Load initial Model.js and iframe
loadFile(modelPath)
loadIframe()

let timeout
editor.addEventListener('input', () => {
    clearTimeout(timeout)
    timeout = setTimeout(saveFile, 500)
})

document
    .getElementById('modelBtn')
    .addEventListener('click', () => loadFile(modelPath))
document
    .getElementById('viewBtn')
    .addEventListener('click', () => loadFile(viewPath))

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const folderName = document.getElementById('folderName').textContent.trim()

    const modelText = await fetch(`${folder}/Model.js`).then(r => r.text())
    const viewText = await fetch(`${folder}/View.js`).then(r => r.text())
    const htmlText = await fetch(`${folder}/index.html`).then(r => r.text())

    const zip = new JSZip()
    const zipFolder = zip.folder(folderName.split('/').pop())
    zipFolder.file('Model.js', modelText)
    zipFolder.file('View.js', viewText)
    zipFolder.file('index.html', htmlText)

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${folderName}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Clean up the object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000)
})
