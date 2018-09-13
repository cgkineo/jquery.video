var Media = Class.extend({

  selector: null,
  el: null,
  options: null,

  constructor: function Media(selector, options) {
    this.ensureElement(selector);
    this.options = extend(options, {
      id: this.el.id
    });
    this.defineProperties({
      proxyEvent$write: this.proxyEvent.bind(this)
    });
    Media.players.push(this);
    Media.trigger("create", this);
    this.attachEvents();
    delay(function() {
      Media.trigger("created", this);
      this.playingCheck();
    }.bind(this), 1);
  },

  playingCheck$write: function() {
    if (this.el.paused) return;
    this.dispatchEvent("play");
  },

  ensureElement$write: function(selector) {
    switch (typeof selector) {
      case "string":
        this.el = window.document.querySelector(selector);
        break;
      case "object":
        this.el = selector;
        break;
    }
    this.selector = selector;
    this.el[Media.propName] = this;
  },

  attachEvents$write: function() {
    for (var i = 0, l = Media.DOMEvents.length; i < l; i++) {
      this.el.addEventListener(Media.DOMEvents[i], this.proxyEvent);
    }
  },

  dispatchEvent: function(name, options) {
    var event = createEvent(name);
    event.fake = true;
    extend(event, options);
    this.el.dispatchEvent(event);
  },

  proxyEvent$write: function(event) {
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
    this.selector = null;
    this.el = null;
    this.options = null;
    delay(function() {
      Media.trigger("destroyed", this);
    }.bind(this), 1);
    Media.Component.prototype.destroy.call(this);
  },

  detachEvents$write: function() {
    for (var i = 0, l = Media.DOMEvents.length; i < l; i++) {
      this.el.removeEventListener(Media.DOMEvents[i], this.proxyEvent);
    }
  }

}, {

  propName$write: "player",

  fixes$write: {},
  players$write: [],

  findById: function(id) {
    for (var i = 0, l = this.players.length; i < l; i++) {
      var player = this.players[i];
      if (!player.el) continue;
      if (player.el.id !== id) continue;
      return player;
    }
  }

},{
  classEvents: true,
  instanceEvents: true
});

window.Media = Media;
