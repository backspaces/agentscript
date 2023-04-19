import DataSet from "./DataSet.js"
import { bboxMetricSize } from './gis.js'
class GeoDataSet extends DataSet {

    /**
     * Mostly the same a DataSet except it has bounds. 
     * A few methods, like slope, dzdx, dzdy, and aspect are different because they take into account the size of the bbox in meters
     * 
     * @param {Number} width width of the DataSet in pixels
     * @param {Number} height height of the DataSet in pixels
     * @param {Array} bbox [west, south, east, north]
     * @param {TypedArray} data 
     */
    constructor(width, height, bbox, data) {
        super(width, height, data)
        this.bbox = bbox
    }

    /**
     * Create a view of a Dataset including the bounds. 
     * 
     * @static
     * @param {DataSet} dataSet 
     * @param {Array} bbox [west, south, east, north]
     * @returns {GeoDataSet} GeoDataSet view of the dataset data. It is a view not a copy. 
     */
    static viewFromDataSet(dataSet, bbox) {
        return new GeoDataSet(dataSet.width, dataSet.height, bbox, dataSet.data)
    }

    lat2y(lat) {
        const [west, south, east, north] = this.bbox
        const y = Math.round(this.height * (lat - south) / (north - south))
        return y
    }

    lon2x(lng) {
        const [west, south, east, north] = this.bbox
        const x = Math.round(this.width * (lng - west) / (east - west))
        return x
    }

    // Convert from geoon/lat coords to pixel coords
    toPixel(geoX, geoY) {
        return [this.lon2x(geoX), this.lat2y(geoY)]
    }

    // Get pixel from geo lon/lat coords to pixel coords
    getGeo(geoX, geoY) {
        const [x, y] = this.toPixel(geoX, geoY)
        return this.getXY(x, y)
    }

    // Set pixel from geo lon/lat coords to pixel coords
    // I think this could be a slow way to set data for large amounts
    setGeo(geoX, geoY, value) {
        const [x, y] = this.toPixel(geoX, geoY)
        return this.setXY(x, y, value)
    }

    /**
     * Samples a pixel at a given latitude and longitude
     * 
     * @param {Number} geoX longitude
     * @param {Number} geoY latitude
     * @param {Boolean} useNearest 
     * @throws Out Of Range Error - when it is outside of the bbox
     * @returns {Number}
     */
    sampleGeo(geoX, geoY, useNearest = true) {
        const [x, y] = this.toPixel(geoX, geoY)
        return this.sample(x, y, useNearest)
    }

    /**
     * Change in z value in terms of x. Finite difference.
     * 
     * @returns {GeoDataset}
     */
    dzdx() {
        const [widthMeters, heightMeters] = bboxMetricSize(this.bbox)
        const pixelScale = widthMeters / this.width
        const dzdx = super.dzdx(2, (1 / 8) * (1 / pixelScale)) // (1/8) for the kernel and 1/pixelscale to get units right
        const dzdx2 = GeoDataSet.viewFromDataSet(dzdx, this.bbox)
        return dzdx2
    }

    /**
     * Change in z value in terms of y. Finite difference.
     * 
     * @returns {GeoDataSet}
     */
    dzdy() {
        const [widthMeters, heightMeters] = bboxMetricSize(this.bbox)
        const pixelScale = heightMeters / this.height
        const dzdy = super.dzdy(2, (1 / 8) * (1 / pixelScale))
        const dzdy2 = GeoDataSet.viewFromDataSet(dzdy, this.bbox)
        return dzdy2
    }

    /**
     * Create dzdx, dzdy, slope, and aspect in one function. 
     * 
     * @returns {SlopeAndAspect} {dzdx, dzdy, slope, aspect}  
     */
    slopeAndAspect() {
        const dzdx = this.dzdx()
        const dzdy = this.dzdy()
        const slope = this.slope(dzdx, dzdy)
        const aspect = this.aspect(dzdx, dzdy)
        return { dzdx, dzdy, slope, aspect }
    }

    /**
     * The aspect of each pixel in radians.
     * 
     * @param {GeoDataset} dzdx 
     * @param {GeoDataSet} dzdy 
     * @returns {GeoDataSet} Aspect in radians.
     */
    aspect(dzdx = this.dzdx(), dzdy = this.dzdy()) {
        const asp = dzdx.map((x, i) => {
            const y = dzdy.data[i]
            const a = Math.atan2(-y, -x)
            return a
        })
        return asp
    }

    /**
     * Returns the slope in radians
     * 
     * @param {GeoDataset} dzdx 
     * @param {GeoDataset} dzdy 
     * @returns {GeoDataset}
     */
    slope(dzdx = this.dzdx(), dzdy = this.dzdy()) {
        const slop = dzdx.map((x, i) => {
            const y = dzdy.data[i]
            const a = Math.hypot(-x, -y)
            const sl = (Math.PI / 2) - Math.atan2(1, a)
            return sl
        })
        return slop
    }

    //
    // The functions below are the same as DataSet's version except they return a GeoDataset instead of a dataset.
    // Is there a better way to do this?
    //
    //
    clone() {
        return new GeoDataSet(this.width, this.height, this.bbox, this.data)
    }

    resample(width, height, useNearest = true, Type = Array) {
        const a = super.resample(width, height, useNearest, Type)
        const b = GeoDataSet.viewFromDataSet(a, this.bbox)
        return b
    }

    convolve(kernel, factor = 1, crop = false) {
        const a = super.convolve(kernel, factor, crop)
        const b = GeoDataSet.viewFromDataSet(a, this.bbox)
        return b
    }

    normalize(lo = 0, hi = 1, round = false) {
        const a = super.normalize(lo, hi, round)
        const b = GeoDataSet.viewFromDataSet(a, this.bbox)
        return b
    }

    map(f) {
        const a = super.map(f)
        const b = GeoDataSet.viewFromDataSet(a, this.bbox)
        return b
    }
}

export default GeoDataSet

