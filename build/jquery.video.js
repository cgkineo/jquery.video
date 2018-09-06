(function(window, $){if ($) $("<style>",{text:""}).appendTo("head");
/*
Library local storage variable.
 */
var STORE = {};

var p = "prototype";

var toArray = function(args, start) {
  return Array[p].slice.call(args, start || 0);
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

var toArray = function(args, start) {
  return Array[p].slice.call(args, start || 0);
};

var parseUnit = function(value, unit) {
  value = String(value || 0) + String(unit || "");
  var unitMatch = value.match(/[^0-9]+/g);
  var unit = "px";
  if (unitMatch) unit = unitMatch[0];
  return {
    value: parseFloat(value) || 0,
    unit: unit
  };
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

var delay = function(callback, time) {
  setTimeout(callback, time);
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

/*
Check for touch devices.
 */
if (window.addEventListener) {
    STORE.isTouchCapable = false;
    var touchListener = function() {
      window.removeEventListener("touchstart", touchListener);
      STORE.isTouchCapable = true;
    };
    window.addEventListener("touchstart", touchListener);
}

var Events = {

  _listeningTo: null,
  _eventsId: 0,
  _events: null,

  listenTo: function(subject, name, callback) {
    if (!subject._eventsId) subject._eventsId = ++Events._eventsId;
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    if (!this._listeningTo) this._listeningTo = {};
    this._listeningTo[subject._eventsId] = subject;
    subject.on(name, callback, this);
    this._listeningTo[subject.id] = true;
    return this;
  },

  listenToOnce: function(subject, name, callback) {
    if (!subject._eventsId) subject._eventsId = ++Events._eventsId;
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    if (!this._listeningTo) this._listeningTo = {};
    this._listeningTo[subject._eventsId] = subject;
    subject.once(name, callback, this);
    this._listeningTo[subject.id] = true;
    return this;
  },

  stopListening: function(subject, name, callback) {
    // check turn on listening on subject and this
    if (!subject) {
      if (!this._listeningTo) return;
      for (var k in this._listeningTo) {
        this._listeningTo[k].off(name, callback, this);
        // do clearup here
      }
      return;
    }
    if (!name) {
      if (!this._listeningTo[subject._eventsId]) return;
      this._listeningTo[subject._eventsId].off(name, callback, this);
      // do clearup
      return;
    }
    subject.off(name, callback);
    return this;
  },

  on: function(name, callback, subject) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
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
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
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

  off: function(name, callback, subject) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.off(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.off(k, name[k], subject);
        return this;
    }
    if (!name) {
      this._events = null;
      return this;
    }
    if (!this._events) return this;
    if (!this._events[name]) return this;
    for (var i = this._events[name].length-1; i > -1; i--) {
      if (callback && this._events[name][i].callback !== callback) continue;
      if (subject && this._events[name][i].subject !== subject) continue;
      this._events[name].splice(0, i);
    }
    if (!this._events[name].length) delete this._events[name];
    return this;
  },

  trigger: function(name) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
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

/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   $set: {
 *     propName: function(value) {
 *       this._propName = value;
 *     }
 *   },
 *   $get: {
 *     propName: function() {
 *       return this._propName;
 *     }
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls) {
  var props = {};
  if (cls.$set) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].set = cls.$set[k];
    }
  }
  if (cls.$get) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].get = cls.$set[k];
    }
  }
  Object.defineProperties(cls, props);
  return cls;
};

/**
 * A simple class implementation akin to Backbonejs.
 * var cls = Class({
 *  instanceFunction: function() {
 *    console.log("parent function");
 *  }
 * }, {
 *  classFunction: function() {
 *    console.log("class function");
 *  }
 * });
 * @param {Object} proto  An object describing the Class prototype properties.
 * @param {Object} parent An object describing the Class properties.
 */
