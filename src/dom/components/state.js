var StateComponent = Video.Component.extend({

  floorPrecision: 10,

  video: null,
  state: null,

  constructor: function StateComponent(video) {
    this.video = video;
    this.listenTo(Video, {
      "uicreate": this.onUICreate
    });
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onUICreate();
    this.onTimeUpdate();
  },

  onUICreate: function() {
    var groups = Video.dom.fetchElements(this.video);
    this.state = groups.state;
  },

  onTimeUpdate: function() {
    if (!this.state) return;
    var isAtStart = this.isAtStart();
    var isAtEnd = this.isAtEnd();
    var isPaused = this.video.el.paused;
    for (var i = 0, l = this.state.length; i < l; i++) {
      var state = this.state[i];
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
    this.stopListening();
  }

});

Video.StateComponent = StateComponent;
Video.dom.components.add("StateComponent");
