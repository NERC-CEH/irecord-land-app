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

    let fieldSize = sample.get('field-size');
    if (fieldSize !== undefined ) {
      fieldSize += ($.isNumeric(fieldSize) ? ' ha' : '');
    }
      
    const attrLocks = {
      'field-name': appModel.isAttrLocked('field-name', sample.get('field-name')),
      'field-size': appModel.isAttrLocked('field-size', sample.get('field-size')),
      'crop-present': appModel.isAttrLocked('crop-present', sample.get('crop-present')),
      'crop-future': appModel.isAttrLocked('crop-future', sample.get('crop-future')),
      'straw': appModel.isAttrLocked('straw', sample.get('straw')),
      'manure': appModel.isAttrLocked('manure', sample.get('manure')),
      'tillage': appModel.isAttrLocked('tillage', sample.get('tillage')),
      'habitat': appModel.isAttrLocked('habitat', sample.get('habitat')),
      'field-notes': appModel.isAttrLocked('field-notes', sample.get('field-notes')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'field-size': validationError.attributes['field-size'],
    } : {};

    return {
      id: sample.cid,
      fieldName: sample.get('field-name') && StringHelp.limit(sample.get('field-name')),
      fieldSize,
      cropPresent: sample.get('crop-present') && StringHelp.limit(sample.get('crop-present')),
      cropFuture: sample.get('crop-future') && StringHelp.limit(sample.get('crop-future')),
      straw: sample.get('straw'),
      manure: sample.get('manure'),
      tillage: sample.get('tillage') && StringHelp.limit(sample.get('tillage')),
      habitat: sample.get('habitat') && StringHelp.limit(sample.get('habitat')),
      fieldNotes: sample.get('field-notes') && StringHelp.limit(sample.get('field-notes')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
