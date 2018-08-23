(function($){$("<style>",{text:""}).appendTo("head");
var STORE = {
    isTouchCapable: false
};

var p = "prototype";

var delay = function(callback, time) {
  setTimeout(callback, time);
};

var indexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(fromIndex) : value;
  var match = str.match(regex);
  return match ? str.indexOf(match[0]) + fromIndex : -1;
};

var lastIndexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(0, fromIndex) : value;
  var match = str.match(regex);
  return match ? str.lastIndexOf(match[match.length-1]) : -1;
};

var chain = function(original, callback) {
  return function() {
    var args = Array[p].slice.call(arguments, 0);
    args.unshift(function() {
      var args = Array[p].slice.call(arguments, 0);
      return original.apply(this, args);
    }.bind(this));
    return callback.apply(this, args);
  };
};

var debounce = function(func, time) {
  var handle = null;
  return function() {
    var args = arguments;
    clearTimeout(handle);
    handle = setTimeout(function() {
      func.apply(this, args);
    }.bind(this), time || 0);
  }
};

var toArray = function(args, start) {
  return Array.prototype.slice.call(args, start || 0);
};

var extend = function(subject) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      subject[k] = arg[k];
    }
  }
  return subject;
};
// check for touch devices
STORE.isTouchCapable = false;
var touchListener = function() {
  window.removeEventListener("touchstart", touchListener);
  STORE.isTouchCapable = true;
};
window.addEventListener("touchstart", touchListener);
var Events = {
  _events: null,
  listenTo: function(subject, name, callback) {
    subject.on(name, callback, this);
    return this;
  },
  listenToOnce: function(subject, name, callback) {
    subject.once(name, callback, this);
    return this;
  },
  stopListening: function(subject, name, callback) {
    subject.off(name, callback);
    return this;
  },
  on: function(name, callback, subject) {
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.on(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.on(k, name[k], subject || callback);
        return this;
    }
    this._events = this._events || {};
    this._events[name] = this._events[name] || [];
    this._events[name].push({
      subject: subject || this,
      callback: callback,
      once: false
    });
    return this;
  },
  once: function(name, callback, subject) {
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.once(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.on(k, name[k], subject || callback);
        return this;
    }
    this._events = this._events || {};
    this._events[name] = this._events[name] || [];
    this._events[name].push({
      subject: subject || this,
      callback: callback,
      once: true
    });
    return this;
  },
  off: function(name, callback) {
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.off(name, callback);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.off(k, name[k]);
        return this;
    }
    if (!name) {
      this._events = null;
      return this;
    }
    if (!this._events) return this;
    if (!this._events[name]) return this;
    for (var i = this._events[name].length-1; i > -1; i--) {
      if (this._events[name][i].callback !== callback) continue;
      this._events[name].splice(0, i);
    }
    if (!this._events[name].length) delete this._events[name];
    return this;
  },
  trigger: function(name) {
    if (!name) return this;
    if (!this._events) return this;
    if (!this._events[name]) return;
    var args = toArray(arguments, 1);
    var remove = [];
    for (var i = 0, l = this._events[name].length; i < l; i++) {
      var handler = this._events[name][i];
      handler.callback.apply(handler.subject, args);
      if (handler.once) remove.unshift(i);
    }
    for (var i = 0, l = remove.length; i < l; i++) {
      this._events[name].splice(remove[i], 1);
    }
    if (!this._events[name].length) delete this._events[name];
  },
  destroy: function() {
    this.off();
  }
};
var properties = function(object) {
  var properties = {};
  if (object.$set) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].set = object.$set[k];
    }
  }
  if (object.$get) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].get = object.$set[k];
    }
  }
  Object.defineProperties(object, properties);
};

var Class = function(prototype, parent) {
  var c = prototype.constructor || function() {};
  extend(c.prototype, Events, prototype || {});
  extend(c, Events, parent || {});
  properties(c.prototype);
  properties(c);
  return c;
};

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
  }

}, {

  _ids: 0,
  _prop: "player",

  players: []

});

window.Video = Video;
// This is needed for ie11, sometimes it doesn't call ended properly.
var FixEnded = Class({

  floorPrecision: 10,

  constructor: function() {
    this.listenTo(Video, {
      "ended": this.onEnded,
      "play": this.onPlay,
      "pause": this.onPause
    });
  },

  onPlay: function(video) {
    video.hasEnded = false;
  },

  onPause: function(video) {
    if (!this.isEnded(video) || video.hasEnded) return;
    setTimeout(function() {
      if (!video.el) return;
      if (video.hasEnded) return;
      if (!this.isEnded(video)) return;
      video.el.dispatchEvent(new Event('ended'));
    }.bind(this), 150);
  },

  onEnded: function(video) {
    video.hasEnded = true;
  },

  isEnded: function(video) {
    return (Math.abs(Math.floor(video.el.currentTime*this.floorPrecision) - Math.floor(video.el.duration*this.floorPrecision)) <= 1);
  }

});

