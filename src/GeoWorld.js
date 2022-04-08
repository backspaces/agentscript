import World from './World.js'
import { geojsonBBox } from './geojson.js'
import { bboxMetricAspect } from './gis.js'

// class World defines the coordinate system for the model.
// It has been upgraded with methods converting from other
// transforms like GIS and DataSets/Canvas transforms.
// This is an example World object for geojson worlds.

export default class GeoWorld extends World {
    // Use the geojson object's bbox & width to create a World object
    // bbox: [west, south, east, north]
    constructor(bbox, width = 100) {
        let json
        if (!Array.isArray(bbox)) {
            json = bbox
            bbox = geojsonBBox(json)
        }
        const aspect = bboxMetricAspect(bbox)
        super({
            minX: 0,
            minY: 0,
            maxX: width,
            maxY: Math.round(width / aspect),
        })
        this.bbox = bbox
        if (json) this.geojson = json
        this.xfm = this.bboxTransform(...bbox)
    }
    // Convert to/from geo coords.
    toGeo(x, y) {
        return this.xfm.toBBox([x, y])
    }
    toWorld(geoX, geoY) {
        return this.xfm.toWorld([geoX, geoY])
    }
    // Return center [x,y] of bbox in geo coords.
    bboxCenter(point = 'lonlat') {
        const [west, south, east, north] = this.bbox
        if (point === 'lonlat') {
            return [(west + east) / 2, (south + north) / 2]
        } else {
            return [(south + north) / 2, (west + east) / 2]
        }
    }
    // bboxCenter() {
    //     const [west, south, east, north] = this.bbox
    //     return [(west + east) / 2, (south + north) / 2]
    // }
    // Return geo coords of bbox corners, from topLeft, clockwise.
    // bboxCoords() {
    //     const [west, south, east, north] = this.bbox
    //     return [
    //         [west, north],
    //         [east, north],
    //         [east, south],
    //         [west, south],
    //     ]
    // }
}
