const fs = require('fs')
const path = require('path')

const root = path.join(__dirname)
const tutorialsDir = path.join(__dirname, 'tutorials')

// Tutorial paths
const view2 = path.join(root, 'views2', 'README.md')
const view3 = path.join(root, 'views3', 'README.md')
const view3d = path.join(root, 'views3d', 'README.md')
const gis = path.join(root, 'gis', 'README.md')
const mvc = path.join(root, 'mvc', 'README.md')
const ideExamples = path.join(root, 'ide-examples', 'README.md')


const paths = [
    {
        path: view2,
        title: "View 2"
    },
    {
        path: view3,
        title: "View 3"
    },
    {
        path: view3d,
        title: "View 3D"
    },
    {
        path: gis,
        title: "GIS"
    },
    {
        path: mvc,
        title: "MVC"
    },
    {
        path: ideExamples,
        title: "IDE Examples"
    },
]



if (fs.existsSync(tutorialsDir)) {
    // Requires node > v14.14
    fs.rmdirSync(tutorialsDir, { recursive: true, force: true })
    fs.mkdirSync(tutorialsDir)
} else {
    fs.mkdirSync(tutorialsDir)
}

const tutorialsConfig = {}

paths.forEach((tutorial) => {
    tutorialsConfig[path.basename(tutorial.title)] = {
        title: tutorial.title
    }

    fs.copyFileSync(tutorial.path, path.join(tutorialsDir, `${tutorial.title}.md`))
})

fs.writeFileSync(path.join(tutorialsDir, 'tutorials.json'), JSON.stringify(tutorialsConfig))