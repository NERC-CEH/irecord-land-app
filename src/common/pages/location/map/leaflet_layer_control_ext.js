export default L.Control.Layers.extend({

  initialize(baseLayers, overlays, options) {
    this._layerControlSliders = [];
    L.Control.Layers.prototype.initialize.call(this, baseLayers, overlays, options);
  },

  _addItem(obj) {
    let label =  L.Control.Layers.prototype._addItem.call(this, obj);
    
    if (obj.overlay) {
      let slider = document .createElement('input');
      slider.type = 'range';
      slider.className = 'leaflet-control-layers-transparency';
      slider.min = '0';
      slider.max = '1';
      slider.step = '0.1';
      slider.value = obj.layer.options.opacity;
  
      this._layerControlSliders.push(slider);
      slider.layerId = L.Util.stamp(obj.layer);
      
      L.DomEvent.on(slider, 'change', this._onSliderChange, this);
  
      this._overlaysList.appendChild(slider);
    }

    return label;
  },

  _onSliderChange(e) {
    const layerId = e.currentTarget.layerId
    const layer = this._getLayer(layerId).layer;
    const value = e.currentTarget.value;

    layer.setOpacity(value);
    if (value === '0') {
      if (this._map.hasLayer(layer)) {
        this._map.removeLayer(layer);
      }
    }
    else {
      if (!this._map.hasLayer(layer)) {
        this._map.addLayer(layer);
      }
    }

  
  },

});

