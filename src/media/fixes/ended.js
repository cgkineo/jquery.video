/*
This is needed for ie11, sometimes it doesn't call ended properly.
It forces the ended event to trigger if the duration and current time are
within 0.01 of each other and the media is paused.
 */
Media.fixes.IE11Ended = Class.extend({

  floorPrecision: 10,

  constructor: function IE11Ended() {
    this.listenTo(Media, {
      "play": this.onPlay,
      "pause": this.onPause,
      "ended": this.onEnded
    });
  },

  onPlay: function(media) {
    media.hasFiredEnded = false;
  },

  onPause: function(media) {
    if (!this.isEnded(media) || media.isAtEnd) return;
    setTimeout(function() {
      if (!media.el) return;
      if (media.hasFiredEnded) return;
      if (!this.isEnded(media)) return;
      media.el.dispatchEvent(createEvent('ended'));
    }.bind(this), 150);
  },

  onEnded: function(media) {
    this.hasFiredEnded = true;
  },

  isEnded: function(media) {
    return (Math.abs(Math.floor(media.el.currentTime*this.floorPrecision) - Math.floor(media.el.duration*this.floorPrecision)) <= 1);
  }

}, null, {
  instanceEvents: true
});

Media.fixes.IE11Ended = new Media.fixes.IE11Ended();
