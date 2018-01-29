/** ****************************************************************************
 * Sample Edit Site controller.
 *****************************************************************************/
import Backbone from 'backbone';
import _ from 'lodash';
import Indicia from 'indicia';
import ImageHelp from 'helpers/image';
import Analytics from 'helpers/analytics';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
import appModel from 'app_model';
import ImageModel from '../../../common/models/image';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import HeaderView from '../../../common/views/header_view';
import FooterView from '../../../common/views/image_picker_view';

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

    Log('Samples:Edit:Soil:Controller: showing.');

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
      model: new Backbone.Model({ title: 'Soil' }),
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
        image.set('caption', 'Soil structure.');
        sample.addMedia(image);
        return sample.save();
      });
  },

};

export { API as default };
