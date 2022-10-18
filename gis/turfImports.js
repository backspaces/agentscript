// These are a few turf tools that we have used.
// import * as turf from './turfimports.js'

// see:
// https://turfjs.org/docs/
// https://github.com/Turfjs/turf/tree/master/packages
// https://unpkg.com/@turf/turf/

// If you only need one or so, you can import like this:
// import bbox from 'https://cdn.skypack.dev/@turf/bbox'

// These are single export turf modules/functions we use

// https://github.com/Turfjs/turf/tree/master/packages
export { default as bbox } from 'https://cdn.skypack.dev/@turf/bbox'
export { default as bboxPolygon } from 'https://cdn.skypack.dev/@turf/bbox-polygon'
export { default as booleanPointInPolygon } from 'https://cdn.skypack.dev/@turf/boolean-point-in-polygon'

// These are core, multi-export helper modules

// https://github.com/Turfjs/turf/tree/master/packages/turf-helpers
export {
    point,
    points,
    multiPoint,
    //
    lineString,
    lineStrings,
    multiLineString,
    //
    polygon,
    polygons,
    multiPolygon,
    //
    feature,
    geometry,
    featureCollection,
    geometryCollection,
    //
    radiansToLength,
    lengthToRadians,
    lengthToDegrees,
    bearingToAzimuth,
    convertLength,
    convertArea,
} from 'https://cdn.skypack.dev/@turf/helpers'

// https://github.com/Turfjs/turf/tree/master/packages/turf-invariant
export {
    getGeom,
    getType,
    //
    getCoord,
    getCoords,
    //
    containsNumber,
    geojsonType,
    featureOf,
    collectionOf,
} from 'https://cdn.skypack.dev/@turf/invariant'

// https://github.com/Turfjs/turf/tree/master/packages/turf-meta
export {
    coordEach,
    coordAll,
    coordReduce,
    //
    propEach,
    propReduce,
    //
    featureEach,
    featureReduce,
    //
    geomEach,
    geomReduce,
    //
    flattenEach,
    flattenReduce,
    //
    segmentEach,
    segmentReduce,
    //
    findPoint,
    findSegment,
    //
    lineEach,
    lineReduce,
} from 'https://cdn.skypack.dev/@turf/meta'

// https://github.com/Turfjs/turf/tree/master/packages/turf-random
export {
    randomPosition,
    randomPoint,
    randomLineString,
    randomPolygon,
} from 'https://cdn.skypack.dev/@turf/random'
