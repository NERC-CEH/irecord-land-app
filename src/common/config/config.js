/** ****************************************************************************
 * Main app configuration file.
 *****************************************************************************/
import Indicia from 'indicia';

import generalSurvey from './general_survey';

const HOST = process.env.APP_INDICIA_API_HOST || 'https://mysoilsample.org/';

const CONFIG = {
  // variables replaced on build
  /* global APP_VERSION, APP_BUILD, APP_NAME, APP_INDICIA_API_KEY */
  version: process.env.APP_VERSION,
  build: process.env.APP_BUILD,
  name: process.env.APP_NAME,

  environment: process.env.ENV,
  experiments: process.env.APP_EXPERIMENTS,
  training: process.env.APP_TRAINING,

  gps_accuracy_limit: 100,

  site_url: HOST,

  // process.env.ENV is set in 
  // config/webpack.dev.js to 'development' and
  // config/webpack.prod.js to 'production'
  // unless the server environment overrides this.
  // E.g. Heroku sets NODE_ENV to 'production' by default.
  // use full logging if not production
  log: process.env.ENV !== 'production',
  // Karolis (who is more likely to be correct) has
  // log: process.env.ENV !== 'test',
  // with the comment 'use prod logging if testing otherwise full log'

  // google analytics
  ga: {
    id: process.env.APP_GA,
  },

  // error analytics
  sentry: {
    key: process.env.APP_SENTRY_KEY,
    project: '128357',
  },

  users: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER}/users/`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER + Indicia.API_REPORTS_PATH}`,
    timeout: 80000,
  },

  // mapping
  map: {
    os_api_key: process.env.APP_OS_MAP_KEY,
    mapbox_api_key: process.env.APP_MAPBOX_MAP_KEY,
    mapbox_osm_id: 'cehapps.0fenl1fe',
    mapbox_satellite_id: 'cehapps.0femh3mh',
  },

  // indicia configuration
  indicia: {
    host: HOST,
    api_key: process.env.APP_INDICIA_API_KEY,
    website_id: 2,

    surveys: {
      general: generalSurvey,
    },
  },
};

export default CONFIG;
