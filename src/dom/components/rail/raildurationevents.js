var RailDurationEvents = Class.extend({

  media: null,
  railduration: null,
  wasPlaying: false,
  inMouse: false,
  inTouch: false,

  constructor: function RailDurationEvents(media, railduration) {
    bindAll(this, [
      "onClick",
      "onMouseDown",
      "onMouseMove",
      "onMouseUp",
      "onTouchStart",
      "onTouchMove",
      "onTouchEnd"
    ]);
    this.media = media;
    this.railduration = railduration;
    this.listenTo(Media, {
      "dom:destroy": this.onDestroyed
    });
    this.listenTo(media, {
      "destroyed": this.onDestroyed
    });
    this.addEventListeners();
  },

  addEventListeners: function() {
    elements(this.railduration).on({
      "mousedown": this.onMouseDown,
      "mousemove": this.onMouseMove,
      "touchstart": this.onTouchStart,
      "touchmove": this.onTouchMove
    }, {
      passive: true
    });
    elements(document.body).on({
      "mouseup": this.onMouseUp,
      "touchend": this.onTouchEnd
    }, {
      passive: true
    });
  },

  onMouseDown: function(event) {
    this.wasPlaying = !this.media.el.paused;
    this.inMouse = true;
    this.media.el.pause();
    var left = event.offsetX
    this.setTimeFromLeft(left);
  },

  onMouseMove: function(event) {
    if (!this.inMouse) return;
    var left = event.offsetX
    this.setTimeFromLeft(left);
  },

  onMouseUp: function(event) {
    this.inMouse = false;
    if (!this.wasPlaying) return;
    this.wasPlaying = false;
    this.media.el.play();
  },

  onTouchStart: function(event) {
    this.wasPlaying = !this.media.el.paused;
    this.inTouch = true;
    this.media.el.pause();
    var left = event.touches[0].offsetX
    this.setTimeFromLeft(left);
  },

  onTouchMove: function(event) {
    if (!this.inTouch) return;
    var left = event.touches[0].offsetX
    this.setTimeFromLeft(left);
  },

  onTouchEnd: function(event) {
    this.inTouch = false;
    if (!this.wasPlaying) return;
    this.wasPlaying = false;
    this.media.el.play();
  },

  setTimeFromLeft: function(left) {
    var ratio = left / this.railduration.clientWidth;
    var currentTime = this.media.el.duration * ratio;
    if (!this.media.el.duration) return;
    this.media.el.currentTime = currentTime;
    this.media.dispatchEvent('timeupdate');
  },

  removeEventListeners: function() {
    elements(this.railduration).off({
      "mousedown": this.onMouseDown,
      "mousemove": this.onMouseMove,
      "touchstart": this.onTouchStart,
      "touchmove": this.onTouchMove
    });
    elements(document.body).off({
      "mouseup": this.onMouseUp,
      "touchend": this.onTouchEnd
    }, {
      passive: true
    });
  },

  onDestroyed: function() {
    this.removeEventListeners();
    this.stopListening();
    this.media = null;
    this.railduration = null;
  }

}, null, {
  instanceEvents: true
});

Media.RailDurationEvents = RailDurationEvents;
