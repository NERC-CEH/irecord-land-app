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
      'crop-present': appModel.isAttrLocked('crop-present', sample.get('crop-present')),
      'habitat': appModel.isAttrLocked('habitat', sample.get('habitat')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'habitat': validationError.attributes['habitat'],
    } : {};

    return {
      id: sample.cid,
      cropPresent: sample.get('crop-present') && StringHelp.limit(sample.get('crop-present')),
      habitat: sample.get('habitat') && StringHelp.limit(sample.get('habitat')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
