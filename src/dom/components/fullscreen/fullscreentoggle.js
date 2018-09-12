var FullScreenToggleComponent = Media.Component.extend({

  media: null,
  events: null,
  fullscreentoggle: null,

  constructor: function FullScreenToggleComponent(media) {
    this.media = media;
    this.events = {
      'click': this.onClick.bind(this)
    };
    this.media = media;
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate,
      "dom:destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.fullscreentoggle = groups.fullscreentoggle;
    this.fullscreen = groups.fullscreen;
    elements(this.fullscreentoggle).off(this.events).on(this.events);
  },

  onDOMDestroy: function() {
    elements(this.fullscreentoggle).off(this.events);
  },

  onClick: function() {
    this.fullscreen[0].requestFullscreen();
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    this.media = null;
    Media.Component.prototype.destroy.call(this);
  }

});

Media.FullScreenToggleComponent = FullScreenToggleComponent;
Media.dom.components.add("FullScreenToggleComponent");
