// import * as TileData from './TileData.js'
import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import GeoDataSet from '../src/GeoDataSet.js'
// import RGBDataSet from './RGBDataSet.js'

class LeafletDataSet {
    constructor(map, elevationLayer, tileData) {
        Object.assign(this, { map, elevationLayer, tileData })
        this.tiles = {}

        const tileSize = elevationLayer.getTileSize()
        if (tileSize.x != tileSize.y)
            throw Error('LeafletDataSet: tileSize must be square: ' + tileSize)
        this.tileSize = tileSize.x

        // this.loading = true
        elevationLayer.on('loading', ev => (this.loading = true))
        elevationLayer.on('load', ev => (this.loading = false))
        elevationLayer.on('tileload', ev => this.addTile(ev.tile, ev.coords))
        elevationLayer.on('tileunload', ev => this.removeTile(ev.coords))
        // elevationLayer.on('tileerror', ev => console.log('tileerror', ev))
    }

    getZoom() {
        return Math.round(this.map.getZoom())
        // return Math.floor(map.getZoom())
    }

    bboxToPixelBBox(bbox) {
        const [west, south, east, north] = bbox // geo coords
        const { x: northPx, y: eastPx } = map.latLngToContainerPoint([
            north,
            east,
        ])
        const { x: southPx, y: westPx } = map.latLngToContainerPoint([
            south,
            west,
        ])
        return [westPx, southPx, eastPx, northPx]
    }
    bboxPixelSize(bbox) {
        const [westPx, southPx, eastPx, northPx] = this.bboxToPixelBBox(bbox)
        return [eastPx - westPx + 1, northPx - southPx + 1]
    }
    bboxTiles(bbox) {
        const [westPx, southPx, eastPx, northPx] = this.bboxToPixelBBox(bbox)
        const tileSize = this.tileSize
        return [
            Math.floor(westPx / tileSize),
            Math.floor(southPx / tileSize),
            Math.floor(eastPx / tileSize),
            Math.floor(northPx / tileSize),
        ]
    }

    tileName(coords) {
        const { x, y, z } = coords
        return z + '/' + x + '/' + y
        // return x + ':' + y + ':' + z
    }
    addTile(tile, coords) {
        const dataSet = this.tileData.tileDataSet(tile)

        if (dataSet.data.includes(0)) {
            console.log('0 elev', dataSet)
        }

        // dataSet.coords = coords
        // dataSet.tile = tile

        const key = this.tileName(coords)
        this.tiles[key] = dataSet
    }
    removeTile(coords) {
        delete this.tiles[this.tileName(coords)]
    }

    mapBBox() {
        return gis.Lbounds2bbox(this.map.getBounds())
    }

    // bbox can be a gis.bbox or a leaflet latlng bounds
    async getBBoxDataSet(bbox) {
        if (!Array.isArray(bbox)) bbox = gis.Lbounds2bbox(bbox)

        await util.waitPromise(() => this.loading === false)

        const z = this.getZoom()

        const tilesBBox = gis.tilesBBox(bbox, z) // in xy coords
        const dataSetMatrix = this.dataSetsMatrix(tilesBBox, z)
        const tilesDataSet = this.dataSetMatrixToDataSet(dataSetMatrix)
        const cropParameters = this.getCropParameters(bbox, z)
        const croppedDataSet = tilesDataSet.crop(cropParameters)
        const bboxDataSet = GeoDataSet.viewFromDataSet(croppedDataSet, bbox)

        console.log('bbox', bbox)
        console.log('tilesBBox', tilesBBox)
        console.log('dataSetMatrix', dataSetMatrix)
        console.log('tilesDataSet', tilesDataSet)
        console.log('cropParameters', cropParameters)
        console.log('bboxDataSet', bboxDataSet)
        console.log('')

        return bboxDataSet
    }
    // Return individual tile datasets as a row/col array
    dataSetsMatrix(tilesBBox, z) {
        const [westX, southY, eastX, northY] = tilesBBox

        const cols = []
        for (let y = northY; y <= southY; y++) {
            const row = []
            for (let x = westX; x <= eastX; x++) {
                const tileName = this.tileName({ x, y, z })
                const dataSet = this.tiles[tileName]
                if (!dataSet) {
                    console.log('missing dataset', tileName)
                } else {
                    row.push(dataSet)
                }
            }
            if (row.length === 0) {
                console.log('empty row, y =', y)
            } else {
                cols.push(row)
            }
        }
        return cols
    }
    dataSetMatrixToDataSet(dataSetMatrix) {
        const rows = dataSetMatrix.map(
            // col => col.reduce((prev, cur) => prev.concatEast(cur))
            col =>
                col.reduce((prev, cur) => {
                    // if (!prev) throw Error('prev')
                    // if (!prev)
                    //     console.log('no prev', dataSetMatrix, col, prev, cur)
                    // if (prev.data.includes(0))
                    //     console.log('0 elev', dataSetMatrix, col, prev, cur)
                    return prev.concatEast(cur)
                })
        )
        const dataSet = rows.reduce((prev, cur) => prev.concatSouth(cur))
        return dataSet
    }
    getCropParameters(bbox, z) {
        // Get bbox lons & lats (in float degrees)
        const [west, south, east, north] = bbox // geo coords

        // Get tile coords (in floats) of bbox
        const westX = gis.lonz2xFloat(west, z)
        const eastX = gis.lonz2xFloat(east, z)
        const northY = gis.latz2yFloat(north, z)
        const southY = gis.latz2yFloat(south, z)

        // Get tile edge coords in ints
        const northOuter = Math.floor(northY)
        const southOuter = Math.ceil(southY)
        const westOuter = Math.floor(westX)
        const eastOuter = Math.ceil(eastX)

        // Calculate the crop values in pixels.
        const left = Math.round((westX - westOuter) * this.tileSize)
        const top = Math.round((northY - northOuter) * this.tileSize)
        const right = Math.round((eastOuter - eastX) * this.tileSize)
        const bottom = Math.round((southOuter - southY) * this.tileSize)
        return { top, bottom, left, right }
    }
}

export default LeafletDataSet
