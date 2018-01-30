/** ****************************************************************************
 * Sample Edit Site main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import StringHelp from 'helpers/string';
import $ from 'jquery';


export default Marionette.View.extend({
  template: JST['samples/edit/soil/main'],

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');

    const attrLocks = {
      'soil-type': appModel.isAttrLocked('soil-type', sample.get('soil-type')),
      'soil-feature': appModel.isAttrLocked('soil-feature', sample.get('soil-feature')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {} : {};

    return {
      id: sample.cid,
      soilType: sample.get('soil-type'),
      soilFeature: sample.get('soil-feature') && StringHelp.limit(sample.get('soil-feature')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
