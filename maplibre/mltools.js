import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import maplibregl from 'https://cdn.skypack.dev/maplibre-gl'

let mapLibreCss
export async function importMapLibre() {
    if (mapLibreCss) return maplibregl
    mapLibreCss = await util.fetchCssStyle(
        'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'
    )
    await util.fetchCssStyle('./fullScreen.css')
    return maplibregl
}

function isBBox(obj) {
    if (!Array.isArray(obj) || obj.length !== 4) return false
    // const isNumberArray = obj.every(val => util.isNumber(val))
    // return isNumberArray
    return obj.every(val => util.isNumber(val))
}

export async function mapLoadPromise(map) {
    return new Promise((resolve, reject) => {
        map.on('load', () => resolve())
    })
}

// function defaultZoom(world) {
//     const height = document.body.clientHeight
//     const worldHeight = world.height
//     const bbox = world.bbox
//     // calc a zoom
// }
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

    if (isBBox(center)) center = gis.bboxCenter(center)

    await importMapLibre() // is no-op if css already loaded

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

// let startupMessageShown = false
// const startupFcn = message => alert(message)
// export function startupMessage(map, message) {
//     if (startupMessageShown) {
//         map.off('idle', startupFcn)
//     } else {
//         map.on('idle', startupFcn(message))
//         startupMessageShown = true
//     }
// }
// const startupFcn = message => {
//     alert(message)
//     map.off('idle', startupFcn)
// }
// export function startupMessage(map, message) {
//     const startupFcn = message => {
//         alert(message)
//         map.off('idle', startupFcn)
//     }
//     map.on('idle', startupFcn(message))
// }
export async function startupMessage(message) {
    await util.pause(1000)
    alert(message)
}

export function getZoom(map, round = true) {
    let zoom = map.getZoom()
    if (round) zoom = Math.round(zoom)
    return zoom
}

export function showTileBoundaries(map, show = true) {
    map.showTileBoundaries = show
}

export const getLayer = (map, id) => map.getLayer(id)
export const getLayers = map => map.getStyle().layers
export const getPaintProperties = (map, id) =>
    map.getLayer(id).paint._properties.properties
export const getPaintPropertiesKeys = (map, id) =>
    Object.keys(getPaintProperties(map, id))

export function addRasterLayer(map, id, url, opacity = 1) {
    map.addSource(id, {
        type: 'raster',
        tiles: [url],
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

export function addGeojsonLayer(map, id, geojson, fill, stroke, width = 2) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)
    // if (Array.isArray(geojson)) geojson = bboxFeature(geojson)
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

export function addCanvasLayer(map, id, canvas, coords) {
    if (isBBox(coords)) coords = gis.bboxCoords(coords)

    console.log('addCanvasLayer:', map, id, canvas, coords)

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

export function updateGeojson(map, id, geojson) {
    if (isBBox(geojson)) geojson = gis.bboxFeature(geojson)
    map.getSource(id).setData(geojson)
}

export function updateCanvas(map, id, canvas, coords) {
    map.removeLayer(id)
    map.removeSource(id)
    addCanvasLayer(map, id, canvas, coords)
}

export function addLayerClick(map, layerID, fcn) {
    map.on('click', layerID, fcn)
}

export function addLayerClickPopup(map, layerID, msg, anchor = 'bottom') {
    map.on('click', layerID, function (ev) {
        const props = ev.features[0].properties
        const html = msg(props, ev)
        // msg = msg.toLocaleString()
        new maplibregl.Popup({ maxWidth: 'none', anchor })
            .setLngLat(ev.lngLat)
            .setHTML(html)
            .addTo(map)
    })
}

let popup
export function addLayerMovePopup(map, layerID, msg, anchor = 'bottom') {
    map.on('mousemove', layerID, function (ev) {
        const props = ev.features[0].properties
        if (props) {
            if (popup) popup.remove()
            const html = msg(props, ev)
            popup = new maplibregl.Popup({ maxWidth: 'none', anchor })
                .setLngLat(ev.lngLat)
                .setHTML(html)
                .addTo(map)
        }
    })
}

export function addLayerCursor(map, fillID, cursor = 'pointer') {
    map.on('mouseenter', fillID, () => {
        map.getCanvas().style.cursor = cursor
    })
    map.on('mouseleave', fillID, () => {
        map.getCanvas().style.cursor = ''
    })
}

export function addDragRect(map, fcn) {
    map.on('mousedown', function (ev) {
        mouseRect(map, ev, fcn)
    })
}
export function mouseRect(map, ev, fcn) {
    if (!(ev.originalEvent.altKey && ev.originalEvent.button === 0)) return

    let corner1, corner2, isOut
    const bboxID = 'bboxID'
    let debug = false

    const logEvent = ev => {
        if (debug) console.log(ev.type, ev.lngLat, ev)
    }

    const getBBox = () => {
        // console.log(corner1, corner2)
        let [lon1, lat1] = [corner1.lng, corner1.lat]
        let [lon2, lat2] = [corner2.lng, corner2.lat]

        const minLon = Math.min(lon1, lon2),
            maxLon = Math.max(lon1, lon2),
            minLat = Math.min(lat1, lat2),
            maxLat = Math.max(lat1, lat2)

        const bbox = [minLon, minLat, maxLon, maxLat]
        // console.log('bbox', bbox.toLocaleString())
        return bbox
    }
    const setBBox = () => {
        const bbox = getBBox()

        const source = map.getSource(bboxID)
        if (!source) {
            addGeojsonLineLayer(map, bboxID, bbox, 'red', 4)
        } else {
            source.setData(gis.bboxFeature(bbox))
        }
    }

    const down = ev => {
        logEvent(ev)

        corner1 = corner2 = ev.lngLat
        isOut = false

        setBBox()

        map.on('mousemove', move)
        map.on('mouseup', up)
        // map.on('mouseout', out)
        map.dragPan.disable()
    }
    const move = ev => {
        logEvent(ev)

        corner2 = ev.lngLat
        setBBox()
    }
    const up = ev => {
        logEvent(ev)

        corner2 = ev.lngLat
        const bbox = getBBox()

        map.removeLayer(bboxID)
        map.removeSource(bboxID)

        map.off('mousemove', move)
        map.off('mouseup', up)
        // map.off('mouseout', out)
        map.dragPan.enable()

        fcn(bbox)
    }

    down(ev)
}