var ClassExtend = function(proto, cls) {
  var parent = this;
  var child;
  // Create or pick constructor
  if (proto && proto.hasOwnProperty("constructor")) child = proto.constructor;
  else child = function Class() { return parent.apply(this, arguments); };
  // Generate new prototype chain
  child[p] = Object.create(parent[p]);
  // Extend constructor.prototype with prototype chain
  extend(child[p], proto);
  // Reassign constructor
  child[p].constructor = child;
  // Extend constructor with parent functions and cls properties
  extend(child, parent, cls, {
    extend: ClassExtend
  });
  // Apply properties pattern to constructor prototype
  properties(child[p]);
  // Apply properties pattern to constructor
  properties(child);
  return child;
};
  // Add Events properties to basic Class and Class.prototype
var Class = ClassExtend.call(function Class(proto, cls) {}, Events, Events);

var Video = Class.extend({

  id: null,
  selector: null,
  el: null,
  options: null,
  components: null,
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

  constructor: function Video(selector, options) {
    this.id = ++Video._ids;
    this._ensureElement(selector);
    this.options = options || {};
    this.components = {};
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

  players: [],
  components: {}

});

window.Video = Video;

/*
TODO: Make sure to cascade wait for piping
*/
var Stream = Class.extend({

  constructor: function Stream() {},

  pipe: function(stream) {
    this.next = this.next.bind(this);
    this.start = this.start.bind(this);
    this._to = stream;
    delay(this.start, 1);
    return stream;
  },

  start: function() {
    this._start();
  },

  _start: function() {},

  next: function(data) {
    this._next(data, function(data) {
      this.push(data);
    }.bind(this));
  },

  _next: function(data, callback) {
    callback(data);
  },

  push: function(data) {
    this._to.next(data);
  }

});

Video.Stream = Stream;


/*
This is needed for ie11, sometimes it doesn't call ended properly.
It forces the ended event to trigger if the duration and current time are
within 0.01 of each other and the video is paused.
 */
var Ended = Class.extend({

  floorPrecision: 10,

  constructor: function Ended() {
    this.listenTo(Video, {
      "play": this.onPlay,
      "pause": this.onPause,
      "ended": this.onEnded
    });
  },

  onPlay: function(video) {
    video._isAtEnd = false;
  },

  onPause: function(video) {
    if (!this.isEnded(video) || video._isAtEnd) return;
    setTimeout(function() {
      if (!video.el) return;
      if (video._isAtEnd) return;
      if (!this.isEnded(video)) return;
      video.el.dispatchEvent(new Event('ended'));
    }.bind(this), 150);
  },

  onEnded: function(video) {
    video._isAtEnd = true;
  },

  isEnded: function(video) {
    return (Math.abs(Math.floor(video.el.currentTime*this.floorPrecision) - Math.floor(video.el.duration*this.floorPrecision)) <= 1);
  }

});

Video.ended = new Ended();

/*
This makes timeupdate events trigger at greater frequency, every 62.5 milliseconds
(16fps) rather than 250ms (4fps) in most browsers.
*/
var TimeUpdate = Class.extend({

  playing: null,
  interval: 62.5,
  isRaf: false,
  lastTickTime: null,

  constructor: function TimeUpdate() {
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
      rAF(this.onRaf);
      this.inRaf = true;
    }
  },

  onRaf: function() {
    var now = Date.now();
    if (now < this.lastTickTime + this.interval) {
      if (!this.playing.length) return this.inRaf = false;
      return rAF(this.onRaf);
    }
    for (var i = 0, l = this.playing.length; i < l; i++) {
      var event = createEvent('timeupdate');
      event.realtime = true;
      this.playing[i].el.dispatchEvent(event);
    }
    return rAF(this.onRaf);
  },

  onPause: function(video) {
    for (var i = 0, l = this.playing.length; i < l; i++) {
      if (this.playing[i].id !== video.id) continue;
      this.playing.splice(i, 1);
    }
  }

});

Video.timeupdate = new TimeUpdate();

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

