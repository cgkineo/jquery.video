// This is needed for ie11, sometimes it doesn't call ended properly.
var FixEnded = Class({

  floorPrecision: 10,

  constructor: function() {
    this.listenTo(Video, {
      "ended": this.onEnded,
      "play": this.onPlay,
      "pause": this.onPause
    });
  },

  onPlay: function(video) {
    video.hasEnded = false;
  },

  onPause: function(video) {
    if (!this.isEnded(video) || video.hasEnded) return;
    setTimeout(function() {
      if (!video.el) return;
      if (video.hasEnded) return;
      if (!this.isEnded(video)) return;
      video.el.dispatchEvent(new Event('ended'));
    }.bind(this), 150);
  },

  onEnded: function(video) {
    video.hasEnded = true;
  },

  isEnded: function(video) {
    return (Math.abs(Math.floor(video.el.currentTime*this.floorPrecision) - Math.floor(video.el.duration*this.floorPrecision)) <= 1);
  }

});

Video.fixended = new FixEnded();
