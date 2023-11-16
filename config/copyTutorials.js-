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

/**
 * All tutorials path with title.
 */

// third version: simpler data
const dirPath = dir => path.join(root, dir, 'README.md')
const pathData = [
    // [dir name, title]
    ['views2', 'View 2D'],
    ['views25', 'View 2.5D'],
    ['views3', 'View 3D'],
    ['leaflet', 'Leaflet'],
    ['maplibre', 'Map Libre'],
    ['mvc', 'MVC'],
]
const paths = pathData.map(a => ({ path: dirPath(a[0]), title: a[1] }))

// second version, in-line the paths to keep everything in one place
// const paths = [
//     {
//         path: dirPath('views2'),
//         title: 'View 2D',
//     },
//     {
//         path: dirPath('views25'),
//         title: 'View 2.5D',
//     },
//     {
//         path: dirPath('views3'),
//         title: 'View 3D',
//     },
//     {
//         path: dirPath('gis'),
//         title: 'GIS',
//     },
//     {
//         path: dirPath('mvc'),
//         title: 'MVC',
//     },
// ]

// Initial version
// const view2 = path.join(root, 'views2', 'README.md')
// const view25 = path.join(root, 'views25', 'README.md')
// const view3 = path.join(root, 'views3', 'README.md')
// const gis = path.join(root, 'gis', 'README.md')
// const mvc = path.join(root, 'mvc', 'README.md')
// const paths = [
//     {
//         path: view2,
//         title: 'View 2D',
//     },
//     {
//         path: view25,
//         title: 'View 2.5D',
//     },
//     {
//         path: view3,
//         title: 'View 3D',
//     },
//     {
//         path: gis,
//         title: 'GIS',
//     },
//     {
//         path: mvc,
//         title: 'MVC',
//     },
// ]

console.log(paths)

if (fs.existsSync(tutorialsDir)) {
    // Requires node > v14.14
    fs.rmSync(tutorialsDir, { recursive: true, force: true })
}
fs.mkdirSync(tutorialsDir)

// Doesn't seem to be used!
// const tutorialsConfig = {}
//
// paths.forEach(tutorial => {
//     tutorialsConfig[path.basename(tutorial.title)] = {
//         title: tutorial.title,
//     }
//
//     fs.copyFileSync(
//         tutorial.path,
//         path.join(tutorialsDir, `${tutorial.title}.md`)
//     )
// })
//
// fs.writeFileSync(
//     path.join(tutorialsDir, 'tutorials.json'),
//     JSON.stringify(tutorialsConfig)
// )

paths.forEach(tutorial => {
    fs.copyFileSync(
        tutorial.path,
        path.join(tutorialsDir, `${tutorial.title}.md`)
    )
})
