/** ****************************************************************************
 * Sample Show main view.
 *****************************************************************************/
import Indicia from 'indicia';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import Gallery from '../../common/gallery';
import './styles.scss';

export default Marionette.View.extend({
  template: JST['samples/show/main'],

  events: {
    'click img': 'photoView',
    'click #resend-btn': 'resend',
  },

  photoView(e) {
    e.preventDefault();

    const items = [];
    const sample = this.model.get('sample');
    sample.getOccurrence().media.each((image) => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

// Initializes and opens PhotoSwipe
    const gallery = new Gallery(items);
    gallery.init();
  },

  serializeData() {
    const sample = this.model.get('sample');
    const appModel = this.model.get('appModel');

    const syncStatus = sample.getSyncStatus();

    const locationPrint = sample.printLocation();
    const location = sample.get('location') || {};


    // show activity title.
    const group = sample.get('group');

    return {
      id: sample.id,
      cid: sample.cid,
      useExperiments: appModel.get('useExperiments'),
      site_url: CONFIG.site_url,
      isSynchronising: syncStatus === Indicia.SYNCHRONISING,
      onDatabase: syncStatus === Indicia.SYNCED,
      uid: sample.get('uid'),
      'your-ref': sample.get('your-ref') && StringHelp.limit(sample.get('your-ref')),
      location: locationPrint,
      locationName: location.name,
      date: DateHelp.print(sample.get('date'), true),
      country: sample.get('country'),

      depth: sample.get('depth'),
      'sample-type': sample.get('sample-type'),
      'soil-type': sample.get('soil-type'),
      calcareous: sample.get('calcareous'),
      'structure-score': sample.get('structure-score'),
      'structure-notes': sample.get('structure-notes'),
      'land-use': sample.get('land-use'),
      'sample-notes': sample.get('sample-notes'),

      'field-name': sample.get('field-name') && StringHelp.limit(sample.get('field-name')),
      'field-size': sample.get('field-size') + 'ha',
      'crop-present': sample.get('crop-present') && StringHelp.limit(sample.get('crop-present')),
      'crop-future': sample.get('crop-future') && StringHelp.limit(sample.get('crop-future')),
      straw: sample.get('straw'),
      manure: sample.get('manure'),
      tillage: sample.get('tillage') && StringHelp.limit(sample.get('tillage')),
      habitat: sample.get('habitat') && StringHelp.limit(sample.get('habitat')),
      'field-notes': sample.get('field-notes') && StringHelp.limit(sample.get('field-notes')),

      'lab-name': sample.get('lab-name') && StringHelp.limit(sample.get('lab-name')),
      'client-code': sample.get('client-code') && StringHelp.limit(sample.get('client-code')),

      group_title: group ? group.title : null,
      media: sample.media,
    };
  },

  /**
   * Force resend the record.
   *
   * Wipes its server values and makes it local again. Resubmitting should
   * generate a server conflict and the record should update with the same values
   * if exists already. Otherwise, a new record will be created on the server.
   */
  resend() {
    // reset the values
    const sample = this.model.get('sample');
    sample.id = null;
    sample.metadata.server_on = null;
    sample.metadata.updated_on = null;
    sample.metadata.synced_on = null;

    sample.save(null, { remote: true });

    window.history.back();
  },
});

