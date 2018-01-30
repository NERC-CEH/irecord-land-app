/** ****************************************************************************
 * Sample Edit Site main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import StringHelp from 'helpers/string';
import $ from 'jquery';


export default Marionette.View.extend({
  template: JST['samples/edit/site/main'],

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');

    const attrLocks = {
      'crop': appModel.isAttrLocked('crop', sample.get('crop')),
      'habitat': appModel.isAttrLocked('habitat', sample.get('habitat')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'habitat': validationError.attributes['habitat'],
    } : {};

    return {
      id: sample.cid,
      crop: sample.get('crop') && StringHelp.limit(sample.get('crop')),
      habitat: sample.get('habitat') && StringHelp.limit(sample.get('habitat')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
