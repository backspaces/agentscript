import util from '../src/util.js'
const { PI, atan, atan2, cos, floor, log, pow, sin, sinh, sqrt, tan } = Math
const radians = degrees => (degrees * PI) / 180
const degrees = radians => (radians * 180) / PI

const gis = {
    //
    //  Slippy Tile Helpers
    //     http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
    //
    lon2x(lon, z) {
        return floor(((lon + 180) / 360) * pow(2, z))
    },
    lat2y(lat, z) {
        const latRads = radians(lat)
        return floor(
            (1 - log(tan(latRads) + 1 / cos(latRads)) / PI) * pow(2, z - 1)
        )
    },
    lonlat2xy(lon, lat, z) {
        return [this.lon2x(lon, z), this.lat2y(lat, z)]
    },

    x2lon(x, z) {
        return (x / pow(2, z)) * 360 - 180
    },
    y2lat(y, z) {
        // const n = PI - (2 * PI * y) / pow(2, z)
        // // return (180 / PI) * atan(0.5 * (exp(n) - exp(-n)))
        // return degrees(atan(0.5 * (exp(n) - exp(-n))))
        const rads = atan(sinh(PI - (2 * PI * y) / pow(2, z)))
        return degrees(rads)
        // var n = PI - (2 * PI * y) / pow(2, z)
        // return (180 / PI) * atan(0.5 * (exp(n) - exp(-n)))
    },
    xy2lonlat(x, y, z) {
        return [this.x2lon(x, z), this.y2lat(y, z)]
    },
    // Return two lon/lat points for bbox of tile
    xy2bbox(x, y, z) {
        // REMIND: error check at 180, 0 etc
        const [lon0, lat0] = this.xy2lonlat(x, y, z)
        // y increases "down" like pixel coords
        const [lon1, lat1] = this.xy2lonlat(x + 1, y + 1, z)
        return [[lon0, lat0], [lon1, lat1]]
    },

    // Create a url for OSM json data.
    // https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
    // Args are south, west, north, east
    getOsmURL(minLat, minLon, maxLat, maxLon) {
        const url = 'https://overpass-api.de/api/interpreter?data='
        // [bbox:south,west,north,east]
        const params = `\
[out:json][timeout:180][bbox:${minLat},${minLon},${maxLat},${maxLon}];
way[highway];
(._;>;);
out;`
        return url + encodeURIComponent(params)
    },

    // https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
    // Explanation: https://en.wikipedia.org/wiki/Haversine_formula
    lonLat2meters(pt1, pt2) {
        const [lon1, lat1] = pt1.map(val => radians(val)) // lon/lat radians
        const [lon2, lat2] = pt2.map(val => radians(val))

        // generally used geo measurement function
        const R = 6378.137 // Radius of earth in KM
        const dLat = lat2 - lat1
        const dLon = lon2 - lon1
        const a =
            pow(sin(dLat / 2), 2) +
            cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
        const c = 2 * atan2(sqrt(a), sqrt(1 - a))
        const d = R * c
        return d * 1000 // meters
    },

    // geojson utilities
    clone(obj) {
        return JSON.parse(JSON.stringify(obj))
    },

    featureFilter(json, featurePath, values) {
        if (typeof values === 'string') values = values.split(' ')
        json.features = json.features.filter(feature => {
            const value = util.nestedProperty(feature, featurePath)
            return values.includes(value)
        })
        return json
    },
    geometryFilter(json, values) {
        return this.featureFilter(json, 'geometry.type', values)
    },
    propertiesFilter(json, properties) {
        if (typeof properties === 'string') properties = properties.split(' ')
        json.features.forEach(feature => {
            const obj = {}
            properties.forEach(prop => {
                if (feature.properties[prop] !== undefined) {
                    obj[prop] = feature.properties[prop]
                }
            })
            feature.properties = obj
        })
        return json
    },
    streetsFilter(json) {
        this.featureFilter(json, 'geometry.type', 'LineString')
        this.featureFilter(
            json,
            'properties.highway',
            'motorway residential primary secondary tertiary'
        )
        this.propertiesFilter(json, 'highway oneway name tiger:name_base')
        return json
    },
    filter(json, geometry, properties) {
        json = this.clone(json)
        this.geometryFilter(json, geometry)
        this.propertiesFilter(json, properties)
        return json
    },

    minify(json, geometry = null, properties = null) {
        json = this.clone(json)
        if (geometry) json = this.geometryFilter(json, geometry)
        if (properties) json = this.propertiesFilter(json, properties)
        const str = JSON.stringify(json) // compact form
        // newline for each feature
        return str.replace(/,{"type":"Feature"/g, '\n,\n{"type":"Feature"')
    },
    areEqual(json0, json1) {
        return JSON.stringify(json0) === JSON.stringify(json1)
    },
}

export default gis

// aliasFilter(json, name, aliases) {
//     json.features.map(feature => {
//         const props = feature.properties
//         if (!props[name]) {
//             aliases.forEach(alias => {
//                 if (feature.properties[prop] !== undefined) {
//                     obj[prop] = feature.properties[prop]
//                 }
//             })
//         }
//         return feature
//     })
//     return json
//     // return { type: 'FeatureCollection', features: features }
// },
