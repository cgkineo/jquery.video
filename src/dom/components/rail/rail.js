var RailComponent = Video.Component.extend({

  floorPrecision: 10,

  video: null,
  railduration: null,
  railcurrent: null,
  railbuffered: null,

  constructor: function RailComponent(video) {
    this.video = video;
    this.listenTo(Video, {
      "uicreate": this.onUICreate
    });
    this.listenTo(video, {
      "timeupdate ended": this.onTimeUpdate,
      "destroyed": this.destroy
    });
    this.onUICreate();
    this.onTimeUpdate();
  },

  onUICreate: function() {
    var groups = Video.dom.fetchElements(this.video);
    this.railduration = groups.railduration;
    this.railcurrent = groups.railcurrent;
    this.railbuffered = groups.railbuffered;
    if (this.railduration) {
      for (var i = 0, l = this.railduration.length; i < l; i++) {
        var railduration = this.railduration[i];
        new Video.RailDurationEvents(this.video, railduration);
      }
    }
  },

  onTimeUpdate: function() {
    this.railUpdate();
    this.bufferedUpdate();
  },

  railUpdate: function() {
    if (!this.railcurrent) return;
    for (var i = 0, l = this.railcurrent.length; i < l; i++) {
      var rail = this.railcurrent[i];
      var position = (this.video.el.currentTime / this.video.el.duration) || 0;
      rail.style.width = Math.round(rail.offsetParent.clientWidth * position) + "px";
    }
  },

  bufferedUpdate: function() {
    if (!this.railbuffered) return;
    var duration = this.video.el.duration;
    var buffered = this.video.el.buffered;
    var length = 0;
    for (var b = 0, bl = buffered.length; b < bl; b++) {
      var start = buffered.start(b);
      var end = buffered.end(b);
      length += end-start;
    }
    var position = (length / duration) || 0;
    for (var i = 0, l = this.railbuffered.length; i < l; i++) {
      var buffered = this.railbuffered[i];
      buffered.style.width = Math.round(buffered.offsetParent.clientWidth * position) + "px";
    }
  }

});

Video.RailComponent = RailComponent;
Video.dom.components.add("RailComponent");