$.fn.play = function() {
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));
  $videos.each(function(index, item) {
    if (item.tagName !== "VIDEO") return;
    item.play();
  });
};

$.fn.pause = function() {
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));
  $videos.each(function(index, item) {
    if (item.tagName !== "VIDEO") return;
    item.pause();
  });
};

}

var CanvasOutput = Video.Stream.extend({

  _canvas: null,
  _context: null,
  _size: {
    time: 0,
    width: 0,
    height: 0
  },

  constructor: function CanvasOutput(canvas) {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d', { alpha: true });
  },

  _next: function(data, callback) {
    if (this._size.time !== data.size.time) {
    	this._canvas.width = data.size.width;
    	this._canvas.height = data.size.height;
      this._size = data.size;
    }
    this._context.drawImage(data.canvas, 0,0);
  }

});

Video.Stream.CanvasOutput = CanvasOutput;

var PixelTransform = Video.Stream.extend({

  constructor: function PixelTransform() {
  },

  _eaches: [],
  each: function(callback) {
    this._eaches.push(callback);
  },

  _next: function(data, callback) {
    var pixels = data.imageData.data;
    // Loop through the pixels
    var pixel = {r:0,g:0,b:0};
    for (var i = 0, l = pixels.length; i < l; i+=4) {
        for (var e = 0, el = this._eaches.length; e < el; e++) {
            pixel.r = pixels[i];
            pixel.g = pixels[i+1];
            pixel.b = pixels[i+2];
            this._eaches[e](pixel, pixels.length);
            pixels[i] = pixel.r;
            pixels[i+1] = pixel.g;
            pixels[i+2] = pixel.b;
        }
    }
    data.imageData.data = pixels;
    data.context.putImageData(data.imageData, 0, 0);
    callback(data);
  }

});

Video.Stream.PixelTransform = PixelTransform;

var VideoInput = Video.Stream.extend({

  _from: null,
  _canvas: null,
  _context: null,
  _size: null,

  constructor: function VideoInput(video) {
    if (video instanceof Video) this._from = video;
    if (video instanceof HTMLMediaElement) this._from = video.player;
    this._canvas = document.createElement('canvas');
    this._context = this._canvas.getContext('2d', { alpha: true });
    this._capture = this._capture.bind(this);
    this._resize();
    this.listenTo(this._from, {
      "resize": this._resize,
      "timeupdate": this._capture
    });
  },

  _resize: function() {
    this._size = this._getSize();
    this._canvas.width = this._size.width;
    this._canvas.height = this._size.height;
    this._capture();
  },

  _getSize: function() {
    return {
      time: Date.now(),
      height: this._from.el.clientHeight,
      width: this._from.el.clientWidth
    };
  },

  _capture: function() {
    this._context.drawImage(this._from.el, 0, 0, this._size.width, this._size.height);
    if (this._isStart) return this._continue();
    this._isWaiting = true;
  },

  _start: function() {
    this._isStart = true;
    if (!this._isWaiting) return;
    return this._continue();
    this._isWaiting = false;
  },

  _continue: function() {
    this.push({
      size: this._size,
      canvas: this._canvas,
      context: this._context,
      imageData: this._context.getImageData(0, 0, this._size.width, this._size.height)
    });
  }

});

Video.Stream.VideoInput = VideoInput;

var Buffer = Class.extend({

  video: null,

  constructor: function Buffer(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onTimeUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    if (!groups.buffer) return;
    var buffers = groups.buffer;
    var duration = this.video.el.duration;
    var buffered = this.video.el.buffered;
    var length = 0;
    for (var b = 0, bl = buffered.length; b < bl; b++) {
      var start = buffered.start(b);
      var end = buffered.end(b);
      length += end-start;
    }
    var position = (length / duration) || 0;
    for (var i = 0, l = buffers.length; i < l; i++) {
      var buffer = buffers[i];
      buffer.style.width = position * 100 + "%";
    }
  },

  onDestroyed: function() {
    debugger;
  }

});

Video.components.Buffer = Buffer;

