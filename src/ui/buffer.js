var Buffer = Class({

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

Video.Buffer = Buffer;
