import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'nav',
  template: JST['common/header'],

  className() {
    return `common-header ${this.options.classes}`;
  },

  regions: {
    leftPanel: '#left-panel',
    rightPanel: '#right-panel',
    subheader: '#subheader',
  },

  events: {
    'click a[data-rel="back"]': 'navigateBack',
  },

  onRender() {
    if (this.options.rightPanel) {
      this.getRegion('rightPanel').show(this.options.rightPanel);
    }

    if (this.options.subheader) {
      this.getRegion('subheader').show(this.options.subheader);
    }
  },

  navigateBack() {
    const title = this.model.get('title');
    
    if (((title === 'date') || (title === 'comment')) && this.options.onExit) {
      this.options.onExit();
    } else {
      //no need to save any changes as we simply backed out of the window and left everything as it was
      window.history.back();
    }
  },
});
