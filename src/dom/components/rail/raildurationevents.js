var RailDurationEvents = Class.extend({

  video: null,
  railduration: null,
  _wasPlaying: false,
  _inMouse: false,
  _inTouch: false,

  constructor: function RailDurationEvents(video, railduration) {
    bindAll(this, [
      "onClick",
      "onMouseDown",
      "onMouseMove",
      "onMouseUp",
      "onTouchStart",
      "onTouchMove",
      "onTouchEnd"
    ]);
    this.video = video;
    this.railduration = railduration;
    this.listenTo(Video, {
      "uidestroy": this.onDestroyed
    });
    this.listenTo(video, {
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
    this._wasPlaying = !this.video.el.paused;
    this._inMouse = true;
    this.video.el.pause();
    var left = event.offsetX
    this.setTimeFromLeft(left);
  },

  onMouseMove: function(event) {
    if (!this._inMouse) return;
    var left = event.offsetX
    this.setTimeFromLeft(left);
  },

  onMouseUp: function(event) {
    this._inMouse = false;
    if (!this._wasPlaying) return;
    this._wasPlaying = false;
    this.video.el.play();
  },

  onTouchStart: function(event) {
    this._wasPlaying = !this.video.el.paused;
    this._inTouch = true;
    this.video.el.pause();
    var left = event.touches[0].offsetX
    this.setTimeFromLeft(left);
  },

  onTouchMove: function(event) {
    if (!this._inTouch) return;
    var left = event.touches[0].offsetX
    this.setTimeFromLeft(left);
  },

  onTouchEnd: function(event) {
    this._inTouch = false;
    if (!this._wasPlaying) return;
    this._wasPlaying = false;
    this.video.el.play();
  },

  setTimeFromLeft: function(left) {
    var ratio = left / this.railduration.clientWidth;
    var currentTime = this.video.el.duration * ratio;
    if (!this.video.el.duration) return;
    this.video.el.currentTime = currentTime;
    this.video.dispatchEvent('timeupdate');
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
    this.video = null;
    this.railduration = null;
  }

});

Video.RailDurationEvents = RailDurationEvents;
