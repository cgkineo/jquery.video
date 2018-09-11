var PlayPauseToggleComponent = Video.Component.extend({

  video: null,
  events: null,
  playpausetoggle: null,

  constructor: function PlayPauseToggleComponent(video) {
    this.events = {
      'click': this.onClick.bind(this)
    };
    this.video = video;
    this.listenTo(video, {
      "pause play": this.onUpdate
    });
    this.listenTo(Video, {
      "uicreate": this.onUICreate,
      "uidestroy": this.onUIDestroy
    });
    this.onUICreate();
    this.onUpdate();
  },

  onUICreate: function() {
    var groups = Video.dom.fetchElements(this.video);
    this.playpausetoggle = groups.playpausetoggle;
    elements(this.playpausetoggle).off(this.events).on(this.events);
  },

  onUIDestroy: function() {
    elements(this.playpausetoggle).off(this.events);
  },

  onUpdate: function() {
    var isPaused = this.video.el.paused;
    this.playpausetoggle && this.playpausetoggle.forEach(function(el) {
      toggleClass(el, "should-play", isPaused);
      toggleClass(el, "should-pause", !isPaused);
    });
  },

  onClick: function() {
    var isPaused = this.video.el.paused;
    if (isPaused) this.video.el.play();
    else this.video.el.pause();
    this.onUpdate();
  },

  onDestroyed: function() {
    this.onUIDestroy();
    this.stopListening();
  }

});

Video.PlayPauseToggleComponent = PlayPauseToggleComponent;
Video.dom.components.add("PlayPauseToggleComponent");
