var RailComponent = Video.Component.extend({

  video: null,

  constructor: function RailComponent(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onTimeUpdate: function() {
    this.railUpdate();
    this.bufferUpdate();
  },

  railUpdate: function() {
    var groups = Video.ui.fetch(this.video);
    if (!groups.rail) return;
    var rails = groups.rail;
    for (var i = 0, l = rails.length; i < l; i++) {
      var rail = rails[i];
      var position = (this.video.el.currentTime / this.video.el.duration) || 0;
      rail.style.width = position * 100 + "%";
    }
  },

  bufferUpdate: function() {
    var groups = Video.ui.fetch(this.video);
    if (!groups.buffer) return;
    var buffers = groups.buffer;
    var duration = this.video.el.duration;
    var buffered = this.video.el.buffered;
    var length = 0;
    for (var b = 0, bl = buffered.length; b < bl; b++) {
      var start = buffered.start(b);
      var end = buffered.end(b);
      length += end-start;
    }
    var position = (length / duration) || 0;
    for (var i = 0, l = buffers.length; i < l; i++) {
      var buffer = buffers[i];
      buffer.style.width = position * 100 + "%";
    }
  },

  onDestroyed: function() {
    debugger;
  }

});

Video.RailComponent = RailComponent;
Video.ui.components.add("RailComponent");
