/*
This makes timeupdate events trigger at greater frequency, every 62.5 milliseconds
rather than 250ms in most browsers.
*/
var TimeUpdate = Class({

  playing: null,
  interval: 62.5,
  isRaf: false,
  lastTickTime: null,

  constructor: function() {
    this.playing = [];
    this.listenTo(Video, {
      "play": this.onPlay,
      "pause finish destroyed": this.onPause
    });
    this.onRaf = this.onRaf.bind(this);
  },

  onPlay: function(video) {
    this.playing.push(video);
    if (!this.inRaf) {
      rAF(this.onRaf);
      this.inRaf = true;
    }
  },

  onRaf: function() {
    var now = Date.now();
    if (now < this.lastTickTime + this.interval) {
      if (!this.playing.length) return this.inRaf = false;
      return rAF(this.onRaf);
    }
    for (var i = 0, l = this.playing.length; i < l; i++) {
      var event = createEvent('timeupdate');
      event.realtime = true;
      this.playing[i].el.dispatchEvent(event);
    }
    return rAF(this.onRaf);
  },

  onPause: function(video) {
    for (var i = 0, l = this.playing.length; i < l; i++) {
      if (this.playing[i].id !== video.id) continue;
      this.playing.splice(i, 1);
    }
  }

});

Video.timeupdate = new TimeUpdate();
