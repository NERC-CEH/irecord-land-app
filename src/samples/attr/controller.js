/** ****************************************************************************
 * Sample Attribute controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Indicia from 'indicia';
import Log from 'helpers/log';
import DateHelp from 'helpers/date';
import radio from 'radio';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
import LockView from '../../common/views/attr_lock_view';

const API = {
  show(sampleID, attr) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID, attr]);
      });
      return;
    }

    Log(`Samples:Attr:Controller: showing ${attr}.`);

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', sampleID, { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      attr,
      model: sample,
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const lockView = new LockView({
      model: new Backbone.Model({ appModel, sample }),
      attr,
      onLockClick: API.onLockClick,
    });

    const headerView = new HeaderView({
      onExit() {
        API.onExit(mainView, sample, attr, () => {
          window.history.back();
        });
      },
      rightPanel: lockView,
      model: new Backbone.Model({ title: attr }),
    });

    radio.trigger('app:header', headerView);

    // if exit on selection click
    mainView.on('save', () => {
      API.onExit(mainView, sample, attr, () => {
      window.history.back();
      });
    });

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  onLockClick() {
    Log('Samples:Attr:Controller: lock clicked.');
    const attr = this.options.attr;
    const currentVal = this.model.get('sample').get(attr);
    const currentLock = appModel.getAttrLock(attr);
    // invert the lock of the attribute
    // real value will be put on exit
    switch (attr) {
      case 'number':
        if (currentLock) {
          appModel.setAttrLock(attr, !currentLock);
        } else {
          appModel.setAttrLock('number-ranges',
            !appModel.getAttrLock('number-ranges'));
        };
        break;
      default:
        if (currentLock) {
          //lock is on so turn it off
          appModel.setAttrLock(attr, false); 
        } else if (currentVal) {
          //lock is off and currentVal is defined so turn it on by initializing it with current value
          appModel.setAttrLock(attr, currentVal);
        };
    };
  },

  onExit(mainView, sample, attr, callback) {
    Log('Samples:Attr:Controller: exiting.');
    const values = mainView.getValues();
    API.save(attr, values, sample, callback);
  },

  /**
   * Update sample with new values
   * @param values
   * @param sample
   */
  save(attr, values, sample, callback) {
    Log('Samples:Attr:Controller: saving.');

    let currentVal;
    let newVal;
    let suggestHab;
    const occ = sample.getOccurrence();

    currentVal = sample.get(attr);
    newVal = values[attr];
    switch (attr) {
      case 'date':

        // validate before setting up
        if (!newVal || ((newVal.toString() === 'Invalid Date'))) {
          //keep old value as new one is invalid
          newVal = currentVal;
        }
        API.confirmAttribute(attr, newVal, currentVal, sample, callback);
        break;
     default:
        if ((attr !== 'comment') && (newVal == currentVal)) {
          //for radio selections deselect if newVal is same as currentVal
          newVal = undefined;
        };
        
        suggestHab = sample.get('suggestedHabitat');
         
        if ((attr == 'habitat') && (suggestHab !== undefined) && (newVal !== suggestHab)) {
          //are you sure? confirm --> sample set no --> keep old habitat
          let body = 'Habitat does not match Landcover 2015 suggested habitat';
          body += '</br><i>Please confirm</i>';

          radio.trigger('app:dialog', {
            title: 'Change habitat',
            body,
            buttons: [
              {
                title: 'Cancel',
                onClick() {
                  //reset to current value
                  API.confirmAttribute(attr, currentVal, currentVal, sample, callback);
                  Log('Samples:Attr:Controller: restoring previous habitat');
                  radio.trigger('app:dialog:hide');
                },
              },
              {
                title: 'Confirm',
                class: 'btn-positive',
                onClick() {
                  API.confirmAttribute(attr, newVal, currentVal, sample, callback);
                  Log('Samples:Attr:Controller: confirming new habitat');
                  radio.trigger('app:dialog:hide');
                },
              },
            ]
          });
        } else {
          // todo:validate before setting up
          API.confirmAttribute(attr, newVal, currentVal, sample, callback);
        }
        break;
     };
  },

  confirmAttribute(attr, newVal, currentVal, sample, callback) {
    sample.set(attr, newVal);
    // save it
    sample.save()
      .then(() => {
        // update locked value if attr is locked
        API.updateLock(attr, newVal, currentVal);
        // clear validationError if set
        let validationError = sample.metadata.validationError;
        if (validationError && validationError.attributes[attr]) {
          delete validationError.attributes[attr];
        }
        callback();
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  updateLock(attr, newVal, currentVal) {
    const lockedValue = appModel.getAttrLock(attr);

    switch (attr) {
      case 'date':
        if (!lockedValue ||
          (lockedValue && DateHelp.print(newVal) === DateHelp.print(new Date()))) {
          // don't lock current day
          appModel.setAttrLock(attr, false);
        } else {
          appModel.setAttrLock(attr, newVal);
        }
        break;
      default:
        if (lockedValue) {
          if (newVal !== undefined) {
            //only change lock value if defined
            appModel.setAttrLock(attr, newVal);
          } else {
            //can't have undefined lock so unlock it
            appModel.setAttrLock(attr, false);
          }
        };
    };
  },
};

export { API as default };
