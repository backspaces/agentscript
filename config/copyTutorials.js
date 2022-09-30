const fs = require('fs')
const path = require('path')

// Moved from root/ root/config/
// const root = path.join(__dirname)
// const tutorialsDir = path.join(__dirname, 'tutorials')
const root = process.cwd()
const tutorialsDir = path.join(root, 'tutorials')
console.log(root)
console.log(tutorialsDir)

// Tutorial paths
const view2 = path.join(root, 'views2', 'README.md')
const view25 = path.join(root, 'views25', 'README.md')
const view3 = path.join(root, 'views3', 'README.md')
const gis = path.join(root, 'gis', 'README.md')
const mvc = path.join(root, 'mvc', 'README.md')
// const ideExamples = path.join(root, 'ide-examples', 'README.md') ., see below
console.log(mvc)
/**
 * All tutorials path with title.
 */
const paths = [
    {
        path: view2,
        title: 'View 2D',
    },
    {
        path: view25,
        title: 'View 2.5D',
    },
    {
        path: view3,
        title: 'View 3D',
    },
    {
        path: gis,
        title: 'GIS',
    },
    {
        path: mvc,
        title: 'MVC',
    },
    // { ideExamples are not used, waiting our our IDE!
    //     path: ideExamples,
    //     title: "IDE Examples"
    // },
]

// (node:82925) [DEP0147] DeprecationWarning: In future versions of Node.js,
// fs.rmdir(path, { recursive: true }) will be removed.
// Use fs.rm(path, { recursive: true }) instead

if (fs.existsSync(tutorialsDir)) {
    // Requires node > v14.14
    fs.rmSync(tutorialsDir, { recursive: true, force: true })
}
fs.mkdirSync(tutorialsDir)

// if (fs.existsSync(tutorialsDir)) {
//     // Requires node > v14.14
//     fs.rmSync(tutorialsDir, { recursive: true, force: true })
//     fs.mkdirSync(tutorialsDir)
// } else {
//     fs.mkdirSync(tutorialsDir)
// }
// if (fs.existsSync(tutorialsDir)) {
//     // Requires node > v14.14
//     fs.rmdirSync(tutorialsDir, { recursive: true, force: true })
//     fs.mkdirSync(tutorialsDir)
// } else {
//     fs.mkdirSync(tutorialsDir)
// }

const tutorialsConfig = {}

paths.forEach(tutorial => {
    tutorialsConfig[path.basename(tutorial.title)] = {
        title: tutorial.title,
    }

    fs.copyFileSync(
        tutorial.path,
        path.join(tutorialsDir, `${tutorial.title}.md`)
    )
})

fs.writeFileSync(
    path.join(tutorialsDir, 'tutorials.json'),
    JSON.stringify(tutorialsConfig)
)
