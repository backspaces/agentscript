import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import * as turf from '../gis/turfImports.js'
// import * as TileData from '../src/TileData.js'
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

// options = { properties: {}, id: undefined }
export function bboxFeature(bbox, options = {}) {
    return turf.bboxPolygon(bbox, options)
}

function isBBox(obj) {
    if (!Array.isArray(obj) || obj.length !== 4) return false
    return obj.every(val => util.isNumber(val))
}

export async function mapLoadPromise(map) {
    return new Promise((resolve, reject) => {
        map.on('load', () => resolve())
    })
}

function defaultZoom(world) {
    const height = document.body.clientHeight
    const worldHeight = world.height
    const bbox = world.bbox
    // calc a zoom
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

// // point can be a lngLat object or [lng, lat] array
// export function findPolygon(geojson, point) {
//     if (point.lng) point = [point.lng, point.lat]
//     const features = geojson.features

//     for (const feature of features) {
//         if (turf.booleanPointInPolygon(point, feature)) return feature
//     }
//     return null

//     // console.log(features[0], point)
//     // return features[0]
// }

// export const osmUrl = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
// export const elevationUrl =
//     'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

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

// Note both geojson layers can share their sources due to often
// using the same geojson for lines and fills.
// Thus if the geojson arg is a string, it is used for the source id
export function addGeojsonFillLayer(map, id, geojson, fill, opacity, stroke) {
    if (isBBox(geojson)) geojson = bboxFeature(geojson)

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
            // 'fill-opacity': [
            //     'case',
            //     ['boolean', ['feature-state', 'hover'], false],
            //     1,
            //     0.5,
            // ],
        },
    })
}

