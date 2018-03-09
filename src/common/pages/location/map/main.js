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
 |             + 18   12+          4           10m
 |             |        |          4           10m
 |             |        |          3          100m
 |             | 15   9 |          3          100m
 |             | 14   8 |          3          100m
 |             |        |          2         1000m
 |             | 12   6 |          2         1000m
 |             |        |          2         1000m
 |             | 10   4 |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             | 6    0 +          1        10000m
 |             + 5                 1        10000m
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
import mapMarker from './marker';
import gpsFunctions from './gps';
import landcover from './landcover';
import './legend.scss';

/*
 * L.OSOpenSpace.CRS declares 10 resolutions (0-9)
 * [2500, 1000, 500, 200, 100, 50, 25, 10, 5, 2.5]
 * Of these, only the first 9 are of interest, the 10th being a vector
 * map which loses all the physical features of the 1:50k raster map.
 * Therefore we limit ourselves to MAX_OS_NATIVE_ZOOM = 8.
 * Leaflet can scale up the last native zoom level as long as the 
 * CRS._scales array has corresponding values. By adding three more
 * entries to the scales array we obtain maps for zoom levels of (0-12).
 * The offset between these and normal web mercator zoom levels is
 * OS_ZOOM_DIFF = 6 so this is equivalent to (6-18)
 * 
 * Leaflet disables base maps in the layer switcher that do not support
 * the current zoom level. It also disables the zoom buttons when you 
 * reach the limit of zoom for the current base layer.
 */

const MAX_OS_ZOOM = 12;
const MAX_OS_NATIVE_ZOOM = 8;
const MIN_WGS84_ZOOM = 5;
const OS_ZOOM_DIFF = 6;
let OS_CRS = L.OSOpenSpace.CRS;
OS_CRS.options.resolutions.push(1, 0.5, .25);
OS_CRS._scales.push(1, 2, 4);

const DEFAULT_LAYER = 'OS';
const DEFAULT_LAYER_ZOOM = 1 + OS_ZOOM_DIFF; // 7 and not 1 because of WGS84 scale
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
    this.layers[this.currentLayer].addTo(this.map);
    this.layers.Landcover.addTo(this.map);
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles

    this.map.on('baselayerchange', this._updateCoordSystem, this);
//    this.map.on('zoomend', this.onMapZoom, this);

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
      minZoom: MIN_WGS84_ZOOM,
    });

    layers.OSM = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: CONFIG.map.mapbox_osm_id,
      accessToken: CONFIG.map.mapbox_api_key,
      tileSize: 256, // specify as, OS layer overwites this with 200 otherwise
      minZoom: MIN_WGS84_ZOOM,
    });

    layers.Landcover = L.tileLayer.wms('https://catalogue.ceh.ac.uk/maps/987544e0-22d8-11e4-8c21-0800200c9a66?', {
      layers: 'LC.LandCoverSurfaces',
      attribution: 'Based upon LCM2007 © NERC (CEH) 2011',
      opacity: 0.5,
      crs: OS_CRS,
    });

    const start = new bigu.OSRef(0, 0).to_latLng();
    const end = new bigu.OSRef(7 * GRID_STEP, 13 * GRID_STEP).to_latLng();
    const bounds = L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]);

    
    
    layers.OS = L.OSOpenSpace.tilelayer(CONFIG.map.os_api_key, null, {
      crs: OS_CRS,
      maxZoom: MAX_OS_ZOOM,
      maxNativeZoom: MAX_OS_NATIVE_ZOOM,
    });
    layers.OS.options.bounds = bounds;
    
    layers.OS.on('tileerror', (tile) => {
      let index = 0;
      const result = tile.tile.src.match(/missingTileString=(\d+)/i);
      if (result) {
        index = parseInt(result[1], 10);
        index++;

        // don't do it more than few times
        if (index < 4) {
          // eslint-disable-next-line
          tile.tile.src = tile.tile.src.replace(/missingTileString=(\d+)/i, '&missingTileString=' + index);
        }
      } else if (index === 0) {
        // eslint-disable-next-line
        tile.tile.src = tile.tile.src + '&missingTileString=' + index;
      }
    });


