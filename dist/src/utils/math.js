// ### Math

// Return random int/float in [0,max) or [min,max) or [-r/2,r/2)
export const randomInt = max => Math.floor(Math.random() * max)
export const randomInt2 = (min, max) =>
    min + Math.floor(Math.random() * (max - min))
export const randomFloat = max => Math.random() * max
export const randomFloat2 = (min, max) => min + Math.random() * (max - min)
export const randomCentered = r => randomFloat2(-r / 2, r / 2)

// Return float Gaussian normal with given mean, std deviation.
export function randomNormal(mean = 0.0, sigma = 1.0) {
    // Box-Muller
    const [u1, u2] = [1.0 - Math.random(), Math.random()] // ui in 0,1
    const norm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return norm * sigma + mean
}

// Return whether num is [Power of Two](http://goo.gl/tCfg5). Very clever!
export const isPowerOf2 = num => (num & (num - 1)) === 0 // twgl library
// Return next greater power of two. There are faster, see:
// [Stack Overflow](https://goo.gl/zvD78e)
export const nextPowerOf2 = num => Math.pow(2, Math.ceil(Math.log2(num)))

// A [modulus](http://mathjs.org/docs/reference/functions/mod.html)
// function rather than %, the remainder function.
// [`((v % n) + n) % n`](http://goo.gl/spr24) also works.
export const mod = (v, n) => ((v % n) + n) % n // v - n * Math.floor(v / n)
// Wrap v around min, max values if v outside min, max
export const wrap = (v, min, max) => min + mod(v - min, max - min)
// Clamp a number to be between min/max.
// Much faster than Math.max(Math.min(v, max), min)
export function clamp(v, min, max) {
    if (v < min) return min
    if (v > max) return max
    return v
}
// Return true is val in [min, max] enclusive
export const between = (val, min, max) => min <= val && val <= max

// Return a linear interpolation between lo and hi.
// Scale is in [0-1], a percentage, and the result is in [lo,hi]
// If lo>hi, scaling is from hi end of range.
// [Why the name `lerp`?](http://goo.gl/QrzMc)
export const lerp = (lo, hi, scale) =>
    lo <= hi ? lo + (hi - lo) * scale : lo - (lo - hi) * scale
// Calculate the lerp scale given lo/hi pair and a number between them.
// Clamps number to be between lo & hi.
export function lerpScale(number, lo, hi) {
    if (lo === hi) throw Error('lerpScale: lo === hi')
    number = util.clamp(number, lo, hi)
    return (number - lo) / (hi - lo)
}

// ### Geometry

// Degrees & Radians
export const radians = degrees => (degrees * Math.PI) / 180
export const degrees = radians => (radians * 180) / Math.PI
// Heading & Angles:
// * Heading is 0-up (y-axis), clockwise angle measured in degrees.
// * Angle is euclidean: 0-right (x-axis), counterclockwise in radians
export function heading(radians) {
    // angleToHeading?
    const deg = degrees(radians)
    return mod(90 - deg, 360)
}
export function angle(heading) {
    // headingToAngle?
    const degrees = mod(360 - heading, 360)
    return radians(degrees)
}
// Return angle (radians) in (-pi,pi] that added to rad0 = rad1
// See NetLogo's [subtract-headings](http://goo.gl/CjoHuV) for explanation
export function subtractRadians(rad1, rad0) {
    let dr = mod(rad1 - rad0, 2 * Math.PI)
    if (dr > Math.PI) dr = dr - 2 * Math.PI
    return dr
}
// Above using headings (degrees) returning degrees in (-180, 180]
export function subtractHeadings(deg1, deg0) {
    let dAngle = mod(deg1 - deg0, 360)
    if (dAngle > 180) dAngle = dAngle - 360
    return dAngle
}
// Return angle in [-pi,pi] radians from (x,y) to (x1,y1)
// [See: Math.atan2](http://goo.gl/JS8DF)
export const radiansToward = (x, y, x1, y1) => Math.atan2(y1 - y, x1 - x)
// Above using headings (degrees) returning degrees in [-90, 90]
export function headingToward(x, y, x1, y1) {
    return heading(radiansToward(x, y, x1, y1))
}

// Return distance between (x, y), (x1, y1)
export const distance = (x, y, x1, y1) => Math.sqrt(sqDistance(x, y, x1, y1))
// Return squared distance .. i.e. avoid Math.sqrt. Faster comparisons
export const sqDistance = (x, y, x1, y1) =>
    (x - x1) * (x - x1) + (y - y1) * (y - y1)
// Return true if x,y is within cone.
// Cone: origin x0,y0 in given direction, with coneAngle width in radians.
// All angles in radians
export function inCone(x, y, radius, coneAngle, direction, x0, y0) {
    if (sqDistance(x0, y0, x, y) > radius * radius) return false
    const angle12 = radiansToward(x0, y0, x, y) // angle from 1 to 2
    return coneAngle / 2 >= Math.abs(subtractRadians(direction, angle12))
}
