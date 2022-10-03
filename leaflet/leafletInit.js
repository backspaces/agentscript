import * as util from '../src/utils.js'

import * as gis from '../src/gis.js'
import * as TileData from '../src/TileData.js'

import * as L from 'https://unpkg.com/leaflet/dist/leaflet-src.esm.js'
import elementOverlay from 'https://unpkg.com/@redfish/leafletelementoverlay/elementOverlay.esm.js'

function defaultLeafletOptions() {
    return {
        // L.map uses these
        div: 'map',
        Z: 10,

        // have javascript install css files
        fetchCSS: true,

        // the L.map options
        // preferCanvas seems to be needed for model on top of json?
        mapOptions: { zoomDelta: 0.25, zoomSnap: 0, preferCanvas: true },

        // no elevation layer. 0.01 for invisible elevation layer, 1 for opaque
        elevationOpacity: 0,

        // model's border: set to null for no border. can also be used for fill color
        bboxBorder: { color: 'red', weight: 2 },

        // tiles's border: set to null for no border, uses css format for now.
        tilesBorder: 'solid red 2px',

        // map base layer: osm topo topo1 smooth usgs
        terrain: 'topo',

        // elevation tiles: redfishUSA/World, mapzen, mapbox
        tiles: 'mapzen',

        // Add Leaflet gis layer using the provided style
        // https://leafletjs.com/reference.html#geojson
        // https://leafletjs.com/reference.html#layer
        json: null,
        // jsonStyle must be a function: geoJsonFeature => ({color:...})
        // default style is leaflet's:
        // https://leafletjs.com/reference.html#path-option
        jsonStyle: feature => ({
            // put styles here. none => use leaflet defaults
            color: 'red',
        }),
        jsonPopup: null,

        // ToDo:
        // A popup, bound to a layer. Must be a function: layer => string
        // Ex: ['jsonLayer', layer => layer.feature.properties.NAME]
        // see: https://leafletjs.com/reference.html#popup
        // popup: [],
    }
}

async function leafletInit(model, canvas, options = {}) {
    if (!model.world.bbox) throw Error('leafletInit: model must use GeoWorld')

    // ========== Startup: css, tile datasets, terrain layer ==========
    options = Object.assign(defaultLeafletOptions(), options)

    // If options.fetchCSS use JS to set Leaflet & our css files
    if (options.fetchCSS) {
        await util.fetchCssStyle('https://unpkg.com/leaflet/dist/leaflet.css')
        await util.fetchCssStyle('./map.css')
        // await util.fetchCssStyle('https://code.agentscript.org/gis/map.css')
    }

    // Get one of the 4 tile datasets
    const tileData = TileData[options.tiles] // redfishUSA/World, mapzen, mapbox
    // Name of the terrain layer (from the gis.js module)
    const terrainName = options.terrain

    // ========== Start of map layers: ==========
    // ===== The map using the div, model center and Z. World is a GeoWorld
    const center = gis.latlon(model.world.bboxCenter())
    const map = L.map(options.div, options.mapOptions)
    map.setView(center, options.Z)

    // ===== Map's terrain
    const terrainLayer = L.tileLayer(gis.template(terrainName), {
        attribution: gis.attribution(terrainName),
        // className: 'terrain-pane', // shows tiles borders
    }).addTo(map)

    // ===== elevation layer if non-zero elevationOpacity
    let elevationLayer
    if (options.elevationOpacity > 0) {
        elevationLayer = L.tileLayer(tileData.zxyTemplate, {
            opacity: options.elevationOpacity,
            attribution: 'Elevation Tiles',
            crossOrigin: '',
            maxZoom: tileData.maxZoom, // larger mapzen zoom yields tileerror
        }).addTo(map)
    }

    // ===== A border around the model
    // Draw a border around the model's bbox
    // Before done via css: this.canvas.style.border = options.canvasBorder
    //   where canvasBorder: '2px solid red'
    // .. but prefer a map layer for keeping it all in Leaflet
    let bboxLayer
    if (options.bboxBorder) {
        const latlngs = gis.latlon(gis.bboxCoords(model.world.bbox))
        // bboxLayer = L.polyline(latlngs, options.bboxBorder).addTo(map)
        bboxLayer = L.rectangle(latlngs, options.bboxBorder).addTo(map)
    }

    // ===== Draw a border around each tile, using css, not Leaflet
    // https://gis.stackexchange.com/questions/149062/display-tile-grid-borders-with-leaflet-visual-debugging
    if (options.tilesBorder !== 'solid red 2px') {
        if (!options.tilesBorder) options.tilesBorder = '0px'
        const root = document.documentElement
        root.style.setProperty('--tile-border', options.tilesBorder)
    }
    // ===== A JSON layer with optional popup, fairly common
    let jsonLayer
    if (options.json) {
        jsonLayer = L.geoJSON(options.json, {
            style: options.jsonStyle,
        })

        if (options.jsonPopup) {
            jsonLayer.bindPopup(options.jsonPopup)
        }

        jsonLayer.addTo(map)
    }

    // ===== The model layer, using Cody's ElementOverlay
    // Should be last layer, on top
    const [west, south, east, north] = model.world.bbox
    const bounds = new L.LatLngBounds(
        new L.LatLng(north, west),
        new L.LatLng(south, east)
    )
    const ElementOverlay = elementOverlay(L)
    const elementLayer = new ElementOverlay(canvas, bounds).addTo(map)

    // ========== End of map layers ==========

    return {
        // a module of all the elevation tile urls & their datasets
        TileData,
        tileData, // our instance of TileData
        gis, // the gis utilities module

        // The leaflet map, and input for L.map
        L,
        map,
        terrainName,

        // The leaflet layerrs
        terrainLayer,
        elevationLayer,
        elementLayer,
        jsonLayer,
        bboxLayer,

        // The model's overlay layer
        elementOverlay,
        ElementOverlay,

        // the input options, possibly modified above
        options,
    }
}

export default leafletInit
