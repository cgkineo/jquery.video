var RailComponent = Media.Component.extend({

  floorPrecision: 10,

  media: null,
  railduration: null,
  railcurrent: null,
  railbuffered: null,

  constructor: function RailComponent(media) {
    this.media = media;
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate
    });
    this.listenTo(media, {
      "timeupdate ended": this.onTimeUpdate,
      "destroyed": this.destroy
    });
    this.onDOMCreate();
    this.onTimeUpdate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.railduration = groups.railduration;
    this.railcurrent = groups.railcurrent;
    this.railbuffered = groups.railbuffered;
    if (this.railduration) {
      for (var i = 0, l = this.railduration.length; i < l; i++) {
        var railduration = this.railduration[i];
        new Media.RailDurationEvents(this.media, railduration);
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
      var position = (this.media.el.currentTime / this.media.el.duration) || 0;
      rail.style.width = Math.round(rail.offsetParent.clientWidth * position) + "px";
    }
  },

  bufferedUpdate: function() {
    if (!this.railbuffered) return;
    var duration = this.media.el.duration;
    var buffered = this.media.el.buffered;
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

Media.RailComponent = RailComponent;
Media.dom.components.add("RailComponent");
