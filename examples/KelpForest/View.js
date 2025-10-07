import TwoDraw from '/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 20,
        drawOptions: {
            turtlesSize: t => {
                if (t.breed.name === 'urchin') return 1
                if (t.breed.name === 'kelp') return 2
                return 1.5 // seaStar
            },
            turtlesColor: t => {
                if (t.breed.name === 'urchin') return 'purple'
                if (t.breed.name === 'kelp') return 'green'
                return 'orange' // seaStar
            },
            turtlesShape: t => {
                if (t.breed.name === 'urchin') return 'circle'
                if (t.breed.name === 'kelp') return 'dart'
                return 'pentagon' // seaStar
            },
        },
    })
}
