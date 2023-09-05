/*
 * L.ElementOverlay is used to overlay images over the map (to specific geographical bounds).
 *    Basically the same as an image overlay, but it takes any element
 */

function elementOverlay_esm (L) {
    const ElementOverlay = L.ImageOverlay.extend({
        _initImage: function () {
            var img;
            if (this._image) {
                this.onRemove();
            }
            if (typeof this._url === 'string') {
                img = this._image = L.DomUtil.create(
                    'img',
                    'leaflet-image-layer ' +
                        (this._zoomAnimated ? 'leaflet-zoom-animated' : '')
                );
                img.onload = L.bind(this.fire, this, 'load');
                img.src = this._url;
            } else {
                img = this._image = this._url;
                L.DomUtil.addClass(img, 'leaflet-image-layer');
                if (this._zoomAnimated) {
                    L.DomUtil.addClass(img, 'leaflet-zoom-animated');
                }
                setTimeout(L.bind(this.fire, this, 'load'), 0);
            }
            img.onselectstart = L.Util.falseFn;
            img.onmousemove = L.Util.falseFn;
            img.alt = this.options.alt;
            img.style.position = 'absolute';
        },

        //
        // this is only needed for leaflet < 0.7.3. Can be removed with 1.0, but there is no CDN yet
        setUrl: function (url) {
            this._url = url;
            if (this._image) {
                this._image.src = url;
            }
            return this
        },
        //
        // This is also some bs related to the stable version
        //  remove this for version 1.0
        onAdd: function (map) {
            this._map = map;
            if (!this._image) {
                this._initImage();
                if (this.options.opacity < 1) {
                    this._updateOpacity();
                }
            }
            map._panes.overlayPane.appendChild(this._image);
            map.on('viewreset', this._reset, this);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.on('zoomanim', this._animateZoom, this);
            }
            this._reset();
        },
    });
    return ElementOverlay
}

export { elementOverlay_esm as default };
