Media.DOM.PlayPauseToggleComponent = Media.DOM.Component.extend({

  media: null,
  domEvents: null,
  playpausetoggle: null,

  constructor: function PlayPauseToggleComponent(media) {
    this.media = media;
    this.domEvents = {
      'click': this.onClick.bind(this)
    };
    this.media = media;
    this.listenTo(media, {
      "pause play": this.onUpdate
    });
    this.listenTo(Media.DOM, {
      "create": this.onDOMCreate,
      "destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
    this.onUpdate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.playpausetoggle = groups.playpausetoggle;
    elements(this.playpausetoggle).off(this.domEvents).on(this.domEvents);
  },

  onDOMDestroy: function() {
    elements(this.playpausetoggle).off(this.domEvents);
  },

  onUpdate: function() {
    var isPaused = this.media.el.paused;
    this.playpausetoggle && this.playpausetoggle.forEach(function(el) {
      // do language stuff
    }.bind(this));
  },

  onClick: function() {
    var isPaused = this.media.el.paused;
    if (isPaused) this.media.el.play();
    else this.media.el.pause();
    this.onUpdate();
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    this.media = null;
    Media.DOM.Component.prototype.destroy.call(this);
  }

});

Media.DOM.register("PlayPauseToggleComponent");
