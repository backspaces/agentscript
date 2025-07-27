import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = 9100
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.static(__dirname, { extensions: ['html'] }))
app.use(express.text({ type: '*/*' }))

// Allow PUT to overwrite files in examples folder
// app.put('/examples/:folder/:filename', (req, res) => {
app.put('/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params
    // const filePath = path.join(__dirname, 'examples', folder, filename)
    const filePath = path.join(__dirname, folder, filename)

    console.log(`PUT ? ${filePath}`)

    fs.writeFile(filePath, req.body, err => {
        if (err) {
            console.error('? Write failed:', err)
            return res.status(500).send('Write failed')
        }
        res.sendStatus(200)
    })
})

app.listen(port, () => {
    console.log(`? Express IDE server running at http://localhost:${port}`)
})
