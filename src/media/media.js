var Media = Class.extend({

  id: null,
  selector: null,
  el: null,
  options: null,

  constructor: function Media(selector, options) {
    this.id = ++Media.ids;
    this.ensureElement(selector);
    this.options = defaults(extend({}, options), { id: this.el.id });
    this.components = {};
    this.proxyEvent = this.proxyEvent.bind(this);
    Media.players.push(this);
    Media.trigger("create", this);
    this.attachEvents();
    delay(function() {
      Media.trigger("created", this);
      this.playingCheck();
    }.bind(this), 1);
  },

  playingCheck: function() {
    if (this.el.paused) return;
    this.dispatchEvent("play");
  },

  ensureElement: function(selector) {
    switch (typeof selector) {
      case "string":
        this.el = window.document.querySelector(selector);
        break;
      case "object":
        this.el = selector;
        break;
    }
    this.selector = selector;
    this.el[Media.prop] = this;
  },

  attachEvents: function() {
    for (var i = 0, l = Media.domEvents.length; i < l; i++) {
      this.el.addEventListener(Media.domEvents[i], this.proxyEvent);
    }
  },

  dispatchEvent: function(name, options) {
    var event = createEvent(name);
    event.fake = true;
    extend(event, options);
    this.el.dispatchEvent(event);
  },

  proxyEvent: function(event) {
    this.trigger("*", event);
    this.trigger(event.type, event);
    Media.trigger(event.type, this, event);
  },

  destroy: function() {
    Media.trigger("destroy", this);
    for (var i = Media.players.length-1; i > -1; i--) {
      if (Media.players[i] !== this) continue;
      Media.players.splice(i, 1);
    }
    this.detachEvents();
    this.id = null;
    this.selector = null;
    this.el = null;
    this.options = null;
    delay(function() {
      Media.trigger("destroyed", this);
    }.bind(this), 1);
    Media.Component.prototype.destroy.call(this);
  },

  detachEvents: function() {
    for (var i = 0, l = Media.domEvents.length; i < l; i++) {
      this.el.removeEventListener(Media.domEvents[i], this.proxyEvent);
    }
  }

}, {

  ids: 0,
  prop: "player",

  players: [],

  domEvents: [
    "abort",
    "canplay",
    "canplaythrough",
    "durationchange",
    "emptied",
    "ended",
    "error",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "pause",
    "play",
    "playing",
    "process",
    "ratechange",
    "seeked",
    "seeking",
    "stalled",
    "suspend",
    "timeupdate",
    "volumechange",
    "waiting"
  ]

});

window.Media = Media;
