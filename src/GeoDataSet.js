import DataSet from "./DataSet.js"
import { bboxMetricSize } from './gis.js'


export default class GeoDataSet extends DataSet {

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
     * 
     * @param {DataSet} dataSet 
     * @param {Array} bbox [west, south, east, north]
     * @returns {GeoDataSet} GeoDataSet view of the dataset data. It is a view not a copy. 
     */
    static viewFromDataSet(dataSet, bbox){
        return new GeoDataSet(dataSet.width, dataSet.height, bbox, dataSet.data)
    }

    lat2y(lat) {
        const [west, south, east, north] = this.bbox
        const y = Math.round(this.height * (lat - south) / (north - south))
        return y
    }

    lng2x(lng) {
        const [west, south, east, north] = this.bbox
        const x = Math.round(this.width * (lng - west) / (east - west))
        return x
    }

    getLatLng(lat, lng) {
        const x = this.lng2x(lng)
        const y = this.lat2y(lat)
        return this.getXY(x,y)
    }

    setLatLng(lat, lng) {
        const x = this.lng2x(lng)
        const y = this.lat2y(lat)
        return this.setXY(x,y)
    }

    /**
     * Samples a pixel at a given latitude and longitude
     * 
     * @param {Number} lat 
     * @param {Number} lng 
     * @param {Boolean} useNearest 
     * @throws Out Of Range Error - when it is outside of the bbox
     * @returns {Number}
     */
    sampleLatLng(lat, lng, useNearest=true) {
        const x = this.lng2x(lng)
        const y = this.lat2y(lat)
        return this.sample(x,y, useNearest)
    }

    dzdx() {
        const [widthMeters, heightMeters] = bboxMetricSize(this.bbox)
        const pixelScale = widthMeters / this.width
        const dzdx = super.dzdx(2, (1 / 8) * (1 / pixelScale)) // (1/8) for the kernel and 1/pixelscale to get units right
        const dzdx2 = GeoDataSet.viewFromDataSet(dzdx, this.bbox)
        return dzdx2
    }

    dzdy() {
        const [widthMeters, heightMeters] = bboxMetricSize(this.bbox)
        const pixelScale = heightMeters / this.height
        const dzdy = super.dzdy(2, (1 / 8) * (1 / pixelScale))
        const dzdy2 = GeoDataSet.viewFromDataSet(dzdy, this.bbox)
        return dzdy2
    }

    slopeAndAspect() {
        const dzdx = this.dzdx()
        const dzdy = this.dzdy()
        const slope = this.slope(dzdx, dzdy)
        const aspect = this.aspect(dzdx, dzdy)
        return { dzdx, dzdy, slope, aspect }
    }

    aspect(dzdx = this.dzdx(), dzdy = this.dzdy()) {
        const asp = dzdx.map((x, i) => {
            const y = dzdy.data[i]
            const a = Math.atan2(-y, -x)
            return a
        })
        return asp
    }
    
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

