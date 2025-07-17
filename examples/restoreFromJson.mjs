// restoreFromJson.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Support ES module __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const filename = process.argv[2]
if (!filename) {
    console.error('Usage: node path/to/restoreFromJson.js <filename>.json')
    process.exit(1)
}

const jsonPath = path.resolve(process.cwd(), filename)
const raw = fs.readFileSync(jsonPath, 'utf-8')
const { folder, files } = JSON.parse(raw)

// Unpack into CWD
const folderPath = path.join(process.cwd(), folder)
fs.mkdirSync(folderPath, { recursive: true })

for (const [name, content] of Object.entries(files)) {
    const filePath = path.join(folderPath, name)
    fs.writeFileSync(filePath, content)
    console.log(`📝 Created: ${folder}/${name}`)
}

console.log(`✅ Restored to ./` + folder)
