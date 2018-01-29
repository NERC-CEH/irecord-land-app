/** ****************************************************************************
 * User Register main view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import Device from 'helpers/device';
import Validate from 'helpers/validate';
import JST from 'JST';

export default Marionette.View.extend({
  template: JST['user/register/main'],

  events: {
    'click #user-terms-agree': 'onTermsClicked',
    'click #register-button': 'register',
  },

  onTermsClicked(e) {
    // Ratchet Toggles respond to slide and tap but also need click for desktop.
    if (!Device.isMobile()) {
      $(e.currentTarget).toggleClass('active');
    }
  },

  register() {
    // todo: add validation
    const data = {};

    const $emailInput = this.$el.find('input[name=email]');
    const $passwordInput = this.$el.find('input[name=password]');
    const $passwordConfInput = this.$el.find('input[name=password-confirm]');

    // user logins
    this.email = $emailInput.val(); // save it for future
    const firstname = this.$el.find('input[name=firstname]').val();
    const secondname = this.$el.find('input[name=secondname]').val();
    const password = $passwordInput.val();
    const passwordConfirm = $passwordConfInput.val();

    data.type = 'users';
    data.email = this.email;
    data.firstname = firstname;
    data.secondname = secondname;
    data.password = password;
    data['password-confirm'] = passwordConfirm;

    const active = $('#user-terms-agree').hasClass('active');
    data['terms-agree'] = active;

    this.trigger('form:submit', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    Validate.updateViewFormErrors($view, errors, '#user-');
  },
});
