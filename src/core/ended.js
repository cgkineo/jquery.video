/*
This is needed for ie11, sometimes it doesn't call ended properly.
It forces the ended event to trigger if the duration and current time are
within 0.01 of each other and the video is paused.
 */
var Ended = Class.extend({

  floorPrecision: 10,

  constructor: function Ended() {
    this.listenTo(Video, {
      "play": this.onPlay,
      "pause": this.onPause,
      "ended": this.onEnded
    });
  },

  onPlay: function(video) {
    video._isAtEnd = false;
  },

  onPause: function(video) {
    if (!this.isEnded(video) || video._isAtEnd) return;
    setTimeout(function() {
      if (!video.el) return;
      if (video._isAtEnd) return;
      if (!this.isEnded(video)) return;
      video.el.dispatchEvent(new Event('ended'));
    }.bind(this), 150);
  },

  onEnded: function(video) {
    video._isAtEnd = true;
  },

  isEnded: function(video) {
    return (Math.abs(Math.floor(video.el.currentTime*this.floorPrecision) - Math.floor(video.el.duration*this.floorPrecision)) <= 1);
  }

});

Video.ended = new Ended();
