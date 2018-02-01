import _ from 'lodash';
import ImageHelp from 'helpers/image';
import userModel from 'user_model';
import appModel from 'app_model';
import ImageModel from './image';
import Sample from './sample';

const Factory = {
  createSample() {
    const sample = new Sample({
    }, {
      metadata: {
        survey: 'general',
      },
    });

    // append locked attributes
    appModel.appendAttrLocks(sample);

    // check if location attr is not locked
    const locks = appModel.get('attrLocks');

    if (!locks.general || !locks.general.location) {
      // no previous location
      sample.startGPS();
    }

    return Promise.resolve(sample);
  },

};

export default Factory;
