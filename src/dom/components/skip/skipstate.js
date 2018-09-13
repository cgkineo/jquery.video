Media.DOM.SkipStateComponent = Media.DOM.Component.extend({

  floorPrecision: 10,

  media: null,
  skipstate: null,

  constructor: function SkipStateComponent(media) {
    this.media = media;
    this.listenTo(Media.DOM, {
      "create": this.onDOMCreate,
      "destroy": this.onDOMDestroy
    });
    this.listenTo(media, {
      "skip": this.onSkip,
      "destroyed": this.onDestroyed
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.skipstate = groups.skipstate;
  },

  onDOMDestroy: function() {
    this.skipstate = null;
  },

  onSkip: function(event) {
    if (!this.skipstate) return;
    if (!event.skipAmount) return;
    // TODO: add classes to show skip ui
  },

  onDestroyed: function() {
    this.media = null;
    this.skipstate = null;
    Media.DOM.Component.prototype.destroy.call(this);
  }

});

Media.DOM.register("SkipStateComponent");
