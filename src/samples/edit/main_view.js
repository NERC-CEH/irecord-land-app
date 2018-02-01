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
      habitat: appModel.isAttrLocked('habitat', sample.get('habitat')),
      crop: appModel.isAttrLocked('crop', sample.get('crop')),
      'soil-type': appModel.isAttrLocked('soil-type', sample.get('soil-type')),
      'soil-feature': appModel.isAttrLocked('soil-feature', sample.get('soil-feature')),
      comment: appModel.isAttrLocked('comment', sample.get('comment')),
      activity: appModel.isAttrLocked('activity', sample.get('group')),
    };

    // show activity title.
    const group = sample.get('group');

    return {
      id: sample.cid,
      uid: sample.get('uid'),
      isLocating: sample.isGPSRunning(),
      isSynchronising: sample.getSyncStatus() === Indicia.SYNCHRONISING,
      location: locationPrint,
      locationName: location.name,
      date: DateHelp.print(sample.get('date'), true),
      habitat: sample.get('habitat') && StringHelp.limit(sample.get('habitat')),
      crop: sample.get('crop') && StringHelp.limit(sample.get('crop')),
      soilType: sample.get('soil-type'),
      soilFeature: sample.get('soil-feature') && StringHelp.limit(sample.get('soil-feature')),
      comment: sample.get('comment') && StringHelp.limit(sample.get('comment')),
      group_title: group ? group.title : null,
      group,
      locks: attrLocks,
    };
  },
});