export function addGeojsonLineLayer(map, id, geojson, color, width = 1) {
    if (isBBox(geojson)) geojson = bboxFeature(geojson)
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
    if (isBBox(geojson)) geojson = bboxFeature(geojson)
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
    if (isBBox(geojson)) geojson = bboxFeature(geojson)
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

export function addLayerClickPopup(map, layerID, msg) {
    map.on('click', layerID, function (ev) {
        const props = ev.features[0].properties
        const html = msg(props, ev)
        // msg = msg.toLocaleString()
        new maplibregl.Popup({ maxWidth: 'none' })
            .setLngLat(ev.lngLat)
            .setHTML(html)
            .addTo(map)
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
            source.setData(bboxFeature(bbox))
        }
    }

    // const out = ev => {
    //     logEvent(ev)
    //     isOut = true

    //     corner2 = ev.lngLat
    // }

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

// map.on('drag', function (ev) {
//     console.log('A drag event occurred.', ev);
// });
// map.on('dragend', function () {
//     console.log('A dragend event occurred.', ev);
// });

// function setTopLayerSource(map, layerId, source, sourceLayer) {
//     // const oldLayers = map.getStyle().layers
//     // const layerIndex = oldLayers.findIndex(l => l.id === layerId)
//     // const layerDef = oldLayers[layerIndex]
//     const layerDef = map.getLayer(layerId)
//     const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id
//     layerDef.source = source
//     if (sourceLayer) {
//         layerDef['source-layer'] = sourceLayer
//     }
//     map.removeLayer(layerId)
//     map.addLayer(layerDef, before)
//     map.getSource('bboxID').setData(updatedGeoJSONData)
// }

// export function getLayersList(map) {
//     return map.getStyle().layers
// }
// export function getPaintProperties(map, id) {
//     return map.getLayer(id).paint._properties.properties
// }
// export function getLayersObject(map) {
//     const array = map.getStyle().layers
//     const obj = {}
//     array.forEach(layer => (obj[layer.id] = layer))
//     return obj
// }

// export async function importModel(url) {
//     const Model = (await import(url)).default
//     return Model
// }
// export function modelFromBBox(Model, width, bbox) {
//     const worldOptions = worldFromBBox(width, bbox)
//     const model = new Model(worldOptions)
//     return model
// }

// export function worldFromBBox(width, bbox) {
//     const [west, south, east, north] = bbox
//     const aspect = (east - west) / (north - south)

//     const worldOptions = {
//         minX: 0,
//         minY: 0,
//         maxX: width,
//         maxY: Math.round(width / aspect),
//         minZ: 0,
//         maxZ: 0,
//     }
//     return worldOptions
// }

// // BBox of a tile, rounding to smaller integer zxy
// export function tileBBox(map, lon, lat) {
//     const z = Math.ceil(map.getZoom())
//     return gis.lonLatz2bbox(lon, lat, z)
// }
// export function tileZxy(map, lon, lat) {
//     const z = Math.ceil(map.getZoom())
//     const [x, y] = gis.lonlatz2xy(lon, lat, z)
//     return [z, x, y]
// }
// export function mapCenter(map) {
//     const bbox = mapBBox(map)
//     return gis.bboxCenter(bbox)
// }
// export function mapBBox(map) {
//     const bounds = map.getBounds().toArray()
//     const [west, south] = bounds[0]
//     const [east, north] = bounds[1]
//     return [west, south, east, north]
// }
// export function bboxToGeoJson(bbox) {
//     return turf.featureCollection([turf.bboxPolygon(bbox)])
// }
// export function isInBBox(pt, bbox) {
//     if (!Array.isArray(pt)) {
//         const { lng, lat } = pt
//         pt = [lng, lat]
//     }
//     const feature = turf.bboxPolygon(bbox)
//     return turf.booleanPointInPolygon(pt, feature)
// }

// // =============== Initalize map ===============
// export function setDefaultStyle(id = 'map') {
//     const style = document.createElement('style')
//     style.innerHTML = `
//         body { margin: 0; padding: 0; }
//         #${id} { position: absolute; top: 0; bottom: 0; width: 100%; }
//     `
//     document.head.append(style)

//     const meta = document.createElement('meta')
//     meta.setAttribute('name', 'viewport')
//     meta.content = 'initial-scale=1,maximum-scale=1,user-scalable=no'
//     document.head.append(meta)
// }

// const defaultMapOptions = {
//     container: 'map', // container DOM id
//     style: 'streets-v11',
//     // center: [-98.5795, 39.8283], // online query
//     // center: [-95.712891, 37.090240], // "USA" in https://www.latlong.net/
//     center: [-100.334228, 40.236557], // clicking in https://www.latlong.net/
//     zoom: 3,
//     renderWorldCopies: true,
// }
// export function newMap(mapboxgl, options = {}) {
//     options = Object.assign({}, defaultMapOptions, options)
//     if (document.getElementById(options.container) == null) {
//         const div = document.createElement('div')
//         div.setAttribute('id', options.container)
//         document.body.prepend(div)
//     }
//     if (!options.style.includes('://'))
//         options.style = 'mapbox://styles/mapbox/' + options.style
//     return new mapboxgl.Map(options)
// }

// // =============== Layers & Sources ===============

// export function addGeoFill(map, id, geojson, fill, stroke) {
//     map.addLayer(
//         {
//             id: id,
//             type: 'fill',
//             source: {
//                 type: 'geojson',
//                 data: geojson, // url or json
//             },
//             paint: {
//                 'fill-color': fill,
//                 'fill-outline-color': stroke,
//             },
//         },
//         'settlement-label'
//     )
// }
// export function addGeoLines(map, id, geojson, color, width) {
//     map.addLayer(
//         {
//             id: id,
//             type: 'line',
//             source: {
//                 type: 'geojson', // url or json
//                 data: geojson,
//             },
//             paint: {
//                 'line-color': color,
//                 'line-width': width,
//             },
//         },
//         'settlement-label'
//     )
// }
// export function updateGeojsonSource(map, id, geojson) {
//     map.getSource(id).setData(geojson) // url or json
// }
// export function updateGeojsonPaint(map, id, color, stroke) {
//     const layerType = map.getLayer(id).type
//     if (layerType === 'line') {
//         if (color) map.setPaintProperty(id, 'line-color', color)
//         if (stroke) map.setPaintProperty(id, 'line-width', stroke)
//     } else if (layerType === 'fill') {
//         if (color) map.setPaintProperty(id, 'fill-color', color)
//         if (stroke) map.setPaintProperty(id, 'fill-outline-color', stroke)
//     } else {
//         console.log('bad layer type:', layerType)
//     }
// }
// export function addBBoxLayer(map, id, bbox, color, width = 1) {
//     map.addLayer({
//         id: id,
//         type: 'line',
//         source: {
//             type: 'geojson',
//             data: bboxToGeoJson(bbox),
//         },
//         paint: {
//             'line-color': color,
//             'line-width': width,
//         },
//     })
// }
// export function updateBBoxSource(map, id, bbox) {
//     const data = bboxToGeoJson(bbox)
//     updateGeojsonSource(map, id, data)
// }

// export function addDemLayer(map, id) {
//     map.addLayer({
//         id: id,
//         type: 'hillshade', // only layer type for raster-dem
//         source: {
//             type: 'raster-dem',
//             url: 'mapbox://mapbox.terrain-rgb',
//         },
//     })
// }

// export function addImageLayer(map, id, bbox, imageUrl) {
//     map.addSource(id, {
//         type: 'image',
//         url: imageUrl,
//         coordinates: gis.bboxCoords(bbox), // 4 [lon,lat] arrays
//     })
//     map.addLayer({
//         id: id,
//         type: 'raster',
//         source: id,
//     })
// }
// export function updateImageSource(map, id, bbox, imageUrl) {
//     // map.getSource(id).setCoordinates(gis.bboxCoords(bbox))
//     map.getSource(id).updateImage({
//         url: imageUrl,
//         coordinates: gis.bboxCoords(bbox),
//     })
// }

// export function addViewLayer(map, id, bbox, view) {
//     map.addSource(id, {
//         type: 'canvas',
//         canvas: view.canvas,
//         animate: true,
//         coordinates: gis.bboxCoords(bbox),
//     })
//     map.addLayer({
//         id: id,
//         type: 'raster',
//         source: id,
//     })
// }
// export function updateViewSource(map, id, bbox) {
//     // map.getSource(id).setCoordinates(gis.bboxCoords(bbox))
//     map.getSource(id).setCoordinates(gis.bboxCoords(bbox))
// }

////

// Moved to src/gis.js module
// export function bboxCenter(bbox) {
//     const [west, south, east, north] = bbox
//     return [(west + east) / 2, (south + north) / 2]
// }
// export function bboxCoords(bbox) {
//     const [west, south, east, north] = bbox
//     return [
//         [west, north],
//         [east, north],
//         [east, south],
//         [west, south],
//     ]
// }

// Create new mapboxgl.Map w/ defaults:
// Add viewport too?
/* <meta
    name="viewport"
    content="initial-scale=1,maximum-scale=1,user-scalable=no"
/> */

// export function pointInGeojsonSource(map, id, pt) {
//     const json = map.getSource(id).getData()
//     console.log('json', json)
// }

// export function addModelViewLayer(map, id, model, view) {
//     map.addSource(id, {
//         type: 'canvas',
//         canvas: view.canvas,
//         animate: true,
//         coordinates: model.world.bboxCoords(), // 4 [lon,lat] arrays
//     })
//     map.addLayer({
//         id: id,
//         type: 'raster',
//         source: id,
//     })
// }

// style: 'streets-v11',
// https://docs.mapbox.com/vector-tiles/reference/
// mapbox://styles/mapbox/streets-v11
// mapbox://styles/mapbox/satellite-streets-v11
// mapbox://styles/mapbox/dark-v10
// mapbox://styles/mapbox/light-v10
// mapbox://styles/mapbox/outdoors-v11
// mapbox://mapbox.mapbox-terrain-v2
// Raster
// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
// https://docs.mapbox.com/api/maps/
// mapbox://styles/mapbox/satellite-v9
// mapbox-terrain-rgb

// https://stackoverflow.com/questions/56078658/how-to-get-elevation-profile-data-from-mapbox
// https://cran.r-project.org/web/packages/slippymath/vignettes/fetching-elevation-rasters-from-mapbox.html
// https://docs.mapbox.com/api/maps/

// https://en.wikipedia.org/wiki/Geographic_center_of_the_United_States
// https://en.wikipedia.org/wiki/List_of_geographic_centers_of_the_United_States
// center: [-98.5795, 39.8283], // online
