// import util from '../src/util.js'
const { PI, atan, atan2, cos, floor, log, pow, sin, sinh, sqrt, tan } = Math
const radians = degrees => (degrees * PI) / 180
const degrees = radians => (radians * 180) / PI
function nestedProperty(obj, path) {
    if (typeof path === 'string') path = path.split('.')
    return path.reduce((obj, param) => obj[param], obj)
}

const gis = {
    // Tile Helpers http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
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
        const rads = atan(sinh(PI - (2 * PI * y) / pow(2, z)))
        return degrees(rads)
    },
    xy2lonlat(x, y, z) {
        return [this.x2lon(x, z), this.y2lat(y, z)]
    },
    // Return two lon/lat points for bbox of tile
    // We use the usual convention of
    //   [minX, minY, maxX, maxY] or [west, south, east, north]
    xy2bbox(x, y, z) {
        // REMIND: error check at 180, 0 etc
        // const [lon0, lat0] = this.xy2lonlat(x, y, z)
        const [west, north] = this.xy2lonlat(x, y, z)
        // console.log('west, north', west, north)
        // tile Y increases "down" like pixel coords
        // const [lon1, lat1] = this.xy2lonlat(x + 1, y + 1, z)
        const [east, south] = this.xy2lonlat(x + 1, y + 1, z)
        // console.log('south, east', south, east)
        // west, south, east, north
        // lon0, lat1, lon1, lat0
        return [west, south, east, north]
        // return [
        //     [lon0, lat0],
        //     [lon1, lat1],
        // ]
    },
    lonLat2bbox(lon, lat, z) {
        const [x, y] = this.lonlat2xy(lon, lat, z)
        return this.xy2bbox(x, y, z)
    },

    // Create a url for OSM json data.
    // https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
    // south, west, north, east = minLat, minLon, maxLat, maxLon
    getOsmURL(south, west, north, east) {
        const url = 'https://overpass-api.de/api/interpreter?data='
        const params = `\
[out:json][timeout:180][bbox:${south},${west},${north},${east}];
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
            sin(dLat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dLon / 2) ** 2
        // pow(sin(dLat / 2), 2) +
        // cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
        const c = 2 * atan2(sqrt(a), sqrt(1 - a))
        const d = R * c
        return d * 1000 // meters
    },

    // geojson utilities
    cloneJson(json) {
        return JSON.parse(JSON.stringify(json))
    },
    areEqual(json0, json1) {
        return JSON.stringify(json0) === JSON.stringify(json1)
    },

    // The filters modify the input json. Use cloneJson to preserve original.

    flattenMultiLineStrings(json) {
        const features = []
        json.features.forEach(feature => {
            if (feature.geometry.type === 'MultiLineString') {
                feature.geometry.coordinates.forEach(coords => {
                    const copy = Object.assign({}, feature)
                    copy.geometry.type = 'LineString'
                    copy.geometry.coordinates = coords
                    features.push(copy)
                })
            } else {
                features.push(feature)
            }
        })
        json.features = features
        return json
    },

    // The most general filter: keeps a feature only if
    // filterFcn(feature, i, features) returns true.
    // The filterFcn can also modify feature properties.
    // json is mutated, equals the return value (sugar)
    featureFilter(json, filterFcn) {
        json.features = json.features.filter(filterFcn)
        return json
    },

    // Filter by a property (path) matching one of values array.
    pathFilter(json, featurePath, values) {
        if (typeof values === 'string') values = values.split(' ')
        this.featureFilter(json, feature => {
            const value = nestedProperty(feature, featurePath)
            return values.includes(value)
        })
        return json
    },
    // The above specific to geometry (Point, Polygon, LineString)
    geometryFilter(json, values) {
        return this.pathFilter(json, 'geometry.type', values)
    },

    // Reduces the feature properties to only those in the properties array.
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

    // service highways could be of interest too, esp fire/emergency
    //     "highway": "service",
    //     "service": "xxx" where service is (in santafe zoom 10)
    //    6     "service": "emergency_access"
    //  120     "service": "alley"
    //  141     "service": "drive-through"
    // 1300     "service": "driveway"
    // 1506     "service": "parking_aisle"
    streetTypes: [
        'motorway',
        'trunk',
        'residential',
        'primary',
        'secondary',
        'tertiary',
        'motorway_link',
        'trunk_link',
        'primary_link',
        'secondary_link',
        'tertiary_link',
    ],
    streetProperties: ['highway', 'oneway', 'name', 'tiger:name_base'],
    // A simple filter for streets.
    // Filters for:
    //   - LineString geometry
    //   - highways matching streetTypes array, defaulted to above
    //   - properties reduced to streetProperties, defaulted to above
    streetsFilter(
        json,
        streetTypes = this.streetTypes,
        streetProperties = this.streetProperties
    ) {
        this.geometryFilter(json, 'LineString')
        // see https://wiki.openstreetmap.org/wiki/Highways
        // note motorway_junction's are Point geometries
        this.pathFilter(json, 'properties.highway', streetTypes)
        this.propertiesFilter(json, streetProperties)
        return json
    },

    minify(json) {
        const str = JSON.stringify(json) // compact form
        // newline for each feature
        return str.replace(/,{"type":"Feature"/g, '\n,\n{"type":"Feature"')
    },
}

export default gis