/**************************************************************************
 * TODO
 * 
 * I want to mess with the maxZoom so that, when the OS layer is enabled,
 * the zoom control is disabled at the correct zoom limits (>12), yet, when a
 * web mercator layer is enabled, the layer switcher shows the OS layer as available
 * when zoom level <= 18.
 * Because on switching layers the zoom limits are calculated early I need
 * to extend OSOpenSpace and overrid beforeAdd and beforeRemove

    layers.OS.beforeAdd = function(map) {
      this.options.maxZoom = MAX_OS_ZOOM;
      L.OSOpenSpace.prototype.onAdd.call(this, map);
    }



 ****************************************************************************/

    return layers;
  },

  addControls() {
    Log('Location:MainView:Map: adding layer controls.');

    this.controls = L.control.layers({
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
      const zoom = that.getMapZoom();
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

  /**
   * Normalises the map zoom level between different projections.
   * @param layer
   * @returns {*}
   */
  getMapZoom(zoom) {
    let normalZoom = zoom || this.map.getZoom();

    if (this.currentLayer === 'OS') {
      normalZoom += OS_ZOOM_DIFF;
    }

    return normalZoom;
  },

  onMapZoom() {
    const zoom = this.getMapZoom();
    Log(`Location:MainView:Map: executing onMapZoom: ${zoom}`);

    const validOSZoom = API._isValidOSZoom(zoom);

    if (this.currentLayer === 'OS' && !validOSZoom) {
      // change to WGS84
      Log('Location:MainView:Map: changing to Sattelite layer');
      this.map.removeLayer(this.layers.OS);
      this.map.addLayer(this.layers.Satellite);
    } else {
      const isSatellite = this.currentLayer === 'Satellite';
      if (isSatellite && validOSZoom) {
        // only change base layer if user is on OS and did not specificly
        // select OSM/Satellite
        const inGB = LocHelp.isInGB(this._getCurrentLocation());
        if (!this.currentLayerControlSelected && inGB) {
          Log('Location:MainView:Map: changing to OS layer');
          this.map.removeLayer(this.layers.Satellite);
          this.map.addLayer(this.layers.OS);
        }
      }
    }
  },

  _repositionMap(dontZoom) {
    const location = this._getCurrentLocation();
    let zoom;
    if (!dontZoom) {
      zoom = this._metresToMapZoom(location.accuracy);
      if (this.currentLayer === 'OS') {
        zoom = this._deNormalizeOSzoom(zoom);
      }
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
    // const mapHeight = $(document).height() - 47 - 47 - 44;// - 47 - 38.5;
    this.$container = this.$el.find('#map')[0];
    // $(this.$container).height(mapHeight);
    $(this.$container).style = 'height: 100vh;';
  },

  _updateCoordSystem(e) {
    // Leaflet does not willingly support dynamic change of CRS, 
    // https://github.com/Leaflet/Leaflet/issues/2553
    Log('Location:MainView:Map: updating coord system.');

    let nextLayer = e.name;

    this.currentLayerControlSelected = this.controls._handlingClick;

    const center = this.map.getCenter();
    let zoom = this.getMapZoom();
   

    // a change from WGS84 -> OS
    if (nextLayer === 'Ordnance Survey') {
      zoom = API._deNormalizeOSzoom(zoom);
      this.map.options.crs = OS_CRS;
      this.layers.OS.options.maxZoom = MAX_OS_ZOOM;
      this.layers.Landcover.crs =  OS_CRS;
      nextLayer = 'OS';
    }
    else {
      this.map.options.crs = L.CRS.EPSG3857;
      this.layers.Landcover.crs =  L.CRS.EPSG3857;
      this.layers.OS.options.maxZoom = MAX_OS_ZOOM + OS_ZOOM_DIFF;
    }

    this.currentLayer = nextLayer;

    this.map.setView(center, zoom);
    this.map._resetView(center, zoom, true);
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
   * Checks if the WGS84 map zoom level fits within OSGB map zoom max/min.
   * @param zoom
   * @returns {boolean}
   */
  _isValidOSZoom(zoom) {
    const deNormalizedZoom = zoom - OS_ZOOM_DIFF;
    return deNormalizedZoom >= 0 && deNormalizedZoom <= MAX_OS_ZOOM - 1;
  },

  /**
   * Turns WGS84 map zoom into OSGB zoom.
   * @param zoom
   * @returns {number}
   */
  _deNormalizeOSzoom(zoom) {
    const deNormalizedZoom = zoom - OS_ZOOM_DIFF;
    if (deNormalizedZoom > MAX_OS_ZOOM - 1) {
      return MAX_OS_ZOOM - 1;
    } else if (deNormalizedZoom < 0) {
      return 0;
    }

    return deNormalizedZoom;
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
