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
      'land-use': appModel.isAttrLocked('land-use', sample.get('land-use')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {} : {};

    return {
      id: sample.cid,
      soilType: sample.get('soil-type'),
      landUse: sample.get('land-use') && StringHelp.limit(sample.get('land-use')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
