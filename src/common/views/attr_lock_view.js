import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import JST from 'JST';

export default Marionette.View.extend({
  template: JST['common/lock'],

  initialize() {
    Log('AttrLock:View: initializing.');
    this.onLockClick = this.options.onLockClick;
    const appModel = this.model.get('appModel');
    this.listenTo(appModel, 'change:attrLocks', this.render);
  },

  triggers: {
    'click #lock-btn': 'lock:click',
  },

  serializeData() {
    const appModel = this.model.get('appModel');
    const sample = this.model.get('sample');
    const survey = sample.metadata.survey;
    const attr = this.options.attr;
    const value = sample.get(this.options.attr);

    let locked = false;
    // check if the same value has been locked
    locked = appModel.isAttrLocked(attr, value, survey);

    return {
      locked,
    };
  },
});
