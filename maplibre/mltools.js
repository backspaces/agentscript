import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import * as turf from '../gis/turfImports.js'
import * as TileData from '../src/TileData.js'
import maplibregl from 'https://cdn.skypack.dev/maplibre-gl'

export async function importMapLibre() {
    await util.fetchCssStyle(
        'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'
    )
    await util.fetchCssStyle('../gis/fullScreen.css')
    return maplibregl
}
// export const maplibregl

export function bboxFeature(bbox, options = { properties: {}, id: undefined }) {
    return turf.bboxPolygon(bbox, options)
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
export async function newMap(world, zoom = 10, div = 'map') {
    const map = new maplibregl.Map({
        container: div, // container id
        center: world.bboxCenter(), // [-105.941109, 35.68222],
        zoom: zoom,
        // renderWorldCopies: false,
        style: {
            version: 8,
            sources: {},
            layers: [],
        },
    })
    await mapLoadPromise(map)
    return map
}

export const osmUrl = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const elevationUrl =
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

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

export function addGeojsonFillLayer(map, id, geojson, color) {
    map.addSource(id, {
        type: 'geojson',
        data: geojson,
    })
    map.addLayer({
        id: id,
        type: 'fill',
        source: id,
        paint: { 'fill-color': color },
    })
}

export function addGeojsonLineLayer(map, id, geojson, color, width = 1) {
    map.addSource(id, {
        type: 'geojson',
        data: geojson,
    })
    map.addLayer({
        id: id,
        type: 'line',
        source: id,
        paint: { 'line-color': color, 'line-width': width },
    })
}

export function addCanvasLayer(map, id, canvas, coordinates) {
    map.addSource(id, {
        type: 'canvas',
        canvas: canvas,
        coordinates: coordinates,
    })
    map.addLayer({
        id: id,
        type: 'raster',
        source: id,
    })
}

export function addClickPopup(map, layerID, msg) {
    map.on('click', layerID, function (e) {
        const props = e.features[0].properties
        const html = msg(props, e)
        // msg = msg.toLocaleString()
        new maplibregl.Popup({ maxWidth: 'none' })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map)
    })
}

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

export const getLayer = (map, id) => map.getLayer(id)
export const getLayers = map => map.getStyle().layers
export const getPaintProperties = (map, id) =>
    map.getLayer(id).paint._properties.properties
export const getPaintPropertiesKeys = (map, id) =>
    Object.keys(getPaintProperties(map, id))

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