var Captions = Class.extend({

  video: null,
  languages: null,
  defaultLang: null,

  constructor: function Captions(video) {
    this.video = video;
    this.getLangs(this.onCaptionsLoaded.bind(this));
    this.listenTo(this.video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onCaptionsLoaded: function(langs) {
    this.languages = langs;
    this.defaultLang = null;
    for (var k in langs) {
      if (!this.languages[k].default) continue;
      this.defaultLang = this.languages[k];
      break;
    }
  },

  onTimeUpdate: function(event) {

    // Skip realtime triggers, captions never need to be realtime
    if (event && event.realtime) return;
    if (!this.languages) return;

    var ct = this.video.el.currentTime;

    var liveLangElements = {}
    var liveLangsCount = 0;

    var groups = Video.dom.fetch(this.video);
    groups.captions && groups.captions.forEach(function(el) {
      var lang = el.getAttribute("srclang")
      if (!this.languages[lang]) return;
      if (!liveLangElements[lang]) {
        liveLangElements[lang] = [];
        liveLangsCount++;
      }
      liveLangElements[lang].push(el);
    }.bind(this));

    if (!liveLangsCount) return;

    for (var lang in liveLangElements) {

      var elements = liveLangElements[lang];
      var captionLang = this.languages[lang];

      var newLiveCues = captionLang._cues.filter(function(cue) {
        return (cue.start <= ct && cue.end >= ct && !cue.live);
      });

      var toRemove = captionLang._cues.filter(function(cue) {
        return (cue.start > ct || cue.end < ct) && cue.live;
      });

      if (newLiveCues.length === 0 && toRemove.length === 0) return;

      // Render changes to dom
      // TODO make this accessible proper
      elements.forEach(function(el) {
        newLiveCues.forEach(function(cue) {
          cue.live = true;
          var containerAttributes = this.renderCuePlacement({
            id: cue.id,
            lang: lang,
            'class': 'cue'
          }, cue);
          var containerSpan = document.createElement('span');
          for (var k in containerAttributes) {
            containerSpan.setAttribute(k, containerAttributes[k]);
          }
          var cueSpan = document.createElement('span');
          cueAttributes = {
            'class': 'cue-text',
            html: cue.lines.join('<br>')
          };
          for (var k in cueAttributes) {
            if (k === 'html') {
              cueSpan.innerHTML = cueAttributes[k];
              continue;
            }
            cueSpan.setAttribute(k, cueAttributes[k]);
          }
          containerSpan.appendChild(cueSpan);
          el.appendChild(containerSpan);
        }.bind(this));
        toRemove.forEach(function(cue) {
          cue.live = false;
          var children = el.querySelectorAll("#"+cue.id+".cue");
          toArray(children).forEach(function(child) {
            removeElement(child);
          });
        });
        var children = el.querySelectorAll(".cue:not([lang="+lang+"])")
        toArray(children).forEach(function(child) {
          removeElement(child);
        });
      }.bind(this));
    }

  },

  renderCuePlacement: function(htmlObj, cue) {

    var classes = htmlObj['class'].split(" ");
    classes.push(cue.placement.vertical);
    var style = "";

    var placement = cue.placement;
    switch (placement.vertical) {
      case "horizontal":
        switch (placement.align) {
          case "start":
            classes.push("align-left");
            break;
          case "middle":
            classes.push("align-center");
            break;
          case "end":
            classes.push("align-right");
            break;
        }
        style += "width:" + placement.size +";";
        style += "left:" + placement.position +";";
        var isPercentageMeasure = (String(placement.line).indexOf("%") > -1);
        if (isPercentageMeasure || placement.line >= 0) {
          var top = placement.line;
          style += "top:" + placement.line + "%";
        } else {
          var bottom = 100 - (Math.abs(placement.line) * 100);
          style += "bottom:" + bottom + "%";
        }
        break;
      case "rl":
        switch (placement.align) {
          case "start":
            classes.push("align-top");
            break;
          case "middle":
            classes.push("align-middle");
            break;
          case "end":
            classes.push("align-bottom");
            break;
        }
        style += "height:" + placement.size +";";
        style += "top:" + placement.position +";";
        var isPercentageMeasure = (String(placement.line).indexOf("%") > -1);
        if (isPercentageMeasure || placement.line >= 0) {
          var left = placement.line;
          style += "left:" + placement.line + "%";
        } else {
          var right = 100 - (Math.abs(placement.line) * 100);
          style += "right:" + right + "%";
        }
        break;
      case "lr":
        switch (placement.align) {
          case "start":
            classes.push("align-top");
            break;
          case "middle":
            classes.push("align-middle");
            break;
          case "end":
            classes.push("align-bottom");
            break;
        }
        style += "height:" + placement.size +";";
        style += "top:" + placement.position +";";
        var isPercentageMeasure = (String(placement.line).indexOf("%") > -1);
        if (isPercentageMeasure || placement.line >= 0) {
          var right = placement.line;
          style += "right:" + placement.line + "%";
        } else {
          var left = 100 - (Math.abs(placement.line) * 100);
          style += "left:" + left + "%";
        }
        break;
    }

    htmlObj['class'] = classes.join(" ");
    htmlObj['style'] = style;

    return htmlObj;

  },

  getLangs: function(callback) {

    if (typeof callback !== "function") {
      callback = null;
    }

    if (this.languages) {
      return callback(this.languages);
    }

    var loaded = 0;
    var counted = 0;
    function onLoaded(lang) {
      if (!lang.isReady()) {
        counted--;
        delete langs[lang.lang];
      } else {
        loaded++;
      }
      if (loaded === counted) {
        if (callback) callback(langs);
      }
    }

    var langs = {};

    var tracks = this.video.el.querySelectorAll("track[type='text/vtt']");
    toArray(tracks).forEach(function(el) {
      var lang = el.getAttribute("srclang");
      var src = el.getAttribute("src");
      if (lang && src) {
        if (langs[lang]) {
          return;
        }
        counted++;
        langs[lang] = new Lang({
          default: (el.getAttribute("default")!==undefined),
          lang: lang,
          src: src,
          label: el.getAttribute("label")
        }, onLoaded);
      }
      removeElement(el);
    });

    return langs;

  },

  onDestroyed: function() {
    debugger;
  }

});

Video.components.Captions = Captions;

var Controller = Class.extend({

  constructor: function Controller() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    for (var k in Video.components) {
      video.components[k] = new Video.components[k](video);
    }
  }

});

Video.controller = new Controller();

/*
 Captures DOM elements and groups them according to their for and kind attributes.
 Video.dom.refresh();
 var UIElements = Video.dom.fetch(video)
 */
var DOM = Class.extend({

  _videos: null,
  _elements: null,

  constructor: function DOM() {
    this._videos = [];
    this._elements = {};
    this.listenTo(Video, {
      "create": this._onCreated,
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
    this._elements = this._groupNodes(elements);
  },

  fetch: function(video) {
    var id = video.el.id;
    return this._elements[id] || {};
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

var Lang = Class.extend({

  _cues: null,
  _styles: null,
  _loaded: false,
  _errored: false,
  default: null,
  label: null,
  lang: null,
  src: null,

  constructor: function Lang(options, callback) {
    extend(this, options);
    this._fetch(callback);
  },

  _fetch: function(callback) {
    $.ajax({
      url: this.src,
      dataType: "text",
      success: function(data) {

        this._parse(data);

        this._error = false;
        this._loaded = true;

        if (callback) callback(this);

      }.bind(this),
      error: function(err) {
        this._error = err;
        this._loaded = true;

        if (callback) callback(this);
      }.bind(this)
    });
  },

  isReady: function() {
    return (this._loaded && !this._error);
  },

  _parse: function(raw) {

    var eolChars = raw.indexOf("\r\n") > -1 ? "\r\n" : "\n";
    var lines = raw.split(eolChars);

    this._cues = [];
    this._styles = [];

    var group = [];
    //get groups by line breaks
    for (var i = 0, l = lines.length; i < l; i++) {
      var line = lines[i];

      var isEnd = (i === lines.length-1);
      var isBlank = !line;

      if (isEnd && !isBlank) {
        group.push(line);
      }

      // form group
      if ((isEnd || isBlank) && group.length) {

        if (group[0].toLowerCase().indexOf("webvtt") > -1) {
          // drop webvtt line
          group.splice(0, 1);
          // drop group if empty
          if (!group.length) continue;
        }

        this._cues.push({
          id: "c" + ++Lang._cueid,
          title: "",
          start: null,
          end: null,
          placement: null,
          lines: group
        });

        group = [];
        continue;

      }

      if (isBlank) continue;

      group.push(line);

    }

    //remove NOTEs and STYLES
    this._cues = this._cues.filter(function(group) {
      var isNode = (group.lines[0].indexOf("NOTE") === 0);
      if (isNode) return;

      var isStyle = (group.lines[0].indexOf("STYLE") === 0);
      if (isStyle) {
        group.lines.splice(0,1);
        this._styles.push(group.lines.join("\n"));
        return;
      }

      if (group.lines[0].indexOf("-->") === -1) {
        group.title = group.lines[0];
        group.lines.shift();
      }

      if (group.lines[0].indexOf("-->") === -1) {
        throw "Error";
      } else {
        extend(group, this._parseTimePlacement(group.lines[0]));
        group.lines.shift();
      }

      return true;

    }.bind(this));

    //TODO: make line tag parser if required

  },

  _parseTimePlacement: function(line) {

    line = line.trim();

    var breakpoint = indexOfRegex(line, /-->/);
    if (breakpoint === -1) throw "Time declaration error, no -->";
    var start = line.slice(0, breakpoint).trim();
    line = line.slice(breakpoint);

    var startpoint = indexOfRegex(line, /[0-9]+/);
    if (startpoint === -1) throw "Time declaration error, no end time";
    line = line.slice(startpoint);

    var breakpoint = indexOfRegex(line, /[ ]{1}/);
    if (breakpoint === -1) breakpoint = line.length;
    var end = line.slice(0, breakpoint).trim();
    line = line.slice(breakpoint);

    return {
      start: this._parseTime(start),
      end: this._parseTime(end),
      placement: this._parsePlacement(line)
    };

  },

  _timeUnits: [1/1000, 1, 60, 360],
  _parseTime: function(time) {

    var blocks = time.split(/[\:\.\,]{1}/g).reverse();
    if (blocks.length < 3) throw "Time declaration error, mm:ss.ttt or hh:mm:ss.tt";
    var seconds = 0;
    for (var i = 0, l = blocks.length; i < l; i++) {
      seconds += this._timeUnits[i]*parseInt(blocks[i]);
    }
    return seconds;

  },

  _parsePlacement: function(line) {

    var items = line.split(" ").filter(function(item) {return item;});
    var parsed = {
      line: -1,
      position: "50%",
      size: "100%",
      align: "middle",
    };
    items.forEach(function(item) {
      var parts = item.split(":");
      var valueParts = parts[1].split(",");
      var name = parts[0].toLowerCase();
      switch (name) {
        case "d": name = "vertical"; break;
        case "l": name = "line"; break;
        case "t": name = "position"; break;
        case "s": name = "size"; break;
        case "a": name = "align"; break;
        case "vertical": case "line": case "position": case "size": case "align": break;
        default:
          throw "Bad position declaration, "+name;
      }
      parsed[name] = valueParts[0] || parsed[name];
    });

    // set vertical to rl/lr/horizontal
    parsed.vertical = (parsed.vertical === "vertical") ? "rl" : (parsed.vertical === "vertical-lr") ? "lr" : "horizontal";

    for (var name in parsed) {
      var value = parsed[name];
      switch (name) {
        case "line":
          value = String(value || -1);
          break;
        case "position":
          value = String(value || "0%");
          break;
        case "size":
          value = String(value || "100%");
          break;
        case "align":
          value = String(value || "middle");
          switch (value) {
            case "start": case "middle": case "end": break;
            default:
              throw "Invalid align declaration";
          }
          break;
      }
    }

    return parsed;
  }

},{

  _cueid: 0

});

Video.Lang = Lang;


var Rail = Class.extend({

  video: null,

  constructor: function Rail(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroyed": this.onDestroyed
    });
    this.onTimeUpdate();
  },

  onTimeUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    if (!groups.rail) return;
    var rails = groups.rail;
    for (var i = 0, l = rails.length; i < l; i++) {
      var rail = rails[i];
      var position = (this.video.el.currentTime / this.video.el.duration) || 0;
      rail.style.width = position * 100 + "%";
    }
  },

  onDestroyed: function() {
    debugger;
  }

});

Video.components.Rail = Rail;

var Ratio = Class.extend({

  video: null,

  constructor: function Ratio(video) {
    this.video = video;
    this.onResize = this.onResize.bind(this);
    this.listenTo(video, {
      "resize": this.onResize,
      "destroyed": this.onDestroyed
    });
    this.attachEventListeners();
    this.onResize();
  },

  attachEventListeners: function() {
    window.removeEventListener("resize", this.onResize);
    window.addEventListener("resize", this.onResize);
  },

  onResize: function() {
    var size = this.getSize();
    var parent = this.getParent();

    var el = this.video.el;
    switch (size.width.unit) {
      case "contain":
        el.style['object-fit'] = size.width.unit;
        if (size.ratio <= parent.ratio) {
          // height
          el.style.height = parent.height.value + parent.height.unit;
          el.style.width = (parent.height.value * size.ratio) + parent.height.unit;
        } else {
          // width
          el.style.width = parent.width.value + parent.width.unit;
          el.style.height = (parent.width.value / size.ratio)  + parent.width.unit;
        }
        break;
      case "cover":
        el.style['object-fit'] = size.width.unit;
        if (size.ratio <= parent.ratio) {
          //width
          el.style.width = parent.width.value + parent.width.unit;
          el.style.height = (parent.width.value / size.ratio)  + parent.width.unit;
        } else {
          //height
          el.style.height = parent.height.value + parent.height.unit;
          el.style.width = (parent.height.value * size.ratio) + parent.height.unit;
        }
        break;
      case "fill":
        el.style['object-fit'] = size.width.unit;
        el.style.height = parent.height.value + parent.height.unit;
        el.style.width = parent.width.value + parent.width.unit;
        break;
      case "none":
        el.style['object-fit'] = size.width.unit;
        el.style.height = "";
        el.style.width = "";
        break;
      default:
        el.style['object-fit'] = "fill";
        if (size.width.unit !== "auto") {
          el.style.width = size.width.value + size.width.unit;
        }
        if (size.height.unit !== "auto") {
          el.style.height = size.height.value + size.height.unit;
        }
        if (size.width.unit === "auto") {
          el.style.width = (el.clientHeight * size.ratio)  + "px";
        }
        if (size.height.unit === "auto") {
          el.style.height = (el.clientWidth / size.ratio)  + "px";
        }
    }

  },

  getSize: function() {
    var size = this.video.el.getAttribute("size") || "none";
    size = size.trim();

    var sizeParts = size.split(" ");
    var sizeWidth = parseUnit(sizeParts[0] || "auto");
    var sizeHeight = parseUnit(sizeParts[1] || "auto");

    switch (sizeWidth.unit) {
      case "contain":
      case "cover":
      case "fill":
      case "none":
        sizeHeight.unit = sizeWidth.unit;
        break;
    }

    return {
      ratio: this.getRatio(),
      width: sizeWidth,
      height: sizeHeight
    };
  },

  getRatio: function() {
    var ratio = this.video.el.getAttribute("ratio") || "16:9";
    ratio = ratio.trim();
    ratio = ratio.replace(/\:/g, " ");
    ratio = ratio.replace(/\//g, " ");
    ratio = ratio.replace(/\*/g, "");

    var ratioParts = ratio.split(" ");
    var ratioWidth = parseUnit(ratioParts[0] || "16");
    var ratioheight = parseUnit(ratioParts[1] || "9");

    return ratioWidth.value / ratioheight.value;
  },

  getParent: function() {
    var offsetParent = this.video.el.offsetParent;
    var parentSize = offsetParent.getBoundingClientRect();
    return {
      ratio: parentSize.width / parentSize.height,
      width: parseUnit(parentSize.width),
      height: parseUnit(parentSize.height)
    };
  },

  onDestroyed: function() {
    window.removeEventListener("resize", this.onResize);
  }

});

Video.components.Ratio = Ratio;

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

var Toggle = Class.extend({

  video: null,

  constructor: function Toggle(video) {
    this.video = video;
    this.listenTo(video, {
      "pause play": this.onUpdate
    });
    this.attachEventListeners();
    this.onUpdate();
  },

  attachEventListeners: function() {
    this.onClick = this.onClick.bind(this);
    var groups = Video.dom.fetch(this.video);
    groups.toggle && groups.toggle.forEach(function(el) {
      el.removeEventListener('click', this.onClick);
      el.addEventListener('click', this.onClick);
    }.bind(this));
  },

  onUpdate: function() {
    var groups = Video.dom.fetch(this.video);
    var isPaused = this.video.el.paused;
    groups.toggle && groups.toggle.forEach(function(el) {
      toggleClass(el, "should-play", isPaused);
      toggleClass(el, "should-pause", !isPaused);
    });
  },

  onClick: function() {
    var isPaused = this.video.el.paused;
    if (isPaused) this.video.el.play();
    else this.video.el.pause();
    this.onUpdate();
  },

  onDestroyed: function() {
    var groups = Video.dom.fetch(this.video);
    groups.toggle && groups.toggle.forEach(function(el) {
      el.removeEventListener('click', this.onClick);
      el.addEventListener('click', this.onClick);
    }.bind(this));
  }

});

Video.components.Toggle = Toggle;


var toggleClass = function(element, classNames, bool) {
  switch (typeof classNames) {
    case "string":
      classNames = classNames.split(" ");
      break;
  }
  bool = (bool === undefined) ? true : bool;
  var classList = element.classList;
  for (var n = 0, nl = classNames.length; n < nl; n++) {
    var nameItem = classNames[n];
    var found = false;
    for (var i = 0, l = classList.length; i < l; i++) {
      var classItem = classList[i];
      if (classItem !== nameItem) continue;
      found = true;
    }
    if (!found && bool) classList.add(nameItem);
    else if (found && !bool) classList.remove(nameItem);
  }
};

var removeElement = function(element) {
  if (element.remove) element.remove();
  else element.parentNode.removeChild(element);
};

var createEvent = function(name) {
  if (!createEvent._ie11) {
    try {
      var event = new Event('timeupdate');
      return event;
    } catch (e) {
      createEvent._ie11 = true;
    }
  }
  if (!createEvent._ie11) return;
  var event = document.createEvent('Event');
  event.initEvent('timeupdate', true, true);
  return event;
};

var rAF = function(cb) {
  return window.requestAnimationFrame(cb);
};

/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   $set: {
 *     propName: function(value) {
 *       this._propName = value;
 *     }
 *   },
 *   $get: {
 *     propName: function() {
 *       return this._propName;
 *     }
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls) {
  var props = {};
  if (cls.$set) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].set = cls.$set[k];
    }
  }
  if (cls.$get) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].get = cls.$set[k];
    }
  }
  Object.defineProperties(cls, props);
  return cls;
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
})(this,this.jQuery);