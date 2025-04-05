import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import maplibregl from 'https://esm.sh/maplibre-gl@5.3.0'

await util.fetchCssStyle(
    'https://esm.sh/maplibre-gl@5.3.0/dist/maplibre-gl.css'
)

// ========== init

// avoid user having to have fullScreen.css file
util.addCssStyle(`
body {
    margin: 0;
    padding: 0;
}

#map {
    width: 100vw;
    height: 100vh;
}
`)

export function newCanvas() {
    return util.createCanvas(0, 0)
}

export function isBBox(obj) {
    return gis.isBBox(obj)
}

// export async function mapLoadPromise(map) {
async function mapLoadPromise(map) {
    return new Promise((resolve, reject) => {
        map.on('load', () => resolve())
    })
}

export function bboxCenter(bbox) {
    return gis.bboxCenter(bbox)
}

export function jsonToBBox(json) {
    return gis.jsonToBBox(json)
}

export const santaFeBBox = gis.santaFeBBox
export const santaFeSmallBBox = gis.santaFeSmallBBox
export const santaFeCenter = gis.santaFeCenter
export const newMexicoBBox = gis.newMexicoBBox
export const newMexicoCenter = gis.newMexicoCenter
export const usaBBox = gis.usaBBox
export const usaCenter = gis.usaCenter

// ========== map

function emptyMap(center, zoom, div) {
    // "world" can be a model who's world we can use (model.world)
    // if (world.world) world = world.world
    const map = new maplibregl.Map({
        container: div, // container id
        center: center, //world.bboxCenter(),
        zoom: zoom,
        // renderWorldCopies: false,
        style: {
            version: 8,
            sources: {},
            layers: [],
        },
    })
    return map
}

export async function newMap(center, zoom = 10, div = 'map') {
    zoom = Math.round(zoom) // needed for tile, bbox, etc calculations

    // if (isBBox(center)) center = gis.bboxCenter(center)
    if (isBBox(center)) center = this.bboxCenter(center)

    // await importMapLibre() // is no-op if css already loaded

    const map = emptyMap(center, zoom, div)
    await mapLoadPromise(map)

    const nav = new maplibregl.NavigationControl()
    map.addControl(nav, 'top-left')

    return map
}
export function onLoad(map, msg = 'A load event occurred.') {
    map.on('load', function () {
        console.log(msg)
    })
}

// terrain sources: osm topo topo1 smooth usgs
// elevation sources: mapzen maptiler redfishUSA redfishWorld mapbox
export function terrain(template) {
    return gis.template(template)
}
export function elevation(template) {
    return gis.elevationTemplate(template)
}

export function mapbbox(map) {
    const bounds = map.getBounds() // Returns a LngLatBounds object
    return [
        bounds.getWest(), // Left longitude
        bounds.getSouth(), // Bottom latitude
        bounds.getEast(), // Right longitude
        bounds.getNorth(), // Top latitude
    ]
}

export function getZoom(map, round = true) {
    let zoom = map.getZoom()
    if (round) zoom = Math.round(zoom)
    return zoom
}

export function showTileBoundaries(map, show = true) {
    map.showTileBoundaries = show
}

// ========== listeners

export function mapListener(map, fcn) {
    function updateBoundingBox() {
        const newBBox = mapbbox(map)

        console.log('Updated Bounding Box:', newBBox)
        fcn(map, newBBox)
    }

    // Update bounding box on map move and zoom events
    map.on('moveend', updateBoundingBox)
    map.on('zoomend', updateBoundingBox)
}

export function dragRectListener(map, id, callback, initBBox = null) {
    if (initBBox && callback) {
        console.log('initBBox', initBBox)
        callback(initBBox)
    }

    let startLngLat = null
    let isDrawing = false
    let bbox = null

    function getBBoxFromPoints(start, end) {
        return [
            Math.min(start.lng, end.lng), // west
            Math.min(start.lat, end.lat), // south
            Math.max(start.lng, end.lng), // east
            Math.max(start.lat, end.lat), // north
        ]
    }

    function startDrawing(event) {
        if (!event.originalEvent.shiftKey) return // Require Shift key to start

        event.preventDefault()
        startLngLat = event.lngLat
        isDrawing = true
        bbox = null
    }

    function updateDrawing(event) {
        if (!isDrawing || !startLngLat) return

        bbox = getBBoxFromPoints(startLngLat, event.lngLat)

        updateGeojson(map, id, bbox)
    }

    function stopDrawing(event) {
        if (!isDrawing) return

        if (bbox && callback) callback(bbox)

        isDrawing = false
        bbox = null
    }

    map.on('mousedown', startDrawing)
    map.on('mousemove', updateDrawing)
    map.on('mouseup', stopDrawing)
}

// ========== layers

export const getLayer = (map, id) => map.getLayer(id)
export const getLayers = map => map.getStyle().layers
export const getPaintProperties = (map, id) =>
    map.getLayer(id).paint._properties.properties
export const getPaintPropertiesKeys = (map, id) =>
    Object.keys(getPaintProperties(map, id))

// ========== raster layer

