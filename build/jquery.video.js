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
  var c = prototype.constructor === Object ?
    function() {} :
    prototype.constructor;
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
    this.stopListening();
    this.off();
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
var CaptionsController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "create": this.onCreate
    });
  },

  onCreate: function(video) {
    new Captions(video)
  }

});

var Captions = Class({

  video: null,
  languages: null,
  defaultLang: null,

  constructor: function(video) {
    this.video = video;
    this.getLangs(this.onCaptionsLoaded.bind(this));
    this.listenTo(this.video, {
      "timeupdate": this.onTimeUpdate
    });
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

    // skip realtime triggers, captions never need to be realtime
    if (event.realtime) return;
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
          children.forEach(function(child) { child.remove(); });
        });
        var children = el.querySelectorAll(".cue:not([lang="+lang+"])")
        children.forEach(function(child) { child.remove(); });
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

    this.video.el.querySelectorAll("track[type='text/vtt']").forEach(function(el) {
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
      el.remove();
    });

    return langs;

  }

});

Video.captions = new CaptionsController();

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

  fetch: function(video) {
    var id = video.el.id;
    return this.elements[id] || [];
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

var Lang = Class({

  _cues: null,
  _styles: null,
  _loaded: false,
  _errored: false,
  default: null,
  label: null,
  lang: null,
  src: null,

  constructor: function(options, callback) {
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