Video.fixended = new FixEnded();

// This makes timeupdate events trigger at greater frequency
var raf = function(cb) {
  return window.requestAnimationFrame(cb);
};

var Realtime = Class({

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
      raf(this.onRaf);
      this.inRaf = true;
    }
  },

  onRaf: function() {
    var now = Date.now();
    if (now < this.lastTickTime + this.interval) {
      if (!this.playing.length) return this.inRaf = false;
      return raf(this.onRaf);
    }
    for (var i = 0, l = this.playing.length; i < l; i++) {
      var event = new Event('timeupdate');
      event.realtime = true;
      this.playing[i].el.dispatchEvent(event);
    }
    return raf(this.onRaf);
  },

  onPause: function(video) {
    for (var i = 0, l = this.playing.length; i < l; i++) {
      if (this.playing[i].id !== video.id) continue;
      this.playing.splice(i, 1);
    }
  }

});

Video.realtime = new Realtime();

if ($ && $.fn) {
// jQuery API
$.fn.videos = function(options) {

  // Get all video tags selected and make Video instances for them
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));

  switch (options) {
    case "destroy":
      // Tear down all video class + dom associations
      $videos.each(function(index, item) {
        if (!(item[Video._prop] instanceof Video)) return;
        item[Video._prop].destroy();
        delete item[Video._prop];
      });
      return $videos;
  }

  $videos.each(function(index, item) {
    if (item[Video._prop]) return;
    new Video(item, options);
  });
  return $videos;

};
}

var DOM = Class({

  _videos: null,
  elements: null,

  constructor: function() {
    this._videos = [];
    this.elements = {};
    this.listenTo(Video, {
      "created": this._onCreated,
      "destroyed": this._onDestroyed
    });
    this.refresh = this.refresh.bind(this);
    if (document.body) {
      delay(this.refresh, 1);
    } else {
      document.addEventListener("load", this.refresh);
    }
  },

  _onCreated: function(video) {
    this._videos.push(video);
    this.refresh();
  },

  _onDestroyed: function(video) {
    for (var i = 0, l = this._videos.length; i < l; i++) {
      if (this._videos[i].id !== video.id) continue;
      this._videos.splice(i, 1);
    }
    this.refresh();
  },

  refresh: function() {
    var elements = this._searchNodeList([document.body], "[for][kind]");
    elements = this._filterNodes(elements);
    this.elements = this._groupNodes(elements);
  },

  _searchNodeList: function(nodeList, selector) {
    var results = [];
    for (var i = 0, l = nodeList.length; i < l; i++) {
      var node = nodeList[i];
      var children = node.querySelectorAll(selector);
      for (var c = 0, cl = children.length; c < cl; c++) {
        results.push(children[c]);
      }
    }
    return results;
  },

  _filterNodes: function(elements) {
    var nodes = [];
    var ids = this._getIds();
    if (!ids) return nodes;
    if (!elements.length) return nodes;
    for (var i = 0, l = elements.length; i < l; i++) {
      var element = elements[i];
      var forId = element.getAttribute('for');
      if (!ids[forId]) continue;
      nodes.push(element);
    }
    return nodes;
  },

  _getIds: function() {
    var ids = {};
    for (var i = 0, l = this._videos.length; i < l; i++) {
      ids[this._videos[i].el.id] = true;
    }
    return this._videos.length ? ids : null;
  },

  _groupNodes: function(elements) {
    var grouped = {};
    for (var i = 0, l = elements.length; i < l; i++) {
      var element = elements[i];
      var forId = element.getAttribute("for");
      grouped[forId] = grouped[forId] || {};
      var forKinds = element.getAttribute("kind").split(" ");
      forKinds.forEach(function(forKind) {
        grouped[forId][forKind] = grouped[forId][forKind] || [];
        grouped[forId][forKind].push(element);
      });
    }
    return grouped;
  }

});

Video.dom = new DOM();

var RailController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "create": this.onCreate
    });
  },

  onCreate: function(video) {
    new Rail(video)
  }

});

var Rail = Class({

  video: null,

  constructor: function(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroy": this.destroy()
    });
  },

  onTimeUpdate: function() {
    var forId = this.video.el.id;
    if (!Video.dom.elements[forId]) return;
    if (!Video.dom.elements[forId]['rail']) return;
    var rails = Video.dom.elements[forId]['rail'];
    for (var i = 0, l = rails.length; i < l; i++) {
      var rail = rails[i];
      var position = this.video.el.currentTime / this.video.el.duration;
      rail.style.width = position * 100 + "%";
    }
  }

});

Video.rail = new RailController();



var properties = function(object) {
  var properties = {};
  if (object.$set) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].set = object.$set[k];
    }
  }
  if (object.$get) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].get = object.$set[k];
    }
  }
  Object.defineProperties(object, properties);
};
})(jQuery);