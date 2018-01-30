/** ****************************************************************************
 * Sample List controller.
 *****************************************************************************/
import Indicia from 'indicia';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import ImageHelp from 'helpers/image';
import App from 'app';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import Factory from 'model_factory';
import MainView from './main_view';
import LoaderView from '../../common/views/loader_view';
import HeaderView from './header_view';

const API = {
  show(options = {}) {
    Log(`Samples:List:Controller: showing ${savedSamples.length}.`);
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that);
      });
      radio.trigger('app:main', new LoaderView());
    } else {
      API.showMainView(options);
    }

    // HEADER
    const headerView = new HeaderView({ model: appModel });

    headerView.on('create', () => API.createNewSample());

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  showMainView(options) {
    // get subcollection
    const collection = savedSamples.subcollection({
      filter: model => !model.metadata.complex_survey,
    });
    collection.comparator = savedSamples.comparator;
    collection.sort();

    const mainView = new MainView({
      collection,
      scroll: options.scroll,
      appModel,
    });

    mainView.on('childview:create', () => API.createNewSample());
    mainView.on('childview:sample:edit:attr', (childView, attr) => {
      radio.trigger('samples:edit:attr', childView.model.cid, attr);
    });

    mainView.on('childview:sample:delete', (childView) => {
      API.sampleDelete(childView.model);
    });

    radio.trigger('app:main', mainView);
  },

  sampleDelete(sample) {
    Log('Samples:List:Controller: deleting sample.');

    const syncStatus = sample.getSyncStatus();
    let body = 'This record hasn\'t been saved to iRecord yet, ' +
      'are you sure you want to remove it from your device?';

    if (syncStatus === Indicia.SYNCED) {
      body = 'Are you sure you want to remove this record from your device?';
      body += '</br><i><b>Note:</b> it will remain on the server.</i>';
    }
    radio.trigger('app:dialog', {
      title: 'Delete',
      body,
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
            sample.destroy();
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('List', 'sample remove');
          },
        },
      ],
    });
  },

  createNewSample() {
    if (!userModel.hasLogIn()) {
      // Tell user they must be logged in.
      API.userLoginMessage();
      // Show login page.
      radio.trigger('user:login');
    }
    else {
      Factory.createSample()
      .then(sample => sample.save())
      .then((sample) => {
        // Add to main collection.
        savedSamples.add(sample);
        // Show sample-edit page
        radio.trigger('samples:edit', sample.cid);
      });
    }
  },

  /**
   * Notify the user why they are being redirected.
   */
  userLoginMessage() {
    radio.trigger('app:dialog', {
      title: 'Information',
      body: 'Please log in to the app before adding a record.',
      buttons: [{
        id: 'ok',
        title: 'OK',
        onClick: App.regions.getRegion('dialog').hide,
      }],
    });
  },

};

export { API as default };
