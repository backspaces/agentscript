import * as util from './utils.js'
import TwoDraw from './TwoDraw.js'

import * as gis from './gis.js'
import * as TileData from './TileData.js'

import * as L from 'https://unpkg.com/leaflet/dist/leaflet-src.esm.js'
import elementOverlay from 'https://unpkg.com/@redfish/leafletelementoverlay/elementOverlay.esm.js'

class LeafletDraw extends TwoDraw {
    static defaultLeafletOptions() {
        return {
            div: 'map',
            Z: 10,
            // no elevation layer. 0.01 for invisible elevation layer, 1 for opaque
            elevationOpacity: 0,

            // view's canvas border: set to null for no border
            canvasBorder: '2px solid red',

            // elevation tiles: redfishUSA/World, mapzen, mapbox
            tiles: 'mapzen',

            // map base layer: osm topo topo1 smooth usgs
            terrain: 'topo',

            // have javascript install css files
            fetchCSS: true,

            // Add Leaflet gis layer using the provided style
            // https://leafletjs.com/reference.html#geojson
            // https://leafletjs.com/reference.html#layer
            json: null,
            // must be a function: geoJsonFeature => ({color:...})
            // style options: https://leafletjs.com/reference.html#path-option
            jsonStyle: null, // will be default style if not overriden
            // must be a function: layer => string
            jsonPopup: null,
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
    }

    async initLeaflet(options = {}) {
        options = Object.assign(LeafletDraw.defaultLeafletOptions(), options)

        if (options.fetchCSS) {
            await util.fetchCssStyle(
                'https://unpkg.com/leaflet/dist/leaflet.css'
            )
            await util.fetchCssStyle('./map.css')
        }

        if (options.canvasBorder)
            this.canvas.style.border = options.canvasBorder

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
        const ElementOverlay = elementOverlay(L)
        const elementLayer = new ElementOverlay(this.canvas, bounds).addTo(map)

        let jsonLayer
        if (options.json) {
            // style needs to be fcn w/ json feature arg
            let jsonStyleFcn = options.jsonStyle
            if (util.isObject(jsonStyleFcn)) {
                jsonStyleFcn = feature => jsonStyleFcn
            }

            jsonLayer = L.geoJSON(options.json, {
                style: jsonStyleFcn,
            }) //.addTo(map)

            if (options.jsonPopup) {
                jsonLayer.bindPopup(options.jsonPopup)
            }

            jsonLayer.addTo(map)
        }

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
            jsonLayer,
            options,
        }
    }
}

export default LeafletDraw
