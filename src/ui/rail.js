var Rail = Class({

  video: null,

  constructor: function(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onTimeUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    if (!groups.rail) return;
    var rails = groups.rail;
    for (var i = 0, l = rails.length; i < l; i++) {
      var rail = rails[i];
      var position = (this.video.el.currentTime / this.video.el.duration) || 0;
      rail.style.width = position * 100 + "%";
    }
  },

  onDestroyed: function() {
    debugger;
  }

});

Video.Rail = Rail;
