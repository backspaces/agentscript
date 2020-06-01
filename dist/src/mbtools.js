import * as turf from '../vendor/turf.esm.js'

export function mapLoadPromise(map) {
    return new Promise((resolve, reject) => {
        map.on('load', () => resolve())
    })
}

export async function importModel(url) {
    const Model = (await import(url)).default
    return Model
}
export function modelFromBBox(Model, width, bbox) {
    const worldOptions = worldFromBBox(width, bbox)
    const model = new Model(worldOptions)
    return model
}

export function worldFromBBox(width, bbox) {
    const [west, south, east, north] = bbox
    const aspect = (east - west) / (north - south)

    const worldOptions = {
        minX: 0,
        minY: 0,
        maxX: width,
        maxY: Math.round(width / aspect),
    }
    return worldOptions
}

export function bboxCenter(bbox) {
    const [west, south, east, north] = bbox
    return [(west + east) / 2, (south + north) / 2]
}

export function bboxCoords(bbox) {
    const [west, south, east, north] = bbox
    return [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
    ]
}

// Create new mapboxgl.Map w/ defaults:
export function setDefaultDivs() {
    const style = document.createElement('style')
    style.innerHTML = `
<style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 95%; }
</style>
`
    document.head.appendChild(style)
}

const defaultMapOptions = {
    container: 'map', // container DOM id
    style: 'streets-v11',
    // center: [-98.5795, 39.8283], // online query
    // center: [-95.712891, 37.090240], // "USA" in https://www.latlong.net/
    center: [-100.334228, 40.236557], // clicking in https://www.latlong.net/
    zoom: 3,
    renderWorldCopies: false,
}
export function newMap(mapboxgl, options = {}) {
    options = Object.assign({}, defaultMapOptions, options)
    if (document.getElementById(options.container) == null) {
        const div = document.createElement('div')
        div.setAttribute('id', options.container)
        document.body.prepend(div)
    }
    if (!options.style.includes('://'))
        options.style = 'mapbox://styles/mapbox/' + options.style
    return new mapboxgl.Map(options)
}

export function mapCenter(map) {
    const bbox = mapBBox(map)
    return bboxCenter(bbox)
}

export function mapBBox(map) {
    const bounds = map.getBounds().toArray()
    const [west, south] = bounds[0]
    const [east, north] = bounds[1]
    return [west, south, east, north]
}

export function addBBoxLayer(map, id, bbox, color, width = 1) {
    map.addLayer({
        id: id,
        type: 'line',
        source: {
            type: 'geojson',
            data: turf.featureCollection([turf.bboxPolygon(bbox)]),
        },
        paint: {
            'line-color': color,
            'line-width': width,
        },
    })
}
export function updateBBoxLayer(map, id, bbox) {
    const data = turf.featureCollection([turf.bboxPolygon(bbox)])
    map.getSource(id).setData(data)
}

export function addDemLayer(map, id) {
    map.addLayer({
        id: id,
        type: 'hillshade', // only layer type for raster-dem
        source: {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
        },
    })
}

export function addGeoLines(map, id, geojson, color, width) {
    map.addLayer(
        {
            id: id,
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson,
            },
            paint: {
                'line-color': color,
                'line-width': width,
            },
        },
        'settlement-label'
    )
}
export function addCanvasLayer(map, id, model, view) {
    map.addSource(id, {
        type: 'canvas',
        canvas: view.canvas,
        animate: true,
        coordinates: model.world.bboxCoords(), // 4 [lon,lat] arrays
    })
    map.addLayer({
        id: id,
        type: 'raster',
        source: 'canvas',
    })
}

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