export function addRasterLayer(map, id, url, opacity = 1) {
    map.addSource(id, {
        type: 'raster',
        tiles: Array.isArray(url) ? url : [url],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap Contributors',
    })
    map.addLayer({
        id: id,
        type: 'raster',
        source: id,
        paint: { 'raster-opacity': opacity },
    })
}

// ========== vector layer

export function addVectorLayer(map, id, url, color = 'red', width = 3) {
    map.addSource(id, {
        type: 'vector',
        url: url,
    })
    map.addLayer({
        id: id,
        type: 'line',
        source: id,
        'source-layer': id,
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': color,
            'line-width': width,
        },
    })
}

// ========== terrain layer

export function addTerrainSource(map, id, url, maxzoom = 14) {
    map.addSource(id, {
        type: 'raster-dem',
        tiles: Array.isArray(url) ? url : [url],
        tileSize: 256,
        maxzoom: maxzoom,
        encoding: 'terrarium', // or 'mapbox' depending on provider
        attribution: '&copy; Elevation data provider',
    })
}

// ========== geojson layer

// Note both geojson layers can share their sources due to often
// using the same geojson for lines and fills.
// Thus if the geojson arg is a string, it is used for the source id
export function addGeojsonFillLayer(map, id, geojson, fill, opacity, stroke) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)

    // if (Array.isArray(geojson)) geojson = bboxFeature(geojson)
    let sourceID = util.isString(geojson) ? geojson : id

    if (sourceID === id) {
        map.addSource(id, {
            type: 'geojson',
            data: geojson,
        })
    }
    map.addLayer({
        id: id,
        type: 'fill',
        source: sourceID,
        paint: {
            'fill-color': fill,
            'fill-outline-color': stroke ? stroke : fill,
            'fill-opacity': opacity ? opacity : 1,
        },
    })
}

export function addGeojsonLineLayer(map, id, geojson, color, width = 1) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)
    const sourceID = util.isString(geojson) ? geojson : id

    if (sourceID === id) {
        map.addSource(id, {
            type: 'geojson',
            data: geojson,
        })
    }
    map.addLayer({
        id: id,
        type: 'line',
        source: sourceID,
        paint: { 'line-color': color, 'line-width': width },
    })
}

// Equivalent to:
// mltools.addGeojsonFillLayer(map, 'bbox', bbox, 'rgba(255, 0, 0, 0.2)')
// mltools.addGeojsonLineLayer(map, 'bboxLines', bbox, 'red', 3)
export function addGeojsonLayer(map, id, geojson, fill, stroke, width = 2) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)
    const sourceID = util.isString(geojson) ? geojson : id

    if (sourceID === id) {
        map.addSource(id, {
            type: 'geojson',
            data: geojson,
        })
    }
    map.addLayer({
        // id: id + 'Fill',
        id: id,
        type: 'fill',
        source: sourceID,
        paint: { 'fill-color': fill },
    })
    map.addLayer({
        id: id + 'Stroke',
        type: 'line',
        source: sourceID,
        paint: { 'line-color': stroke, 'line-width': width },
    })
}

export function updateGeojson(map, id, geojson) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)
    map.getSource(id).setData(geojson)
}

// ========== canvas layer

export function addCanvasLayer(map, id, canvas, coords) {
    // https://maplibre.org/maplibre-gl-js/docs/API/classes/CanvasSource/
    if (isBBox(coords)) coords = gis.bboxCoords(coords)

    map.addSource(id, {
        type: 'canvas',
        canvas: canvas,
        coordinates: coords,
    })
    map.addLayer({
        id: id,
        type: 'raster',
        source: id,
    })
}

export function updateCanvas(map, id, canvas, coords) {
    map.removeLayer(id)
    map.removeSource(id)
    addCanvasLayer(map, id, canvas, coords)
}

// ========== layer utils

export function addLayerClick(map, id, fcn) {
    map.on('click', id, fcn)
}

export function addLayerClickPopup(map, id, msg) {
    map.on('click', id, function (ev) {
        const props = ev.features[0].properties
        const html = msg(props, ev)
        new maplibregl.Popup({ maxWidth: 'none' })
            .setLngLat(ev.lngLat)
            .setHTML(html)
            .addTo(map)
    })
}

let popup // each move pops up a new value
export function addLayerMovePopup(map, id, msg) {
    map.on('mousemove', id, function (ev) {
        const props = ev.features[0].properties
        // if (props) {
        if (popup) popup.remove()
        const html = msg(props, ev)
        popup = new maplibregl.Popup({ maxWidth: 'none' })
            .setLngLat(ev.lngLat)
            .setHTML(html)
            .addTo(map)
        // }
    })
}

export function addLayerCursor(map, id, cursor = 'pointer') {
    map.on('mouseenter', id, () => {
        map.getCanvas().style.cursor = cursor
    })
    map.on('mouseleave', id, () => {
        map.getCanvas().style.cursor = ''
    })
}

// ========== streets

export async function fetchStreetsJson(bbox) {
    return await gis.fetchStreetsJson(bbox)
}

// ========== misc

// tiles: [
//   'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
//   'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
//   'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
// ],
