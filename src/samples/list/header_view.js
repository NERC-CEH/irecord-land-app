/** ****************************************************************************
 * Sample List header view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'samples-header',
  tagName: 'nav',
  template: JST['samples/list/header'],

  triggers: {
    'click #create-new-btn': 'create',
  },


  serializeData() {
    const group = this.model.getAttrLock('activity');

    return {
      training: this.model.get('useTraining'),
      group_title: group ? group.title : null,
    };
  },
});

