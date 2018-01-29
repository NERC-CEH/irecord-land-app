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
      'depth': appModel.isAttrLocked('depth', sample.get('depth')),
      'sample-type': appModel.isAttrLocked('sample-type', sample.get('sample-type')),
      'soil-type': appModel.isAttrLocked('soil-type', sample.get('soil-type')),
      'calcareous': appModel.isAttrLocked('calcareous', sample.get('calcareous')),
      'structure-score': appModel.isAttrLocked('structure-score', sample.get('structure-score')),
      'structure-notes': appModel.isAttrLocked('structure-notes', sample.get('structure-notes')),
      'land-use': appModel.isAttrLocked('land-use', sample.get('land-use')),
      'sample-notes': appModel.isAttrLocked('sample-notes', sample.get('sample-notes')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'depth': validationError.attributes['depth'],
      'sample-type': validationError.attributes['sample-type'],
    } : {};

    const fieldSize = sample.get('field-size') + 
      ($.isNumeric(sample.get('field-size')) ? ' ha' : '');
    
    return {
      id: sample.cid,
      depth: sample.get('depth') && StringHelp.limit(sample.get('depth')),
      sampleType: sample.get('sample-type'),
      soilType: sample.get('soil-type'),
      calcareous: sample.get('calcareous'),
      structureScore: sample.get('structure-score'),
      structureNotes: sample.get('structure-notes') && StringHelp.limit(sample.get('structure-notes')),
      landUse: sample.get('land-use') && StringHelp.limit(sample.get('land-use')),
      sampleNotes: sample.get('sample-notes') && StringHelp.limit(sample.get('sample-notes')),
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
