/** ****************************************************************************
 * General survey configuration file.
 *****************************************************************************/
import $ from 'jquery';
import Indicia from 'indicia';
import DateHelp from 'helpers/date';

const config = {
  survey_id: 3,
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

    'soil-type': {
      label: 'Select the soil type.',
      id: 56,
      values: {
        'Sand': 284,
        'Loam': 285,
        'Silt': 286,
        'Clay': 287,
      },
    },

    'soil-feature': {
      label: 'Select a feature, if present.',
      id: 57,
      values: {
        'Erosion water or wind': 288,
        'Landslide': 289,
        'Compaction / poaching / wheel ruts': 290,
        'Dry cracking soil': 291,
        'Soil with ponded water': 292,
        'Soil animals mole hills / burrows': 293,
        'Salt on surface': 294,
        'Other': 295,
      },
    },

    'crop': {
      label: 'Select a crop, if present.',
      id: 58,
      values: {
        'Barley': 272,
        'Fallow': 273,
        'Field bean': 274,
        'Grass (improved)': 275,
        'Maize': 276,
        'Oats': 277,
        'Oilseed rape': 278,
        'Other crop': 279,
        'Peas': 280,
        'Potatoes': 281,
        'Suger / fodder beet': 282,
        'Wheat': 283,
      },
    },

    'habitat': {
      label: 'Select the broad habitat where the sample is being taken.',
      id: 59,
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
