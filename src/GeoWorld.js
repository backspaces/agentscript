import World from './World.js'
import { geojsonBBox } from './geojson.js'
import * as gis from './gis.js'

// class World defines the coordinate system for the model.
// It has been upgraded with methods converting from other
// transforms like GIS and DataSets/Canvas transforms.
// This is an example World object for geojson worlds.

class GeoWorld extends World {
    // bbox: [west, south, east, north]
    // bbox of NM
    static defaultBBox() {
        return gis.newMexicoBBox
    }

    // Use geo bbox & width to create a World object
    // BBox can be a geojson obj, which is converted to geojson's bbox
    constructor(bbox = GeoWorld.defaultBBox(), width = 50) {
        let json
        if (!Array.isArray(bbox)) {
            json = bbox
            bbox = geojsonBBox(json)
        }
        const aspect = gis.bboxMetricAspect(bbox)

        super({
            minX: 0,
            minY: 0,
            maxX: width,
            maxY: Math.round(width / aspect),
        })

        this.bbox = bbox
        this.xfm = this.bboxTransform(...bbox)
        if (json) this.geojson = json
    }
    // Convert to/from geo coords.
    toGeo(x, y) {
        return this.xfm.toBBox([x, y])
    }
    toWorld(geoX, geoY) {
        return this.xfm.toWorld([geoX, geoY])
    }

    // return bbox lonlat center
    bboxCenter() {
        return this.xfm.bboxCenter()
    }
    // return bbox as 4 lonlat coords/points
    bboxCoords() {
        return this.xfm.bboxCoords()
    }

    // Return center [x,y] of bbox in geo coords.
    // get bboxCenter() {
    //     const [west, south, east, north] = this.bbox
    //     return [(west + east) / 2, (south + north) / 2]
    // }

    // bboxCenter(point = 'lonlat') {
    //     const [west, south, east, north] = this.bbox
    //     if (point === 'lonlat') {
    //         return [(west + east) / 2, (south + north) / 2]
    //     } else {
    //         return [(south + north) / 2, (west + east) / 2]
    //     }
    // }
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

export default GeoWorld
