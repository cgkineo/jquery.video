var Video = Class({

  id: null,
  selector: null,
  el: null,
  options: null,
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
    "volumechange"
  ],

  constructor: function Video(selector, options) {
    this.id = ++Video._ids;
    this._ensureElement(selector);
    this.options = options || {};
    this._proxyEvent = this._proxyEvent.bind(this);
    Video.players.push(this);
    Video.trigger("create", this);
    this._attachEvents();
    delay(function() {
      Video.trigger("created", this);
    }.bind(this), 1);
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
    for (var i = 0, l = this.domEvents.length; i < l; i++) {
      this.el.addEventListener(this.domEvents[i], this._proxyEvent);
    }
  },

  _proxyEvent: function(event) {
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
  },

  _detachEvents: function() {
    for (var i = 0, l = this.domEvents.length; i < l; i++) {
      this.el.removeEventListener(this.domEvents[i], this._proxyEvent);
    }
    this.stopListening();
    this.off();
  }

}, {

  _ids: 0,
  _prop: "player",

  players: []

});

window.Video = Video;