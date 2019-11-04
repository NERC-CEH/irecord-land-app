import $ from 'jquery';
import Log from 'helpers/log';
import L from 'leaflet';

const API = {
  updateLandcover(location) {
    const latlng = L.latLng(location.latitude, location.longitude);
    const url = this.getFeatureInfoUrl(this.layers.Landcover, latlng, {});
    const that = this;
    $.ajax({
      url: url,
      dataType: "json",
      success: function (data, status, xhr) {
        //const elLandcover = that.$el.find('#location-landcover');
        if ($.isEmptyObject(data)) {
          that.triggerMethod('landcover:update', undefined);
        }
        else {
          const landcover = data.layers[0].features[0].attributes.class;
          that.triggerMethod('landcover:update', landcover);
        }
      },
      error: function (xhr, status, error) {
        that.triggerMethod('landcover:error', error);
      }
    });

  },

  /**
   *  Construct a GetFeatureInfo request URL to the given layer
   *  at the given latlng. 
   */
  getFeatureInfoUrl(layer, latlng, params) {
    // Get the pixel coordinates of the latlng.
    const point = this.map.latLngToContainerPoint(latlng, this.map.getZoom());
    // Get the map size in pixels.
    const size = this.map.getSize();
    // Get the map bounding box in units of the CRS
    const bboxLatLng = this.map.getBounds();
    const swLatLng = bboxLatLng.getSouthWest();
    const neLatLng = bboxLatLng.getNorthEast();
    const crs = layer._crs;
    const swCrs = crs.project(swLatLng);
    const neCrs = crs.project(neLatLng);
    const bboxCrs = `${swCrs.x},${swCrs.y},${neCrs.x},${neCrs.y}`;
  
    const defaultParams = {
      request: 'GetFeatureInfo',
      service: 'WMS',
      srs: layer._crs.code,
      styles: '',
      version: layer._wmsVersion,
      bbox: bboxCrs,
      width: size.x,
      height: size.y,
      layers: layer.options.layers,
      query_layers: layer.options.layers,
      info_format: 'application/json'
    };

    params = L.Util.extend(defaultParams, params || {});

    // The query point parameter keys are i,j for WMS 1.3.0
    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return layer._url + L.Util.getParamString(params, layer._url, true);    
  },
}

export default API;
