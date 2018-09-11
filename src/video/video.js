var Video = Class.extend({

  id: null,
  selector: null,
  el: null,
  options: null,

  constructor: function Video(selector, options) {
    this.super.constructor.call(this);
    this.id = ++Video._ids;
    this._ensureElement(selector);
    this.options = defaults(options, {});
    this.components = {};
    this._proxyEvent = this._proxyEvent.bind(this);
    Video.players.push(this);
    Video.trigger("create", this);
    this._attachEvents();
    delay(function() {
      Video.trigger("created", this);
      this._playingCheck();
    }.bind(this), 1);
  },

  _playingCheck: function() {
    if (this.el.paused) return;
    this.dispatchEvent("play");
  },

  _ensureElement: function(selector) {
    switch (typeof selector) {
      case "string":
        this.el = window.document.querySelector(selector);
        break;
      case "object":
        this.el = selector;
        break;
    }
    this.selector = selector;
    this.el[Video._prop] = this;
  },

  _attachEvents: function() {
    for (var i = 0, l = Video.domEvents.length; i < l; i++) {
      this.el.addEventListener(Video.domEvents[i], this._proxyEvent);
    }
  },

  dispatchEvent: function(name) {
    var event = createEvent(name);
    event.fake = true;
    event.realtime = true;
    this.el.dispatchEvent(event);
  },

  _proxyEvent: function(event) {
    if (!event.fake && includes(Video.blockNativeEvents, event.type)) {
      return;
    }
    this.trigger("*", event);
    this.trigger(event.type, event);
    Video.trigger(event.type, this, event);
  },

  destroy: function() {
    Video.trigger("destroy", this);
    for (var i = Video.players.length-1; i > -1; i--) {
      if (Video.players[i] !== this) continue;
      Video.players.splice(i, 1);
    }
    this._detachEvents();
    this.id = null;
    this.selector = null;
    this.el = null;
    this.options = null;
    delay(function() {
      Video.trigger("destroyed", this);
    }.bind(this), 1);
    this.super.destroy.call(this);
  },

  _detachEvents: function() {
    for (var i = 0, l = Video.domEvents.length; i < l; i++) {
      this.el.removeEventListener(Video.domEvents[i], this._proxyEvent);
    }
  }

}, {

  _ids: 0,
  _prop: "player",

  players: [],

  domEvents: [
    "loadstart",
    "process",
    "suspend",
    "abort",
    "error",
    "emptied",
    "stalled",
    "loadedmetadata",
    "loadeddata",
    "canplay",
    "canplaythrough",
    "playing",
    "waiting",
    "seeking",
    "seeked",
    "ended",
    "durationchange",
    "timeupdate",
    "play",
    "pause",
    "ratechange",
    "resize",
    "volumechange",
    "resize"
  ],

  blockNativeEvents: [
  ],

});

window.Video = Video;
