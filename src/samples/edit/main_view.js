/** ****************************************************************************
 * Sample Edit main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Indicia from 'indicia';
import JST from 'JST';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';

import './styles.scss';

export default Marionette.View.extend({
  template: JST['samples/edit/main'],

  /**
   * Need to push the main content down due to the subheader
   * @returns {string}
   */
  className() {
    const sample = this.model.get('sample');
    let amount = 0;

    let classes = 'slim ';

    if (sample.get('group')) {
      amount++;
    }

    if (sample.metadata.training) {
      amount++;
    }

    // eslint-disable-next-line
    classes += amount > 0 ? `band-margin-${amount}` : '';
    return classes;
  },

  initialize() {
    const sample = this.model.get('sample');
    this.listenTo(sample, 'geolocation', this.render);
  },

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};

    const attrLocks = {
      date: appModel.isAttrLocked('date', sample.get('date')),
      location: appModel.isAttrLocked('location', location),
      locationName: appModel.isAttrLocked('locationName', location.name),
      activity: appModel.isAttrLocked('activity', sample.get('group')),
      activity: appModel.isAttrLocked('country', sample.get('country')),
      activity: appModel.isAttrLocked('your-ref', sample.get('your-ref')),
    };

    const validationError = sample.metadata.validationError;
    const attrErrors = validationError ? {
      'lab-ref': validationError.attributes['lab-ref'],
      'soil': validationError.attributes['depth'] || validationError.attributes['sample-type'],
      'site': validationError.attributes['field-size'],
      'laboratory': validationError.attributes['lab-name'] || validationError.attributes['client-code'],
    } : {};

    // show activity title.
    const group = sample.get('group');

    return {
      id: sample.cid,
      uid: sample.get('uid'),
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      locationName: location.name,
      yourRef: sample.get('your-ref') && StringHelp.limit(sample.get('your-ref')),
      labRef: sample.get('lab-ref') && StringHelp.limit(sample.get('lab-ref')),
      date: DateHelp.print(sample.get('date'), true),
      country: sample.get('country'),
      soil: sample.get('depth') && StringHelp.limit(sample.get('depth')),
      site: sample.get('field-name') && StringHelp.limit(sample.get('field-name')),
      laboratory: sample.get('lab-name') && StringHelp.limit(sample.get('lab-name')),
      group_title: group ? group.title : null,
      group,
      locks: attrLocks,
      errors: attrErrors,
    };
  },
});
