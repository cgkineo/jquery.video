var PlayPauseToggleComponent = Media.Component.extend({

  media: null,
  events: null,
  playpausetoggle: null,

  constructor: function PlayPauseToggleComponent(media) {
    this.media = media;
    this.events = {
      'click': this.onClick.bind(this)
    };
    this.media = media;
    this.listenTo(media, {
      "pause play": this.onUpdate
    });
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate,
      "dom:destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
    this.onUpdate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.playpausetoggle = groups.playpausetoggle;
    elements(this.playpausetoggle).off(this.events).on(this.events);
  },

  onDOMDestroy: function() {
    elements(this.playpausetoggle).off(this.events);
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
    Media.Component.prototype.destroy.call(this);
  }

});

Media.PlayPauseToggleComponent = PlayPauseToggleComponent;
Media.dom.components.add("PlayPauseToggleComponent");
