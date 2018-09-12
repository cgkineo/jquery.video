var Components = Class.extend({

  loadNames: null,

  constructor: function Components() {
    this.listenTo(Media, {
      "created": this.onCreated
    });
  },

  onCreated: function(media) {
    media.ui = media.ui || {};
    media.ui.components = media.ui.components || {};
    for (var i = 0, l = this.loadNames.length; i < l; i++) {
      var name = this.loadNames[i];
      var constructor = Media[name];
      media.components[name] = new constructor(media);
    }
  },

  add: function(name) {
    this.loadNames = this.loadNames || [];
    this.loadNames.push(name);
  }

});

Media.dom.components = new Components();
