/** ****************************************************************************
 * Location main view map functions.
 *
 `
 |                Map zoom level to accuracy map
 |                +----------------------------+
 |
 |            WGS84   OSGB1936   GRIDREF    GPS ACC.
 |                                ACC.
 |
 |             + 18                4           10m
 |             |                   4           10m
 |             |                   3          100m
 |             | 15   9 +          3          100m
 |             | 14   8 |          3          100m
 |             |        |          2         1000m
 |             | 12   6 |          2         1000m
 |             |        |          2         1000m
 |             | 10   4 |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             + 6    0 +          1        10000m
 +
 *
 *****************************************************************************/

import $ from 'jquery';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/layers-2x.png';
import 'leaflet/dist/images/layers.png';
import L from 'leaflet';
import CONFIG from 'config';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import 'os-leaflet';
import 'leaflet.gridref';
import bigu from 'bigu';
import LeafletButton from './leaflet_button_ext';
import LeafletayerControl from './leaflet_layer_control_ext';
import mapMarker from './marker';
import gpsFunctions from './gps';
import landcover from './landcover';
import './legend.scss';


let OS_CRS = L.OSMapApi.CRS;
/*
 * L.OSMapAPI.CRS declares 10 resolutions (0-9)
 * [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75]
 * Leaflet can scale up the last native zoom level as long as the 
 * CRS._scales array has corresponding values. 
 * The first OS zoom level is about the same as the 6th standard web
 * mercator zoom level.
 * By adding 6 values to the front of the scales array and setting
 * OS_ZOOM_OFFSET = -6 we can can have consistent zoom levels used
 * across the different projections.
 * 
 * Leaflet disables base maps in the layer switcher that do not support
 * the current zoom level. It also disables the zoom buttons when you 
 * reach the limit of zoom for the current base layer.
 */

// Extend the CRS resolutions to emulate the zoom levels of WGS84
OS_CRS.options.resolutions.push(1.75/2, 1.75/4, 1.75/8);
OS_CRS.options.resolutions.unshift(896*64, 896*32, 896*16, 896*8, 896*4, 896*2);
OS_CRS._scales.push(2/1.75, 4/1.75, 8/1.75);
OS_CRS._scales.unshift(1/(896*64), 1/(896*32), 1/(896*16), 1/(896*8), 1/(896*4), 1/(896*2));

const OS_MAX_ZOOM = 18;
const OS_MAX_NATIVE_ZOOM = 15;
const OS_MIN_ZOOM = 6;
const OS_ZOOM_OFFSET = -6;
const WGS84_MIN_ZOOM = 6;

const DEFAULT_LAYER = 'OS';
const DEFAULT_LAYER_ZOOM = 7
const DEFAULT_CENTER = [53.7326306, -2.6546124];

const GRID_STEP = 100000; // meters

