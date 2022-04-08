// import * as TileData from './TileData.js'
import * as gis from './gis.js'
// import RGBDataSet from './RGBDataSet.js'

export default class LeafletDataSet {
    constructor(map, elevationLayer, tileData) {
        Object.assign(this, { map, elevationLayer, tileData })
        this.tiles = {}

        const tileSize = elevationLayer.getTileSize()
        if (tileSize.x != tileSize.y)
            throw Error('LeafletDataSet: tileSize must be square: ' + tileSize)
        this.tileSize = tileSize.x

        this.loading = false
        elevationLayer.on('loading', ev => (this.loading = true))
        elevationLayer.on('load', ev => (this.loading = false))
        elevationLayer.on('tileload', ev => this.addTile(ev.tile, ev.coords))
        elevationLayer.on('tileunload', ev => this.removeTile(ev.coords))
        // elevationLayer.on('tileerror', ev => console.log('tileerror', ev))
    }

    getZoom() {
        return Math.round(map.getZoom())
        // return Math.floor(map.getZoom())
    }
    tileName(coords) {
        const { x, y, z } = coords
        return x + ':' + y + ':' + z
    }
    addTile(tile, coords) {
        const dataSet = this.tileData.tileDataSet(tile)

        dataSet.coords = coords
        dataSet.tile = tile

        const key = this.tileName(coords)
        this.tiles[key] = dataSet
    }
    removeTile(coords) {
        delete this.tiles[this.tileName(coords)]
    }

    // mapBBox() {
    //     return gis.bounds2bbox(map.getBounds())
    // }

    async getBBoxDataSet(bbox = this.mapBBox()) {
        await util.waitPromise(() => this.loading === false)

        const [west, south, east, north] = bbox
        const z = this.getZoom()

        const [westX, northY] = gis.lonlatz2xy(west, north, z)
        const [eastX, southY] = gis.lonlatz2xy(east, south, z)
        const tilesXYs = [westX, southY, eastX, northY]

        const tilesDataSets = this.dataSetsArray(tilesXYs, z)
        const tilesDataSet = this.dataSetsToDataSet(tilesDataSets)
        const cropParameters = this.getCropParameters(bbox, tilesXYs, z)
        const bboxDataSet = tilesDataSet.crop(cropParameters)

        // return { bbox, dataSets, dataSet, cropParameters }
        return {
            bbox,
            tilesDataSets,
            tilesDataSet,
            cropParameters,
            bboxDataSet,
        }
    }
    // Return individual tile datasets as a row/col array
    dataSetsArray(tilesXYs, z) {
        const [westX, southY, eastX, northY] = tilesXYs

        const cols = []
        for (let y = northY; y <= southY; y++) {
            const row = []
            for (let x = westX; x <= eastX; x++)
                row.push(this.tiles[this.tileName({ x, y, z })])
            cols.push(row)
        }
        return cols
    }
    dataSetsToDataSet(cols) {
        const rows = cols.map(
            // col => col.reduce((prev, cur) => prev.concatEast(cur))

            col =>
                col.reduce((prev, cur) => {
                    // if (!prev) throw Error('prev')
                    if (!prev) console.log(cols, col, prev, cur)
                    return prev.concatEast(cur)
                })
        )
        const dataSet = rows.reduce((prev, cur) => prev.concatSouth(cur))
        return dataSet
    }
    getCropParameters(bbox, tilesXYs, z) {
        const [west, south, east, north] = bbox
        const [westX, southY, eastX, northY] = tilesXYs

        const [dsWest, dsNorth] = gis.xyz2lonlat(westX, northY, z)
        const [dsEast, dsSouth] = gis.xyz2lonlat(eastX + 1, southY + 1, z)

        const [tWest, tSouth, tEast, tNorth] = gis.xyz2bbox(westX, northY, z)
        const tileHeight = Math.abs(tNorth - tSouth)
        const tileWidth = Math.abs(tWest - tEast)
        const heightRatio = this.tileSize / tileHeight
        const widthRatio = this.tileSize / tileWidth

        let cropNorth = Math.round(Math.abs(dsNorth - north) * heightRatio),
            cropSouth = Math.round(Math.abs(dsSouth - south) * heightRatio),
            cropEast = Math.round(Math.abs(dsEast - east) * widthRatio),
            cropWest = Math.round(Math.abs(dsWest - west) * widthRatio)

        return {
            // use DataSet.crop(obj) names
            top: cropNorth,
            bottom: cropSouth,
            left: cropWest,
            right: cropEast,
        }
    }
}
