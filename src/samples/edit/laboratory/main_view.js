/** ****************************************************************************
 * Sample Edit Laboratory main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import StringHelp from 'helpers/string';


export default Marionette.View.extend({
  template: JST['samples/edit/laboratory/main'],

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');

    const attrLocks = {
      'lab-name': appModel.isAttrLocked('lab-name', sample.get('lab-name')),
      'client-code': appModel.isAttrLocked('client-code', sample.get('client-code')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'lab-name': validationError.attributes['lab-name'],
      'client-code': validationError.attributes['client-code'],
    } : {};

    return {
      id: sample.cid,
      labName: sample.get('lab-name') && StringHelp.limit(sample.get('lab-name')),
      clientCode: sample.get('client-code') && StringHelp.limit(sample.get('client-code')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
