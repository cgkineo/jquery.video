var SkipStateComponent = Media.Component.extend({

  floorPrecision: 10,

  media: null,
  skipstate: null,

  constructor: function SkipStateComponent(media) {
    this.media = media;
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate,
      "dom:destroy": this.onDOMDestroy
    });
    this.listenTo(media, {
      "skip": this.onSkip,
      "destroyed": this.onDestroyed
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.skipstate = groups.skipstate;
  },

  onDOMDestroy: function() {
    this.skipstate = null;
  },

  onSkip: function(event) {
    if (!this.skipstate) return;
    if (!event.skipAmount) return;
  },

  onDestroyed: function() {
    this.media = null;
    this.skipstate = null;
    Media.Component.prototype.destroy.call(this);
  }

});

Media.SkipStateComponent = SkipStateComponent;
Media.dom.register("SkipStateComponent");
