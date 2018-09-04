var State = Class.extend({

  floorPrecision: 10,

  video: null,

  constructor: function State(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onTimeUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    if (!groups.state) return;
    var states = groups.state;
    var isAtStart = this.isAtStart();
    var isAtEnd = this.isAtEnd();
    var isPaused = this.video.el.paused;
    for (var i = 0, l = states.length; i < l; i++) {
      var state = states[i];
      toggleClass(state, "is-playing", !isPaused);
      toggleClass(state, "is-paused", isPaused);
      toggleClass(state, "is-start", isAtStart);
      toggleClass(state, "is-end", isAtEnd);
      toggleClass(state, "is-middle", !isAtEnd && !isAtStart);
    }
  },

  isAtStart: function() {
    var currentTime = this.video.el.currentTime;
    return (Math.floor(currentTime*this.floorPrecision) <= 1);
  },

  isAtEnd: function() {
    var currentTime = this.video.el.currentTime;
    var duration = this.video.el.duration;
    return (Math.abs(Math.floor(currentTime*this.floorPrecision) - Math.floor(duration*this.floorPrecision)) <= 1);
  },

  onDestroyed: function() {
    debugger;
  }

});

Video.components.State = State;
