function defaultLeafletOptions() {
    return {
        // L.map uses these
        div: 'map',
        Z: 10,

        // no elevation layer. 0.01 for invisible elevation layer, 1 for opaque
        elevationOpacity: 0,

        // world's border: set to null for no border
        bboxBorder: { color: 'red', weight: 0.5 },

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

export async function initLeaflet(model, view, options = {}) {
    options = Object.assign(defaultLeafletOptions(), options)

    if (options.fetchCSS) {
        await util.fetchCssStyle('https://unpkg.com/leaflet/dist/leaflet.css')
        await util.fetchCssStyle('./map.css')
    }

    const tileData = TileData[options.tiles] // redfishUSA/World, mapzen, mapbox
    const terrainName = options.terrain

    const center = gis.latlon(model.world.bboxCenter())
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

    const [west, south, east, north] = model.world.bbox
    const bounds = new L.LatLngBounds(
        new L.LatLng(north, west),
        new L.LatLng(south, east)
    )
    const ElementOverlay = elementOverlay(L)
    const elementLayer = new ElementOverlay(view.canvas, bounds).addTo(map)

    let jsonLayer
    if (options.json) {
        // style needs to be fcn w/ json feature arg
        let jsonStyleFcn = options.jsonStyle

        jsonLayer = L.geoJSON(options.json, {
            style: jsonStyleFcn,
        }) //.addTo(map)

        if (options.jsonPopup) {
            jsonLayer.bindPopup(options.jsonPopup)
        }

        jsonLayer.addTo(map)
    }

    // Draw a border around the model's bbox
    // Before done via css: this.canvas.style.border = options.canvasBorder
    //   where canvasBorder: '2px solid red'
    // .. but prefer a map layer for keeping it all in Leaflet
    let bboxLayer
    if (options.bboxBorder) {
        const latlngs = gis.latlon(gis.bboxCoords(model.world.bbox))
        bboxLayer = L.polyline(latlngs, options.bboxBorder).addTo(map)
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
        bboxLayer,
        options,
    }
}
