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
        const elLandcover = that.$el.find('#location-landcover');
        if ($.isEmptyObject(data)) {
          elLandcover.val('No landcover available here.')
        }
        else {
          const landcover = data.layers[0].features[0].attributes.class;
          elLandcover.val(landcover);
        }
      },
      error: function (xhr, status, error) {
        const elLandcover = that.$el.find('#location-landcover');
        elLandcover.val(error);
      }
    });

  },

  getFeatureInfoUrl(layer, latlng, params) {
    // Construct a GetFeatureInfo request URL given a point
    const point = this.map.latLngToContainerPoint(latlng, this.map.getZoom());
    const size = this.map.getSize();
    const bboxLatLng = this.map.getBounds();
    const swLatLng = bboxLatLng.getSouthWest();
    const neLatLng = bboxLatLng.getNorthEast();
    const crs = L.CRS.EPSG3857;
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

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return layer._url + L.Util.getParamString(params, layer._url, true);    
  },
}

export default API;