const API = {
  initMap() {
    Log('Location:MainView:Map: initializing.');

    this.map = null;
    this.layers = this.getLayers();

    this.currentLayerControlSelected = false;
    this.currentLayer = null;

    this._refreshMapHeight();

    this.map = L.map(this.$container);

    // default layer
    this.currentLayer = this._getCurrentLayer();
    if (this.currentLayer === 'OS') this.map.options.crs = OS_CRS;

    // position view
    this._repositionMap();

    // show default layer
//    this.layers[this.currentLayer].addTo(this.map);
    this.layers.OS.addTo(this.map);
    this.layers.Landcover.addTo(this.map);
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles

    this.map.on('baselayerchange', this._updateCoordSystem, this);

    // Event triggered when land cover map overlay enabled.
    this.map.on('overlayadd', () => {
      const $legendBtn = this.$el.find('.legend-btn');
      if ($legendBtn.length === 0) {
        // Add the legend control if not present.
        this.addLegend();
      }
      else {
        // Show the legend control if already present.
        $legendBtn.show();
      }
    }, this);

    // Event triggered when land cover map overlay disabled.
    this.map.on('overlayremove', () => {
      this.$el.find('.legend-btn').hide()
    }, this);

    // Layer Control
    this.addControls();

    // GPS
    this.addGPS();

    // Past locations
    this.addPastLocations();

    // Marker
    this.addMapMarker();

    // Graticule
    this.addGraticule();
  },

  getLayers() {
    const layers = {};
    layers.Satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: CONFIG.map.mapbox_satellite_id,
      accessToken: CONFIG.map.mapbox_api_key,
      tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
      minZoom: WGS84_MIN_ZOOM,
    });

    layers.OSM = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: CONFIG.map.mapbox_osm_id,
      accessToken: CONFIG.map.mapbox_api_key,
      tileSize: 256, // specify as, OS layer overwites this with 200 otherwise
      minZoom: WGS84_MIN_ZOOM,
    });

    layers.Landcover = L.tileLayer.wms('https://catalogue.ceh.ac.uk/maps/987544e0-22d8-11e4-8c21-0800200c9a66?', {
      layers: 'LC.LandCoverSurfaces',
      attribution: 'Based upon LCM2007 © NERC (CEH) 2011',
      opacity: 0.5,
      minZoom: OS_MIN_ZOOM,
      crs: OS_CRS,
    });

    const key = CONFIG.map.os_api_key;
    layers.OS = L.OSMapApi.tilelayer(key, {
      maxNativeZoom: OS_MAX_NATIVE_ZOOM,
      maxZoom: OS_MAX_ZOOM,
      minZoom: OS_MIN_ZOOM,
      zoomOffset: OS_ZOOM_OFFSET,
      crs: OS_CRS,
    });
    return layers;
  },

  addControls() {
    Log('Location:MainView:Map: adding layer controls.');

    this.controls = new LeafletayerControl({
      'Ordnance Survey': this.layers.OS,
      'Open Street Map': this.layers.OSM,
      Satellite: this.layers.Satellite,
    }, {
      'Land Cover 2007': this.layers.Landcover
    });
    this.map.addControl(this.controls);
  },

  addPastLocations() {
    if (this.options.hidePast) {
      return;
    }

    Log('Location:MainView:Map: adding past locations button.');

    const that = this;
    const button = new LeafletButton({
      position: 'topright',
      className: 'past-btn',
      title: 'Navigate to past locations',
      body: '<span class="icon icon-history"></span>',
      onClick() {
        that.trigger('past:click');
      },
      maxWidth: 30,  // number
    });

    this.map.addControl(button);
    const sample = this.model.get('sample');
    if (sample.isGPSRunning()) {
      this._set_gps_progress_feedback('pending');
    } else {
      this._set_gps_progress_feedback('');
    }
  },

  addLegend() {
    Log('Location:MainView:Map: adding legend button.');

    const that = this;
    const legend = 'https://catalogue.ceh.ac.uk/maps/987544e0-22d8-11e4-8c21-0800200c9a66?language=eng&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=LC.LandCoverSurfaces&format=image/png&STYLE=default'
    const button = new LeafletButton({
      position: 'topright',
      className: 'legend-btn',
      title: 'Show legend',
      body: `<span class="icon icon-list"></span><img src="${legend}" style="display: none"/>`,
      onClick() {
        that.toggleLegend();
      },
      maxWidth: 30,  // number
    });

    this.map.addControl(button);
  },

  toggleLegend() {
    Log('Location:MainView:Map: toggling legend.');
    const $btn = this.$el.find('.legend-btn');
    const $icon = $btn.find('span');
    const $legend = $btn.find('img');
    $icon.toggle();
    $legend.toggle();
    $btn.toggleClass('leaflet-control-legend-expanded');
  },

  addGraticule() {
    Log('Location:MainView:Map: adding graticule.');

    const appModel = this.model.get('appModel');
    const useGridRef = appModel.get('useGridRef');
    const useGridMap = appModel.get('useGridMap');
    if (!useGridRef || !useGridMap) return;

    const that = this;

    function getColor() {
      let color;
      switch (that.currentLayer) {
        case 'OS':
          color = '#08b7e8';
          break;
        case 'OSM':
          color = 'gray';
          break;
        default:
          color = 'white';
      }
      return color;
    }

    const gridRef = new L.GridRef({ color: getColor() });

    gridRef.update = () => {
      const zoom = that.map.getZoom();
      // calculate granularity
      const color = getColor();
      const bounds = that.map.getBounds();
      const granularity = gridRef._getGranularity(zoom);
      const step = GRID_STEP / granularity;

      const polylinePoints = gridRef._calcGraticule(step, bounds);
      gridRef.setStyle({ color });
      gridRef.setLatLngs(polylinePoints);
    };
    gridRef.addTo(this.map);
  },

  _repositionMap(dontZoom) {
    const location = this._getCurrentLocation();
    let zoom;
    if (!dontZoom) {
      zoom = this._metresToMapZoom(location.accuracy);
    } else {
      zoom = this.map.getZoom();
    }
    this.map.setView(this._getCenter(location), zoom);
  },

  _getCurrentLayer() {
    let layer = DEFAULT_LAYER;
    const location = this._getCurrentLocation();
    const zoom = this._metresToMapZoom(location.accuracy);
    let inGB = LocHelp.isInGB(location);

    if (!location.latitude) {
      // if no location default to true
      inGB = true;
    }

    const validOSzoom = this._isValidOSZoom(zoom);

    if (!validOSzoom) {
      layer = 'Satellite';
    } else if (!inGB) {
      this.currentLayerControlSelected = true;
      layer = 'Satellite';
    }

    return layer;
  },

  /**
   * Set full remaining height.
   */
  _refreshMapHeight() {
    Log('Location:MainView:Map: refreshing map height.');
    this.$container = this.$el.find('#map')[0];
    $(this.$container).style = 'height: 100vh;';
  },

  _updateCoordSystem(e) {
    // Leaflet does not willingly support dynamic change of CRS, 
    // https://github.com/Leaflet/Leaflet/issues/2553
    Log('Location:MainView:Map: updating coord system.');

    let nextLayer = e.name;
    this.currentLayerControlSelected = this.controls._handlingClick;

    if (this.currentLayer === 'OS' || nextLayer === 'Ordnance Survey') {
      // Switching projection
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      const landcover = this.layers.Landcover;
      const landcoverWmsVersion = parseFloat(landcover.wmsParams.version);
      const landcoverProjectionKey = landcoverWmsVersion >= 1.3 ? 'crs' : 'srs';
   
      if (nextLayer === 'Ordnance Survey') {
        // a change from WGS84 -> OS
        this.map.options.crs = OS_CRS;
        landcover.options.crs =  OS_CRS;
        landcover.options.minZoom =  OS_MIN_ZOOM;
        landcover.wmsParams[landcoverProjectionKey] = OS_CRS.code;
        nextLayer = 'OS';
      }
      else {
        this.map.options.crs = L.CRS.EPSG3857;
        landcover.options.crs =  L.CRS.EPSG3857;
        landcover.options.minZoom =  WGS84_MIN_ZOOM;
        landcover.wmsParams[landcoverProjectionKey] = L.CRS.EPSG3857.code;
      }
  
      // Reset everything to new projection
      this.map.setView(center, zoom);
      this.map._resetView(center, zoom, true);
      if (this.map.hasLayer(landcover)){
        this.map.removeLayer(landcover);
        this.map.addLayer(landcover);
      }
    }

    this.currentLayer = nextLayer;
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles
  },

  _getCenter(location = {}) {
    let center = DEFAULT_CENTER;
    if (location.latitude) {
      center = [location.latitude, location.longitude];
    }
    return center;
  },

  /**
   * Checks if the zoom level fits within OSGB map zoom max/min.
   * @param zoom
   * @returns {boolean}
   */
  _isValidOSZoom(zoom) {
    return zoom >= OS_MIN_ZOOM && zoom <= OS_MAX_ZOOM;
  },

   /**
   * Transform location accuracy to WGS84 map zoom level.
   * @param metres
   * @private
   */
  _metresToMapZoom(metres) {
    if (!metres) {
      return DEFAULT_LAYER_ZOOM;
    }

    if (metres >= 5000) {
      return 9;
    } else if (metres >= 1000) {
      return 12; // tetrad
    } else if (metres >= 500) {
      return 13;
    } else if (metres >= 50) {
      return 16;
    }

    return 18;
  },

  /**
   * Transform WGS84 map zoom to radius in meters.
   * @param zoom
   * @returns {*}
   * @private
   */
  _mapZoomToMetres(zoom) {
    let scale;
    if (zoom <= 10) {
      scale = 0;
    } else if (zoom <= 12) {
      return 1000; // tetrad (radius is 1000m)
    } else if (zoom <= 13) {
      scale = 1;
    } else if (zoom <= 16) {
      scale = 2;
    } else {
      scale = 3;
    }

    scale = 5000 / Math.pow(10, scale); // meters
    return scale < 1 ? 1 : scale;
  },
};

$.extend(API, mapMarker);
$.extend(API, gpsFunctions);
$.extend(API, landcover);

export default API;
