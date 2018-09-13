Media.DOM.PlayPauseStateComponent = Media.DOM.Component.extend({

  floorPrecision: 10,

  media: null,
  playpausestate: null,

  constructor: function PlayPauseStateComponent(media) {
    this.media = media;
    this.listenTo(Media.DOM, {
      "create": this.onDOMCreate
    });
    this.listenTo(media, {
      "timeupdate play pause ended": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onDOMCreate();
    this.onTimeUpdate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.playpausestate = groups.playpausestate;
  },

  onTimeUpdate: function() {
    if (!this.playpausestate) return;
    var isAtStart = this.isAtStart();
    var isAtEnd = this.isAtEnd();
    var isPaused = this.media.el.paused;
    for (var i = 0, l = this.playpausestate.length; i < l; i++) {
      var playpausestate = this.playpausestate[i];
      toggleClass(playpausestate, replace("${classprefix}playpausestate-playing", this.media.options), !isPaused);
      toggleClass(playpausestate, replace("${classprefix}playpausestate-paused", this.media.options), isPaused);
      toggleClass(playpausestate, replace("${classprefix}playpausestate-start", this.media.options), isAtStart);
      toggleClass(playpausestate, replace("${classprefix}playpausestate-end", this.media.options), isAtEnd);
      toggleClass(playpausestate, replace("${classprefix}playpausestate-middle", this.media.options), !isAtEnd && !isAtStart);
    }
  },

  isAtStart: function() {
    var currentTime = this.media.el.currentTime;
    return (Math.floor(currentTime*this.floorPrecision) <= 1);
  },

  isAtEnd: function() {
    var currentTime = this.media.el.currentTime;
    var duration = this.media.el.duration;
    return (Math.abs(Math.floor(currentTime*this.floorPrecision) - Math.floor(duration*this.floorPrecision)) <= 1);
  },

  onDestroyed: function() {
    this.stopListening();
  }

});

Media.DOM.register("PlayPauseStateComponent");
