import * as gis from './gis.js'
import World from './World.js'
import { geojsonBBox } from './geojson.js'
// import { MathUtils } from 'three'

// class World defines the coordinate system for the model.
// It has been upgraded with methods converting from other
// transforms like GIS and DataSets/Canvas transforms.
// This is an example World object for geojson worlds.

class GeoWorld extends World {
    static defaultOptions(bbox = gis.newMexicoBBox, patchesWidth = 100) {
        return {
            bbox,
            patchesWidth,
        }
    }

    // bbox: [west, south, east, north]
    // bbox of NM
    static defaultBBox() {
        return gis.newMexicoBBox
    }

    // Use geo bbox & patchesWidth to create a World object
    // BBox can be a geojson obj, which is converted to geojson's bbox
    // constructor(bbox = GeoWorld.defaultBBox(), width = 50) {
    constructor(options = GeoWorld.defaultOptions()) {
        // TEMPORY: will be removed in a few commits
        if (arguments.length === 2) {
            console.log(
                'WARNING: GeoWorld(bbox, width) replaced by GeoWorld(options)',
                'See: GeoWorld.defaultOptions'
            )

            options = {
                bbox: arguments[0],
                patchesWidth: arguments[1],
            }
        }
        let { bbox, patchesWidth } = options
        let json
        if (!Array.isArray(bbox)) {
            json = bbox
            bbox = geojsonBBox(json)
        }
        const aspect = gis.bboxMetricAspect(bbox)

        const maxZ = Math.round(patchesWidth / 2)
        super({
            minX: 0,
            maxX: patchesWidth,

            minY: 0,
            maxY: Math.round(patchesWidth / aspect),

            minZ: -maxZ,
            maxZ: maxZ,
        })

        this.bbox = bbox
        this.xfm = this.bboxTransform(...bbox)

        if (json) this.geojson = json
    }
    // Convert from world patch coords to geo coords.
    toGeo(x, y) {
        return this.xfm.toBBox([x, y])
    }
    // Convert from geo lon/lat coords to patch coords
    toWorld(geoX, geoY) {
        return this.xfm.toWorld([geoX, geoY])
    }

    // return bbox in geo coords
    // bbox() {
    //     return this.bbox
    // }
    // return bbox lonlat center
    bboxCenter() {
        return this.xfm.bboxCenter()
    }
    // return bbox as 4 lonlat coords/points
    bboxCoords() {
        return this.xfm.bboxCoords()
    }
}

export default GeoWorld
