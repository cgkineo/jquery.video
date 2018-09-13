/*
This makes timeupdate events trigger at greater frequency, every 62.5 milliseconds
(15fps) rather than 250ms (4fps) in most browsers.
*/
Media.TimeUpdate = Class.extend({

  playing: null,
  interval: (1000/25),
  inRaf: false,
  lastTickTime: null,

  constructor: function TimeUpdate() {
    this.playing = [];
    this.listenTo(Media, {
      "play": this.onPlay,
      "pause finish destroyed": this.onPause
    });
    this.onRaf = this.onRaf.bind(this);
  },

  onPlay: function(media) {
    this.playing.push(media);
    if (!this.inRaf) {
      rAF(this.onRaf);
      this.inRaf = true;
    }
  },

  onRaf: function() {
    var now = Date.now();
    if (now < this.lastTickTime + this.interval) {
      if (!this.playing.length) {
        return this.inRaf = false;
      }
      return rAF(this.onRaf);
    }
    this.lastTickTime = now;
    for (var i = 0, l = this.playing.length; i < l; i++) {
      this.playing[i].dispatchEvent('timeupdate');
    }
    return rAF(this.onRaf);
  },

  onPause: function(media) {
    for (var i = this.playing.length-1; i > -1; i--) {
      if (this.playing[i].id !== media.id) continue;
      this.playing.splice(i, 1);
    }
  }

}, null, {
  instanceEvents: true
});

Media.defineProperties({
  "TimeUpdate$write": new Media.TimeUpdate()
});
