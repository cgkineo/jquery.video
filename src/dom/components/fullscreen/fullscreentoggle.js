Media.DOM.FullScreenToggleComponent = Media.DOM.Component.extend({

  media: null,
  domEvents: null,
  fullscreentoggle: null,

  constructor: function FullScreenToggleComponent(media) {
    this.media = media;
    this.domEvents = {
      'click': this.onClick.bind(this)
    };
    this.media = media;
    this.listenTo(Media.DOM, {
      "create": this.onDOMCreate,
      "destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.fullscreentoggle = groups.fullscreentoggle;
    this.fullscreen = groups.fullscreen;
    elements(this.fullscreentoggle).off(this.domEvents).on(this.domEvents);
  },

  onDOMDestroy: function() {
    elements(this.fullscreentoggle).off(this.domEvents);
  },

  onClick: function() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    this.fullscreen[0].requestFullscreen();
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    this.media = null;
    Media.DOM.Component.prototype.destroy.call(this);
  }

});

Media.DOM.register("FullScreenToggleComponent");
