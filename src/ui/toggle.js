var Toggle = Class({

  video: null,

  constructor: function(video) {
    this.video = video;
    this.listenTo(video, {
      "pause play": this.onUpdate
    });
    this.attachEventListeners();
    this.onUpdate();
  },

  attachEventListeners: function() {
    this.onClick = this.onClick.bind(this);
    var groups = Video.dom.fetch(this.video);
    groups.toggle && groups.toggle.forEach(function(el) {
      el.removeEventListener('click', this.onClick);
      el.addEventListener('click', this.onClick);
    }.bind(this));
  },

  onUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    var isPaused = this.video.el.paused;
    groups.toggle && groups.toggle.forEach(function(el) {
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
    var groups = Video.dom.fetch(this.video);
    groups.toggle && groups.toggle.forEach(function(el) {
      el.removeEventListener('click', this.onClick);
      el.addEventListener('click', this.onClick);
    }.bind(this));
  }

});

Video.Toggle = Toggle;
