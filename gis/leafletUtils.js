export function testEvents(map, elevationLayer) {
    const eventFcn = ev => {
        // console.log(ev.type, ev, ev.coords ? this.tileName(ev.coords) : '')
        console.log(ev.type, ev.coords || '', ev)
    }

    map.on('zoomstart', eventFcn) // zoomstart/end => movestart/end too?
    map.on('zoomend', eventFcn)
    map.on('movestart', eventFcn)
    map.on('moveend', eventFcn)
    map.on('resize', eventFcn)

    elevationLayer.on('loading', eventFcn)
    elevationLayer.on('tileunload', eventFcn)
    elevationLayer.on('tileloadstart', eventFcn)
    elevationLayer.on('tileerror', eventFcn)
    elevationLayer.on('tileload', eventFcn)
    elevationLayer.on('load', eventFcn)
}

export function testZooms(tileLayer) {
    const eventFcn = ev => {
        console.log(ev.type, ev.coords)
    }
    tileLayer.on('tileerror', eventFcn)
    tileLayer.on('tileload', eventFcn)

    let zoom = 0,
        id
    let fcn = () => {
        if (zoom === 20) clearInterval(id)
        console.log('zoom:', zoom)
        map.setZoom(zoom++)
    }
    id = setInterval(fcn, 2000)
}

// https://stackoverflow.com/questions/18968986/leaflet-set-rectangle-coordinated-from-mouse-events
export function mouseBounds(L, map, ev, fcn) {
    let corner1, corner2, rect, bounds

    const down = ev => {
        map.dragging.disable()
        corner1 = ev.latlng
        console.log('down:', ev.latlng)

        bounds = L.latLngBounds(corner1, corner1)
        rect = L.rectangle(bounds, {
            color: 'red',
            fillColor: 'yellow',
        })
        rect.addTo(map)

        map.on('mousemove', move)
        map.on('mouseup', up)
    }
    const move = ev => {
        console.log('move:', ev.latlng)
        corner2 = ev.latlng
        bounds = L.latLngBounds(corner1, corner2)
        rect.setBounds(bounds)
    }
    const up = ev => {
        map.dragging.enable()
        // map.off('mousedown', down)
        map.off('mousemove', move)
        map.off('mouseup', up)

        corner2 = ev.latlng
        // console.log('up:', ev.latlng)
        const bounds = L.latLngBounds(corner1, corner2)
        // console.log(bounds)

        console.log('fcn', fcn, 'bounds', bounds)
        fcn(bounds)

        rect.remove()
    }

    // map.on('mousedown', down)
    down(ev)
}

export function eventKeys(ev) {
    const { altKey, ctrlKey, metaKey, shiftKey } = ev.originalEvent
    console.log('altKey, ctrlKey, metaKey, shiftKey')
    console.log(altKey, ctrlKey, metaKey, shiftKey)
}

// https://gis.stackexchange.com/questions/149062/display-tile-grid-borders-with-leaflet-visual-debugging
// export function getCss(id) {
//     const css = `
// * {
//     padding: 0;
//     margin: 0;
// }

// #${id} {
//     height: 100vh
// }

// .terrain-pane .leaflet-tile {
//     border: solid black 1px;
// }

// .leaflet-container {
//     isolation: isolate;
// }`
//     return css
// }
//  .leaflet-tile {
//     border: solid black 1px;
// }

// export function pixelBounds2bbox(leafletPixelBounds) {
//     let { lng: eastPx, lat: northPx } = leafletBounds.getNorthEast()
//     let { lng: westPx, lat: southPx } = leafletBounds.getSouthWest()
//     return [westPx, southPx, eastPx, northPx]
// }

// // LonLat corners to bbox: [west, south, east, north]
// export function topLeftBottomRight2bbox(topLeft, bottomRight) {
//     const [west, north] = topLeft
//     const [east, south] = bottomRight
//     return [west, south, east, north]
// }
// export function bottomLeftTopRight2bbox(bottomLeft, topRight) {
//     const [west, south] = bottomLeft
//     const [east, north] = topRight
//     return [west, south, east, north]
// }

// export function bboxPixels(map, bbox) {
//     const [west, south, east, north] = bbox
//     // const northWest = L.latLng(north, west)
//     // const southEast = L.latLng(south, east)
//     const northWestPx = map.latLngToContainerPoint([north, west])
//     const southEastPx = map.latLngToContainerPoint([south, east])
//     // const { x: northPx, y: westPx } = L.CRS.latLngToPoint(northWest, Z)
//     // const { x: eastPx, y: southPx } = L.CRS.latLngToPoint(southEast, Z)
//     // const { x: northPx, y: westPx } = L.CRS.latLngToPoint([north, west], Z)
//     // const { x: eastPx, y: southPx } = L.CRS.latLngToPoint([south, east], Z)
//     // return [westPx, southPx, eastPx, northPx]
//     return [westPx, southPx, eastPx, northPx]
// }
