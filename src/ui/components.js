var Components = Class.extend({

  _loadNames: null,

  constructor: function Components() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    video.ui = video.ui || {};
    video.ui.components = video.ui.components || {};
    for (var i = 0, l = this._loadNames.length; i < l; i++) {
      var name = this._loadNames[i];
      var constructor = Video[name];
      video.components[name] = new constructor(video);
    }
  },

  add: function(name) {
    this._loadNames = this._loadNames || [];
    this._loadNames.push(name);
  }

});

Video.ui.components = new Components();
