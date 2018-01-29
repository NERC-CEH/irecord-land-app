/** ****************************************************************************
 * General survey configuration file.
 *****************************************************************************/
import $ from 'jquery';
import Indicia from 'indicia';
import DateHelp from 'helpers/date';
import cropsData from 'crops.data';

const crops = {};
cropsData.forEach((el) => {
  crops[el.name] = el.id;
});

const config = {
  survey_id: 2,
  input_form: 'poc-recording-form',

  sample: {
    location: {
      values(location, submission) {
        // convert accuracy for map and gridref sources
        const accuracy = location.accuracy;
        const attributes = {};
        const keys = config.sample;
        attributes.location_name = location.name; // this is a native indicia attr
        attributes[keys.location_source.id] = location.source;
        attributes[keys.location_gridref.id] = location.gridref;
        attributes[keys.location_altitude.id] = location.altitude;
        attributes[keys.location_altitude_accuracy.id] = location.altitudeAccuracy;
        attributes[keys.location_accuracy.id] = accuracy;

        // add other location related attributes
        $.extend(submission.fields, attributes);

        return `${location.latitude}, ${location.longitude}`;
      },
    },
    location_accuracy: { id: 36 },
    location_altitude: { id: 37 },
    location_altitude_accuracy: { id: 38 },
    location_source: { id: 39 },
    location_gridref: { id: 40 },

    device: {
      id: 41,
      values: {
        iOS: 233,
        Android: 234,
      },
    },

    device_version: { id: 42 },

    uid: { id: 35 },

    'your-ref': {
      label: 'Add your own reference, if you wish, to help identify the sample.',
      id: 24,
    },

    'soil-type': {
      label: 'Select the soil type.',
      id: 29,
      values: {
        'Light - sand etc.': 144,
        'Medium - loams': 145,
        'Heavy - clay': 146,
        'Organic - high OM content': 147,
        'Peaty soils': 148,
      },
    },

    'land-use': {
      label: 'Select the rotational land use.',
      id: 43,
      values: {
        'Cropping - combinable crops': 239,
        'Cropping - rotation including late harvested crops': 240,
        'Cropping - rotation including leys': 241,
        'Cropping - field-scale vegetables': 242,
        'Grassland - intensively managed': 243,
        'Grassland - permanent pasture': 244,
      },
    },

    'crop-present': {
      label: 'Select the crop present in the field.',
      id: 30,
      values: crops,
    },

    'habitat': {
      label: 'Select the broad habitat where the sample is being taken.',
      id: 46,
      values: {
        'Arable and horticulture': 245,
        'Calcareous grassland': 246,
        'Improved grassland': 247,
        'Neutral grassland': 248,
        'Acid grassland': 249,
        'Rough grassland': 250,
        'Fen, marsh, swamp': 251,
        'Bog': 252,
        'Heather grassland': 253,
        'Heather': 254,
        'Broadleaved woodland': 255,
        'Coniferous woodland': 256,
        'Montane habitat': 257,
        'Inland rock': 258,
        'Freshwater': 259,
        'Saltmarsh': 260,
        'Supra-littoral sediment': 261,
        'Supra-littoral rock': 262,
        'Littoral-sediment': 263,
        'Littoral-rock': 264,
        'Saltwater': 265,
        'Suburban': 266,
        'Urban': 267,
      },
    },

    date: {
      values(date) {
        return DateHelp.print(date);
      },
    },

    group: {
      values(group) {
        return group.id;
      },
    },

    comment: {
      label: 'Please add any extra info about this record.',
    },
  },

  occurrence: {
    training: {
      id: 'training',
    },

    taxon: {
      values(taxon) {
        return taxon.warehouse_id;
      },
    },
  },

  verify(attrs) {
    const attributes = {};

    // todo: remove this bit once sample DB update is possible
    // check if saved or already send
    if (!this.metadata.saved || this.getSyncStatus() === Indicia.SYNCED) {
      attributes.send = false;
    }

    // location
    const location = attrs.location || {};
    if (!location.latitude) {
      attributes.location = 'Missing';
    }

    // date
    if (!attrs.date) {
      attributes.date = 'Missing';
    } else {
      const date = new Date(attrs.date);
      if (date === 'Invalid Date' || date > new Date()) {
        attributes.date = (new Date(date) > new Date()) ? 'Future date' : 'Invalid';
      }
    }

    // soil type required
    if (!attrs['soil-type']) {
      attributes['soil-type'] = 'Missing';
    }

    return [attributes, null, null];
  },
};

export default config;
