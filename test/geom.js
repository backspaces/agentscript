import {
    toRad,
    toDeg,
    headingToRad,
    radToHeading,
    precision,
} from '../src/utils.js'
import Model from '../src/Model3D.js'
import {
    assert,
    // assertEquals,
} from 'https://deno.land/std@0.92.0/testing/asserts.ts'

// const { toRad, toDeg, headingToRad, radToHeading, precision } = util
const { PI, abs } = Math

// const toDeg = 180 / Math.PI
// const toRad = Math.PI / 180
// function headingToRad(heading) {
//     const deg = mod360(90 - heading)
//     return deg * toRad
// }
// function mod360(degrees) {
//     return mod(degrees, 360)
// }

// const p = num => precision(num, 10)
const epsilon = 1e-10
const areEqual = (a, b) => {
    const eq = abs(a - b) < epsilon
    if (!eq) console.log(`!eq: ${a} ${b}`)
    assert(eq)
}
const areAllEqual = (A, B) => {
    if (A.length === B.length) {
        A.forEach((val, i) => areEqual(val, B[i]))
    } else {
        throw Error(`!areAllEqual: arrays ${A.toString()} ${B.toString()}`)
    }
}

class Turtle extends Model {
    setup() {
        const t = this.turtles.createOne()
    }
}
const model = new Turtle()
model.setup()
const t = model.turtles.first()

// =========== tests ===========

Deno.test('reset', () => {
    t.reset()
    areEqual(t.theta, PI / 2)
    areEqual(t.heading, 0)

    areEqual(t.pitch, 0)
    areEqual(t.roll, 0)
    areEqual(t.x, 0)

    areAllEqual([0, 0, 0], t.getxyz())
    areAllEqual([0, 0, PI / 2], t.getRotation())
})

Deno.test('heading pitch roll', () => {
    t.reset()

    t.heading = 45
    areEqual(t.theta, PI / 4)
    areEqual(t.heading, 45)
    areEqual(t.pitch, 0)
    areEqual(t.roll, 0)

    t.pitch = 45
    areEqual(t.heading, 45)
    areEqual(t.pitch, 45)
    areEqual(t.roll, 0)

    t.roll = 45
    areEqual(t.heading, 45)
    areEqual(t.pitch, 45)
    areEqual(t.roll, 45)
})

Deno.test('left & right', () => {
    t.reset()
    t.left(45)
    areEqual(t.heading, -45)
    areEqual(t.theta, headingToRad(t.heading))
    t.right(90)
    areEqual(t.heading, 45)
    areEqual(t.theta, headingToRad(t.heading))
})

Deno.test('tilt up & down', () => {
    t.reset()
    t.tiltUp(45)
    areEqual(t.pitch, 45)
    t.tiltDown(90)
    areEqual(t.pitch, -45)
})

Deno.test('roll right & left', () => {
    t.reset()
    t.rollRight(45)
    areEqual(t.roll, 45)
    t.rollLeft(90)
    areEqual(t.roll, -45)
})

Deno.test('facexyz', () => {
    t.reset()
    t.facexyz(1, 1, 1)
    t.forward(1)
    areEqual(t.heading, 45)

    const [x, y, z] = t.getxyz()
    areEqual(x, y)
    areEqual(y, z)
    areEqual(z, x)

    const hypot = Math.sqrt(3) // squrt(1**2 + 1**2 + 1**2)
    const pitch = Math.asin(1 / hypot) * toDeg
    areEqual(t.pitch, pitch)
})
