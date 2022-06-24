import * as util from './utils.js'
import TwoDraw from './TwoDraw.js'

import * as gis from './gis.js'
import * as TileData from './TileData.js'

import * as L from 'https://unpkg.com/leaflet/dist/leaflet-src.esm.js'
import elementOverlay from 'https://unpkg.com/@redfish/leafletelementoverlay/elementOverlay.esm.js'

// Uses top level await to read css files (and add to <head>)
// import '../gis/importMapCss.js'
// import styles from '../gis/importMapCss.js'
// console.log('styles', styles)

class LeafletDraw extends TwoDraw {
    static defaultLeafletOptions() {
        return {
            div: 'map',
            Z: 10,
            // no elevation layer. 0.01 for invisible elevation layer, 1 for opaque
            elevationOpacity: 0,
            // set to null/undefined/'' for no border
            border: '1px solid red',
            tiles: 'mapzen',
            terrain: 'topo',
        }
    }

    constructor(model, viewOptions = {}, drawOptions = {}) {
        if (!model.world.bbox)
            throw Error('LeafletDraw: model must use GeoWorld')

        drawOptions = viewOptions.drawOptions || drawOptions
        if (!drawOptions.patchesColor) {
            drawOptions.patchesColor = 'transparent'
        }
        if (!viewOptions.div) {
            viewOptions.div = util.createCanvas(0, 0) // the view will resize
        }

        super(model, viewOptions, drawOptions)
        // this.model = model
        // this === view
    }

    // async initLeaflet(div = 'map', center = [35.67, -105.93], Z = 10) {
    async initLeaflet(options = {}) {
        options = Object.assign(LeafletDraw.defaultLeafletOptions(), options)

        await util.fetchCssStyle('https://unpkg.com/leaflet/dist/leaflet.css')
        await util.fetchCssStyle('./map.css')

        if (options.border) this.canvas.style.border = options.border

        const ElementOverlay = elementOverlay(L)
        const tileData = TileData[options.tiles] // redfishUSA/World, mapzen, mapbox
        const terrainName = options.terrain

        const center = gis.latlon(this.model.world.bboxCenter())
        const map = L.map(options.div, {
            zoomDelta: 0.25, //0.1
            zoomSnap: 0,
            preferCanvas: true,
            // renderer: L.canvas()
        }).setView(center, options.Z)

        const terrainLayer = L.tileLayer(gis.template(terrainName), {
            attribution: gis.attribution(terrainName),
            className: 'terrain-pane', // shows tiles borders
        }).addTo(map)

        let elevationLayer
        if (options.elevationOpacity > 0) {
            elevationLayer = L.tileLayer(tileData.zxyTemplate, {
                opacity: options.elevationOpacity,
                attribution: 'Elevation Tiles',
                crossOrigin: '',
                maxZoom: tileData.maxZoom, // larger mapzen zoom yields tileerror
            }).addTo(map)
        }

        // let modelLayer = new ElementOverlay(view.canvas, bounds).addTo(map)
        const [west, south, east, north] = this.model.world.bbox
        const bounds = new L.LatLngBounds(
            new L.LatLng(north, west),
            new L.LatLng(south, east)
        )
        const elementLayer = new ElementOverlay(this.canvas, bounds).addTo(map)

        return {
            L,
            elementOverlay,
            ElementOverlay,
            tileData,
            map,
            terrainName,
            terrainLayer,
            elevationLayer,
            elementLayer,
            options,
        }
    }
}

export default LeafletDraw
