/** ****************************************************************************
 * Sample Edit controller.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Indicia from 'indicia';
import ImageHelp from 'helpers/image';
import Device from 'helpers/device';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import ImageModel from '../../common/models/image';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from './header_view';
import FooterView from '../../common/views/image_picker_view';

const API = {
  show(sampleID) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID]);
      });
      return;
    }

    Log('Samples:Edit:Controller: showing.');

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
      model: new Backbone.Model({ sample, appModel }),
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: sample,
    });

    headerView.on('save', () => {
      API.save(sample, mainView);
    });

    radio.trigger('app:header', headerView);

    // FOOTER
    const footerView = new FooterView({
      model: sample,
    });

    footerView.on('photo:upload', (e) => {
      const photo = e.target.files[0];
      API.photoUpload(sample, photo);
    });

    footerView.on('childview:photo:delete', (model) => {
      API.photoDelete(model);
    });

    // android gallery/camera selection
    footerView.on('photo:selection', () => {
      API.photoSelect(sample);
    });

    radio.trigger('app:footer', footerView);

  },


  photoUpload(sample, photo) {
    Log('Samples:Edit:Controller: photo uploaded.');

    // todo: show loader
    API.addPhoto(sample, photo).catch((err) => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
  },

  photoDelete(photo) {
    radio.trigger('app:dialog', {
      title: 'Delete',
      body: 'Are you sure you want to remove this photo from the sample?' +
      '</br><i><b>Note:</b> it will remain in the gallery.</i>',
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            // show loader
            photo.destroy({
              success: () => {
                Log('Samples:Edit:Controller: photo deleted.');

                // hide loader
              },
            });
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('Sample', 'photo remove');
          },
        },
      ],
    });
  },

  photoSelect(sample) {
    Log('Samples:Edit:Controller: photo selection.');

    radio.trigger('app:dialog', {
      title: 'Choose a method to upload a photo',
      buttons: [
        {
          title: 'Camera',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(sample, entry.nativeURL, (occErr) => {
                if (occErr) {
                  radio.trigger('app:dialog:error', occErr);
                }
              });
            });
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Gallery',
          onClick() {
            ImageHelp.getImage((entry) => {
              API.addPhoto(sample, entry.nativeURL, (occErr) => {
                if (occErr) {
                  radio.trigger('app:dialog:error', occErr);
                }
              });
            }, {
              sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
              saveToPhotoAlbum: false,
            });
            radio.trigger('app:dialog:hide');
          },
        },
      ],
    });
  },

  /**
   * Adds a new structure image to sample.
   */
  addPhoto(sample, photo) {
    return ImageHelp.getImageModel(ImageModel, photo)
      .then((image) => {
        image.set('caption', 'iRecord Land.');
        sample.addMedia(image);
        return sample.save();
      });
  },

  save(sample, mainView) {
    Log('Samples:Edit:Controller: save clicked.');
    
    //strip out the extra suggestedHabitat attribute to avoid issues with indicia
    sample = sample.unset('suggestedHabitat', 'silent');
    
    const promise = sample.setToSend();

    // invalid sample
    if (!promise) {
      const invalids = sample.validationError;
      API.showInvalidsMessage(invalids);
      // Redraw mainView with errors shown.
      mainView.render();
      return;
    }

    promise
      .then(() => {
        // should we sync?
        if (!Device.isOnline()) {
          radio.trigger('app:dialog:error', {
            message: 'Looks like you are offline!',
          });
          return;
        }

        if (!userModel.hasLogIn()) {
          radio.trigger('user:login', { replace: true });
          return;
        }

        // sync
        sample.save(null, { remote: true })
          .catch((err = {}) => {
            Log(err, 'e');

            const visibleDialog = App.regions.getRegion('dialog').$el.is(':visible');
            // we don't want to close any other dialog
            if (err.message && !visibleDialog) {
              radio.trigger('app:dialog:error',
                `Sorry, we have encountered a problem while sending the record.
                
                 <p><i>${err.message}</i></p>`
              );
            }
          });
        radio.trigger('sample:saved');
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  showInvalidsMessage(invalids) {
    // it wasn't saved so of course this error
    delete invalids.attributes.saved; // eslint-disable-line

    let missing = 'Please resolve the following problems and then try again: </br>';
    if (invalids.attributes) {
      _.each(invalids.attributes, (message, invalid) => {
        missing += `<b>${invalid}</b> - ${message}</br>`;
      });
    }

    radio.trigger('app:dialog', {
      title: 'Validation error',
      class: 'error',
      body: missing,
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: App.regions.getRegion('dialog').hide,
      }],
    });
  },

};

export { API as default };
