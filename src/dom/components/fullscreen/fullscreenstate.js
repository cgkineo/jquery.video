Media.DOM.FullScreenComponent = Media.DOM.Component.extend({

  media: null,
  fullscreenstate: null,

  constructor: function FullScreenComponent(media) {
    this.media = media;
    this.media.fullscreen = false;
    this.listenTo(Media.DOM, {
      "create": this.onCreate,
      "destroy": this.onDestroy
    });
    this.listenTo(media, {
      "fullscreen:entered": this.onEntered,
      "fullscreen:exited": this.onExited
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.fullscreenstate = groups.fullscreenstate;
  },

  onDOMDestroy: function() {
    this.fullscreenstate = null;
  },

  onEntered: function() {
    this.media.fullscreen = true;
    if (!this.fullscreenstate) return;
    for (var i = 0, l = this.fullscreenstate.length; i < l; i++) {
      var fullscreenstate = this.fullscreenstate[i];
      toggleClass(fullscreenstate, this.media.options.classprefix+"fullscreenstate-fullscreen", true);
    }
  },

  onExited: function() {
    this.media.fullscreen = false;
    if (!this.fullscreenstate) return;
    for (var i = 0, l = this.fullscreenstate.length; i < l; i++) {
      var fullscreenstate = this.fullscreenstate[i];
      toggleClass(fullscreenstate, this.media.options.classprefix+"fullscreenstate-fullscreen", false);
    }
  },

  onDestroyed: function() {
    this.media = null;
    this.fullscreenstate = null;
    Media.DOM.Component.prototype.destroy.call(this);
  }

});

Media.DOM.register("FullScreenComponent");
