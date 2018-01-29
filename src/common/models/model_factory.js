import _ from 'lodash';
import ImageHelp from 'helpers/image';
import userModel from 'user_model';
import appModel from 'app_model';
import ImageModel from './image';
import Sample from './sample';

const Factory = {
  createSample() {
    // Generate a uid of form uid-yyyymmdd-hhmmss
    const id = userModel.get('drupalID');
    const now = new Date();
    let uid = id;
    uid += '-' + now.getFullYear().toString().slice(-2);
    uid += _.padLeft(now.getMonth() + 1, 2, '0');
    uid += _.padLeft(now.getDate(), 2, '0');
    uid += '-' + _.padLeft(now.getHours(), 2, '0');
    uid += _.padLeft(now.getMinutes(), 2, '0');
    uid += _.padLeft(now.getSeconds(), 2, '0');
   
    const sample = new Sample({
      uid: uid,
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
