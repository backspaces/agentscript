import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
// import maplibregl from 'https://cdn.skypack.dev/maplibre-gl'
// import maplibregl from 'https://esm.sh/maplibre-gl@3.4.0'
import maplibregl from 'https://esm.sh/maplibre-gl@5.2.0'

let mapLibreCss
export async function importMapLibre() {
    if (mapLibreCss) return maplibregl
    mapLibreCss = await util.fetchCssStyle(
        'https://esm.sh/maplibre-gl@3.4.0/dist/maplibre-gl.css'
    )
    await util.fetchCssStyle('./fullScreen.css')
    return maplibregl
}

// export function createCanvas(width, height) {
//     return util.createCanvas(width, height)
// }
export function newCanvas() {
    return util.createCanvas(0, 0)
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

// terrain sources: osm topo topo1 smooth usgs
// elevation sources: mapzen maptiler redfishUSA redfishWorld mapbox
export function terrain(template) {
    return gis.template(template)
}
export function elevation(template) {
    return gis.elevationTemplate(template)
}

export function bboxCenter(bbox) {
    return gis.bboxCenter(bbox)
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

export function updateExistingLayers(map, bbox, layerID = 'rectangle') {
    if (map.getSource(layerID)) {
        const geojsonData = gis.bboxFeature(bbox) // Convert bbox to GeoJSON
        map.getSource(layerID).setData(geojsonData)
    } else {
        console.warn(`Layer "${layerID}" does not exist. Skipping update.`)
    }
}

export function bboxListener(map, fcn) {
    function updateBoundingBox() {
        const newBBox = mapbbox(map)

        console.log('Updated Bounding Box:', newBBox)
        fcn(map, newBBox)
    }

    // Update bounding box on map move and zoom events
    map.on('moveend', updateBoundingBox)
    map.on('zoomend', updateBoundingBox)
}

export function dragRectListener(map, layerID = 'rectangle') {
    let startLngLat = null
    let isDrawing = false

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
    }

    function updateDrawing(event) {
        if (!isDrawing || !startLngLat) return

        const bbox = getBBoxFromPoints(startLngLat, event.lngLat)
        updateExistingLayers(map, bbox, layerID)
    }

    function stopDrawing(event) {
        if (!isDrawing) return

        isDrawing = false
        console.log(
            'Updated Bounding Box:',
            getBBoxFromPoints(startLngLat, event.lngLat)
        )
    }

    map.on('mousedown', startDrawing)
    map.on('mousemove', updateDrawing)
    map.on('mouseup', stopDrawing)
}

export const santaFeBBox = gis.santaFeBBox
export const santaFeCenter = gis.santaFeCenter
export const newMexicoBBox = gis.newMexicoBBox
export const newMexicoCenter = gis.newMexicoCenter
export const usaBBox = gis.usaBBox
export const usaCenter = gis.usaCenter

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

// Equivalent to:
// mltools.addGeojsonFillLayer(map, 'bbox', bbox, 'rgba(255, 0, 0, 0.2)')
// mltools.addGeojsonLineLayer(map, 'bboxLines', bbox, 'red', 3)
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

// export function bboxListener(map, fcn, threshold = 0.01) {
//     // threshold 0.01 degrees ~ 1.1km
//     let previousBBox = mapbbox(map) // Store the initial bounding box

//     // function hasSignificantChange(newBBox) {
//     //     if (!previousBBox) return true

//     //     // Compare each coordinate difference against the threshold
//     //     return (
//     //         Math.abs(newBBox[0] - previousBBox[0]) > threshold || // West
//     //         Math.abs(newBBox[1] - previousBBox[1]) > threshold || // South
//     //         Math.abs(newBBox[2] - previousBBox[2]) > threshold || // East
//     //         Math.abs(newBBox[3] - previousBBox[3]) > threshold // North
//     //     )
//     // }
//     function updateBoundingBox() {
//         const newBBox = mapbbox(map)

//         console.log('Updated Bounding Box:', newBBox)
//         fcn(map, newBBox)

//         // if (hasSignificantChange(newBBox)) {
//         //     console.log('Updated Bounding Box:', newBBox)
//         //     fcn(map, newBBox)
//         //     previousBBox = newBBox // Update the stored bounding box
//         // } else {
//         //     console.log('slight change')
//         // }
//     }

//     // Update bounding box on map move and zoom events
//     map.on('moveend', updateBoundingBox)
//     map.on('zoomend', updateBoundingBox)

//     // Initial log when the function is first called
//     // updateBoundingBox()
// }

// export function addDragRect(map, fcn) {
//     map.on('mousedown', function (ev) {
//         mouseRect(map, ev, fcn)
//     })
// }
// export function mouseRect(map, ev, fcn) {
//     if (!(ev.originalEvent.altKey && ev.originalEvent.button === 0)) return

//     let corner1, corner2, isOut
//     const bboxID = 'bboxID'
//     let debug = false

//     const logEvent = ev => {
//         if (debug) console.log(ev.type, ev.lngLat, ev)
//     }

//     const getBBox = () => {
//         // console.log(corner1, corner2)
//         let [lon1, lat1] = [corner1.lng, corner1.lat]
//         let [lon2, lat2] = [corner2.lng, corner2.lat]

//         const minLon = Math.min(lon1, lon2),
//             maxLon = Math.max(lon1, lon2),
//             minLat = Math.min(lat1, lat2),
//             maxLat = Math.max(lat1, lat2)

//         const bbox = [minLon, minLat, maxLon, maxLat]
//         // console.log('bbox', bbox.toLocaleString())
//         return bbox
//     }
//     const setBBox = () => {
//         const bbox = getBBox()

//         const source = map.getSource(bboxID)
//         if (!source) {
//             addGeojsonLineLayer(map, bboxID, bbox, 'red', 4)
//         } else {
//             source.setData(gis.bboxFeature(bbox))
//         }
//     }

//     const down = ev => {
//         logEvent(ev)

//         corner1 = corner2 = ev.lngLat
//         isOut = false

//         setBBox()

//         map.on('mousemove', move)
//         map.on('mouseup', up)
//         // map.on('mouseout', out)
//         map.dragPan.disable()
//     }
//     const move = ev => {
//         logEvent(ev)

//         corner2 = ev.lngLat
//         setBBox()
//     }
//     const up = ev => {
//         logEvent(ev)

//         corner2 = ev.lngLat
//         const bbox = getBBox()

//         map.removeLayer(bboxID)
//         map.removeSource(bboxID)

//         map.off('mousemove', move)
//         map.off('mouseup', up)
//         // map.off('mouseout', out)
//         map.dragPan.enable()

//         fcn(bbox)
//     }

//     down(ev)
// }

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
// export async function startupMessage(message) {
//     await util.pause(1000)
//     alert(message)
// }
