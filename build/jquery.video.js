(function($){$("<style>",{text:"[for][kind=buffering]{position:absolute;top:0;left:0;bottom:0;right:0;font-size:22px;font-family:sans-serif;line-height:120%;}[for][kind=buffering]{display:none;}[for][kind=buffering].buffering{display:block;}[for][kind=captions]{position:absolute;top:0;left:0;bottom:0;right:0;font-size:22px;font-family:sans-serif;line-height:120%;}[for][kind=captions] .cue{position:absolute;font-size:100%;line-height:120%;}[for][kind=captions] .cue .cue-text{background-color:black;color:white;padding:0.2%;}[for][kind=captions] .cue.horizontal{transform:translateX(-50%);}[for][kind=captions] .cue.lr{transform:translateY(-50%);}[for][kind=captions] .cue.rl{transform:translateY(-50%);}[for][kind=captions] .cue.align-left{text-align:left;}[for][kind=captions] .cue.align-right{text-align:right;}[for][kind=captions] .cue.align-center{text-align:center;}[for][kind=captions] .cue.align-top{text-align:left;}[for][kind=captions] .cue.align-middle{text-align:right;}[for][kind=captions] .cue.align-bottom{text-align:center;}[for][kind=controls]{position:absolute;top:0;left:0;bottom:0;right:0;font-size:22px;font-family:sans-serif;line-height:120%;}[for][kind=controls]{opacity:1;transition:opacity 0.2s ease-in;}[for][kind=controls].playing .big-play{opacity:0;}[for][kind=poster]{position:absolute;top:0;left:0;bottom:0;right:0;font-size:22px;font-family:sans-serif;line-height:120%;}[for][kind=poster] img{opacity:1;transition:opacity 0.2s ease-in;}[for][kind=poster].paused.in-middle img,[for][kind=poster].playing img{opacity:0;}[for][kind=controls] .scrub{position:absolute;bottom:0;width:100%;background:rgba(255, 255, 255, 0.82);}[for][kind=controls] .scrub .rail{margin:8px;position:relative;cursor:pointer;}[for][kind=controls] .scrub .rail .rail-back{position:absolute;top:0;left:0;right:0;bottom:0;background-color:lightgrey;}[for][kind=controls] .scrub .rail .rail-inner{position:relative;height:8px;background-color:#d45971;transition:width 0.05s linear;}[for][kind=controls] .scrub{opacity:1;transition:opacity 0.2s ease-in;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}[for][kind=controls].paused.at-start .scrub,[for][kind=controls].paused.at-end .scrub,[for][kind=controls].playing .scrub{opacity:0}[for][kind=controls].mousemove.paused.in-middle .scrub,[for][kind=controls].mousemove.paused.at-end .scrub,[for][kind=controls].mousemove.playing .scrub{opacity:1}"}).appendTo("head");
var extend = $.extend;
var p = "prototype";

$.indexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(fromIndex) : value;
  var match = str.match(regex);
  return match ? str.indexOf(match[0]) + fromIndex : -1;
};

$.lastIndexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(0, fromIndex) : value;
  var match = str.match(regex);
  return match ? str.lastIndexOf(match[match.length-1]) : -1;
};

$.chain = function(original, callback) {
  return function() {
    var args = Array[p].slice.call(arguments, 0);
    args.unshift(function() {
      var args = Array[p].slice.call(arguments, 0);
      return original.apply(this, args);
    }.bind(this));
    return callback.apply(this, args);
  };
};

var chain = $.chain;

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

// global api
$.fn.videos = function(options) {

  // get all video tags selected and make Video instances for them
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));

  switch (options) {
    case "destroy":
      // tear down all video class + dom associations
      $videos.each(function(index, item) {
        if (!(item[Video._prop] instanceof Video)) return;
        item[Video._prop].destroy();
        delete item[Video._prop];
      });
      return $videos;
  }

  $videos.each(function(index, item) {
    if (!item[Video._prop]) {
      new Video($(item), options);
    }
  });
  return $videos;

};

// check for touch devices
extend($.fn.videos, {
  isTouch: false
});
var touchListener = function() {
  window.removeEventListener("touchstart", touchListener);
  $.fn.videos.isTouch = true;
};
window.addEventListener("touchstart", touchListener);


// Video class
var Video = $.Video = function Video($el, options) {
  this.id = ++Video._ids;
  this.el = $el[0];
  this.$el = $el;
  this.el[Video._prop] = this;
  this.options = this._opts = {};
  this.defaults();
  this.setOptions(options);
  this.initialize();
};

// Video global functions
extend(Video, {

  _ids: 0,
  _eventsHandler_count: 0,
  _eventsHandlers: {},
  _prop: "player",
  _events: ["load", "waiting", "preplay", "play", "pause", "timeupdate", "finish"],

  removeEventsHandler: function() {

    var eventsHandlers = Video._eventsHandlers;

    if (!Video._eventsHandler_count) return;

    for (var id in eventsHandlers) {
      var eventsHandler = eventsHandlers[id];
      var $el = eventsHandler.$el;
      eventsHandler.forEach(function(item) {
        Video._events.forEach(function(event) {
          $el.off(event, Video._processeventsHandlerEvents);
        });
      });
      delete eventsHandlers[id];
      Video._eventsHandler_count--;
    }

  },

  _processeventsHandlerEvents: function(event, data) {

    extend(event, data);

    var eventsHandlers = Video._eventsHandlers;

    var el = event.currentTarget;
    var id = event.currentTarget[Video._prop].id;
    if (!id) return;

    var eventsHandler = eventsHandlers[id];

    if (!eventsHandler) return;
    if (!eventsHandler.length) return;

    var video = el[Video._prop];

    eventsHandler.forEach(function(item) {
      item.callback.call(video, event, item._opts)
    });
    
  }

});

// Video instance functions
extend(Video[p], {

  defaults: function() {},

  setOptions: function(options) {
    extend(this._opts, options);
  },

  initialize: function() {},

  destroy: function() {
    delete this.el[Video._prop];
    this.id = null;
    this.el = null;
    this.$el = null;
  },

  addEventsHandler: function(callback, options) {

    var eventsHandlers = Video._eventsHandlers;
  
    if (!callback) return;

    var el = this.el;

    if (!this._opts.eventsHandler) {
      this._opts.eventsHandler = true;
      eventsHandlers[el[Video._prop].id] = [];
      eventsHandlers[el[Video._prop].id].$el = this.$el;
      Video._events.forEach(function(event) {
        this.$el.on(event, Video._processeventsHandlerEvents);
      }.bind(this));
      Video._eventsHandler_count++;
    }

    var eventsHandler = eventsHandlers[el[Video._prop].id];

    for (var i = 0, l = eventsHandler.length; i < l; i++) {
      var item = eventsHandler[i];
      if (item.callback === callback && item.context === this) return;
    }

    eventsHandler.push({
      context: this,
      callback: callback,
      options: options
    });

  },

  removeEventsHandler: function(callback) {

    var el = this.el;
    var eventsHandlers = Video._eventsHandlers;

    if (!this._opts.eventsHandler) return;
    if (!Video._eventsHandler_count) return;

    var eventsHandler = eventsHandlers[el[Video._prop].id];
    
    if (!eventsHandler) return;
    if (!eventsHandler.length) return;

    if (callback) {
    
      for (var i = eventsHandler.length-1, l = -1; i > l; i--) {
        var item = eventsHandler[i];
        if (item.context !== this || item.callback !== callback) continue;
        eventsHandler.splice(i,1);
        if (!eventsHandler.length) {
          Video._events.forEach(function(event) {
            this.$el.off(event, Video._processeventsHandlerEvents);
          }.bind(this));
          delete eventsHandlers[this.id];
          this._opts.eventsHandler = false;
          Video._eventsHandler_count--;
        }
        break;
      }

      return;

    }

    eventsHandler.forEach(function(item) {
      Video._events.forEach(function(event) {
        this.$el.off(event, Video._processeventsHandlerEvents);
      }.bind(this));
    }.bind(this));
    delete eventsHandlers[this.id];
    this._opts.eventsHandler = false;
    Video._eventsHandler_count--;

  },

  destroy: function(destroy) {
    this.removeEventsHandler();
  }

});
// Video standard instance functions
extend($.fn, {

  play: function() {
    this.videos().each(function(index, item) {
      item[Video._prop].play();
    });
    return this;
  },

  pause: function() {
    this.videos().each(function(index, item) {
      item[Video._prop].pause();
    });
    return this;
  },

  mute: function(bool) {
    var isToggle = (bool === undefined);
    bool = Boolean(bool);
    this.videos().each(function(index, item) {
      var shouldMute = bool || (isToggle && !item.muted);
      if (shouldMute) {
        item.muted = true;
        item.volume = 0;
        return;
      }
      item.muted = false;
      item.volume = 1;
    });
    return this;
  },

  loop: function(bool) {
    var isToggle = (bool === undefined);
    bool = Boolean(bool);
    this.videos().each(function(index, item) {
      var shouldLoop = bool || (isToggle && !item.loop);
      if (shouldLoop) {
        item.loop = true;
        return;
      }
      item.loop = false;
    });
    return this;
  }

});

 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      muted: Boolean(this.$el.attr("muted")) || false,
      loop: Boolean(this.$el.attr("loop")) || false,
      controls: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {
    this.$el.mute(this._opts.muted);
    this.$el.loop(this._opts.loop);

    this.handleInputEvent = this.handleInputEvent.bind(this);
    this._toggle_play_pause = this._toggle_play_pause.bind(this);
    this._on_after_mouseover = debounce(this._on_after_mouseover, 3000);

    if (this._opts.controls) {
      this.controls("start");
    }
    initialize();
  }),

  controls: function(command, options) {
    switch (command) {
      case "start":
        this._start_controls(options);
        break;
      case "stop":
        this._stop_controls(options);
        break;
    }
    return this;
  },

  play: function() {
    if (!this.$el[0].play) return;
    this.$el.trigger("preplay");
    try {
      this.$el[0].play();
    } catch(err) {
      
    }
  },

  pause: function() {
    if (!this.$el[0].play) return;
    this.$el[0].pause();
  },

  _start_controls: function(options) {
    this._$controlobservers =  $("[for='"+this.$el.attr("id")+"'][kind=controls]");
    this._$controlobservers.on("click", this.handleInputEvent);
    this._$controlobservers.on("mousemove", this.handleInputEvent);

    options = extend({}, this._opts, options, {controls: true});
    this.addEventsHandler(this._render_controls, options);
    
    this._render_control_classes();
    this._$controlobservers.removeClass("playing paused");
    this._$controlobservers.addClass("paused");
  },

  handleInputEvent: function(event) {
    var $target = $(event.target);

    if (!$target.is(".play, .toggle") && ($target.is(".no-control") || $target.parents(".no-control").length !== 0)) {
      this._$controlobservers.addClass("mousemove");
      this._on_after_mouseover();
      return;
    }

    if ($.fn.videos.isTouch) {
      switch (event.type) {
        case "click":
          if (!this.el.paused && $.fn.videos.isTouch && !this._triggeredMouseMove && this._$controlobservers.find(".scrub").length > 0) {
            this._triggeredMouseMove = true;
            this._$controlobservers.addClass("mousemove");
            this._on_after_mouseover();
            return;
          }

          if ($target.is(".play, .toggle") || $target.parents(".play, .toggle").length !== 0) {
            this._toggle_play_pause();
          }
          this._on_after_mouseover();
          break;
        case "mousemove":
          this._on_after_mouseover();
          break;
      }
      return
    }

    switch (event.type) {
      case "click":
        if ($target.is(".play, .toggle") || $target.parents(".play, .toggle").length !== 0) {
          this._toggle_play_pause();
        }
        break;
      case "mousemove":
        this._triggeredMouseMove = true;
        this._$controlobservers.addClass("mousemove");
        this._on_after_mouseover();
        break;
    }

  },

  _triggeredMouseMove: false,
  _on_after_mouseover: function() {
    this._triggeredMouseMove = false;
    if (!this._$controlobservers) return;
    this._$controlobservers.removeClass("mousemove");
  },

  _toggle_play_pause: function() {
    if (this.$el[0].paused) {
      this.play();
    } else {
      this.pause();
    }
  },

  _render_controls: function(event, options) {
    switch (event.type) {
      case "play":
        this._$controlobservers.removeClass("playing paused");
        this._$controlobservers.addClass("playing");
        break;
      case "pause": 
      case "finish":
        this._$controlobservers.removeClass("playing paused");
        this._$controlobservers.addClass("paused");
        break;
    }
    this._render_control_classes();
  },

  _render_control_classes: function() {
    var isAtStart = this.el.currentTime <= 0.1;
    var isAtEnd = this.el.currentTime  >= this.el.duration -0.1;
    var isInMiddle = (!isAtStart && !isAtEnd);
    var state = isAtStart ? "at-start" : isAtEnd ? "at-end" : "in-middle";
    if (this._opts._controlState !== state) {
      this._$controlobservers[isAtStart?'addClass':'removeClass']("at-start");
      this._$controlobservers[isAtEnd?'addClass':'removeClass']("at-end");
      this._$controlobservers[!isAtStart&&!isAtEnd?'addClass':'removeClass']("in-middle");
      this._opts._controlState = state;
    }
  },

  _stop_controls: function(options) {
    if (!this._$controlobservers) return;
    this._$controlobservers.off("click", this.handleInputEvent);
    this._$controlobservers.off("mousemove", this.handleInputEvent);
    this._$controlobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_controls();
    destroy();
  })

});
 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      buffering: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    if (this._opts.buffering) {
      this.buffering("start");
    }
    initialize();

  }),

  buffering: function(command, options) {
    switch (command) {
      case "start":
        this._start_buffering(options);
        break;
      case "stop":
        this._stop_buffering(options);
        break;
    }
    return this;
  },

  _start_buffering: function(options) {
    this._$bufferingobservers =  $("[for='"+this.$el.attr("id")+"'][kind=buffering]");
    if (!this._$bufferingobservers.length) {
      this._$bufferingobservers = null;
      return;
    }

    this._$bufferingobservers.on("click", this.handleInputEvent);
    this._opts._hasBufferingClass = true;
    options = extend({}, this._opts, options, {buffering: true});
    this.addEventsHandler(this._render_buffering, options);

  },

  _render_buffering: function(event, options) {
    switch (event.type) {
      case "preload":
        this._opts._seconds = this.el.currentTime;
      case "timeupdate":
      case "waiting":
      case "load":
        if (!this.el.paused && this._opts._seconds === this.el.currentTime) {
          if (!this._opts._lastStalled) {
            this._opts._lastStalled = Date.now();
          } else {
            var timeSinceStalled = (Date.now() - this._opts._lastStalled);
            if (timeSinceStalled > 1) {
              this._opts._hasBufferingClass = true;
              this._$bufferingobservers.addClass("buffering");
              return;
            }
          }
        } else {
          this._opts._lastStalled = null;
        }
      case "play":
      case "pause":
      case "finish":
        if (this._opts._hasBufferingClass) {
          this._opts._hasBufferingClass = false;
          this._$bufferingobservers.removeClass("buffering");
        }
        this._opts._seconds = this.el.currentTime;
    }
  },

  _stop_buffering: function(options) {
    if (!this._$bufferingobserver) return;
    this._$bufferingobservers.off("click", this.handleInputEvent);
    this._$bufferingobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_buffering();
    destroy();
  })

});
// Closed-captions renderer
function Lang(options, callback) {
  extend(this, options);
  this._fetch(callback);
}
extend(Lang, {
  _cueid: 0
});
extend(Lang[p], {

  _cues: null,
  _styles: null,
  _loaded: false,
  _errored: false,

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
          id: ++Lang._cueid,
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

    var breakpoint = $.indexOfRegex(line, /-->/);
    if (breakpoint === -1) throw "Time declaration error, no -->";
    var start = line.slice(0, breakpoint).trim();
    line = line.slice(breakpoint);

    var startpoint = $.indexOfRegex(line, /[0-9]+/);
    if (startpoint === -1) throw "Time declaration error, no end time";
    line = line.slice(startpoint);

    var breakpoint = $.indexOfRegex(line, /[ ]{1}/);
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

});

extend(Video, {
  Lang: Lang
});

extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      captions: false
    });
    defaults();
  }),

  initialize: chain(Video[p].initialize, function(initialize) {
    if (!this._opts.captions) return initialize();

    this.captions("start", this._opts);
    initialize();
  }),

  captions: function(command, options) {

    switch (command) {
      case "start":
        this._start_captions(options);
        break;
      case "stop":
        this._stop_captions(options);
        break;
    }
    return this;

  },

  captionLanguages: null,
  _captionDefaultLang: null,
  _start_captions: function(options) {

    this._opts.captions = true;

    this._get_langs(this._on_captions_loaded.bind(this));
    this._$captionobservers =  $("[for='"+this.$el.attr("id")+"'][kind=captions],[for='"+this.$el.attr("id")+"'][kind=subtitles]");
    this._$captionobservers.on("click", this.handleInputEvent);

    options = extend({}, this._opts, options, {captions: true});
    this.addEventsHandler(this._render_captions, options);

    //TODO: add caption styling to document
  },

  _on_captions_loaded: function(langs) {
    this.captionLanguages = langs;
    this._captionDefaultLang = null;
    for (var k in langs) {
      if (this.captionLanguages[k].default) {
        this._captionDefaultLang = this.captionLanguages[k];
        break;
      }
    }
  },

  _render_captions: function(event, options) {
    
    // skip realtime triggers, captions never need to be realtime
    if (event.realtime) return;
    if (!this.captionLanguages) return;

    var ct = this.el.currentTime;

    var liveLangElements = {}
    var liveLangsCount = 0;
    this._$captionobservers.each(function(index, el) {
      var $el = $(el);
      var lang = $el.attr("srclang")
      if (!this.captionLanguages[lang]) return;
      if (!liveLangElements[lang]) {
        liveLangElements[lang] = [];
        liveLangsCount++;
      }
      liveLangElements[lang].push($el);
    }.bind(this));

    if (!liveLangsCount) return;

    for (var lang in liveLangElements) {

      var $el = $(liveLangElements[lang]);
      var captionLang = this.captionLanguages[lang];

      var newLiveCues = captionLang._cues.filter(function(cue) {
        return (cue.start <= ct && cue.end >= ct && !cue.live);
      });

      var toRemove = captionLang._cues.filter(function(cue) {
        return (cue.start > ct || cue.end < ct) && cue.live;
      });

      if (newLiveCues.length === 0 && toRemove.length === 0) return;

      // Render changes to dom
      // TODO make this accessible proper
      $el.each(function(index, el) {
        var $el = $(el);
        newLiveCues.forEach(function(cue) {
          cue.live = true;
          $el.append($('<span>', this._render_cue_placement({
            id: cue.id,
            lang: lang,
            'class': 'cue'
          }, cue)).append($('<span>', {
            'class': 'cue-text',
            html: cue.lines.join('<br>')
          })));
        }.bind(this));
        toRemove.forEach(function(cue) {
          cue.live = false;
          $el.find("#"+cue.id+".cue").remove();
        });
        $el.find(".cue:not([lang="+lang+"])").remove();
      }.bind(this));
    }

  },

  _render_cue_placement: function(htmlObj, cue) {

    var classes = htmlObj['class'].split(" ");
    classes.push(cue.placement.vertical);
    var style = "";

    var placement = cue.placement;
    switch (placement.vertical) {
      case "horizontal":
        switch (placement.align) {
          case "start": classes.push("align-left"); break;
          case "middle": classes.push("align-center"); break;
          case "end": classes.push("align-right"); break;
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
          case "start": classes.push("align-top"); break;
          case "middle": classes.push("align-middle"); break;
          case "end": classes.push("align-bottom"); break;
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
          case "start": classes.push("align-top"); break;
          case "middle": classes.push("align-middle"); break;
          case "end": classes.push("align-bottom"); break;
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

  _stop_captions: function(options) {
    this._opts.captions = false;
    
    this._$captionobservers.html("");

    this._captionlang = null;
    this._$captionobservers = null;

    options = extend({}, this._opts, options, {captions: false});
    this.removeEventsHandler(this._render_captions);
  },

  _get_langs: function(callback) {

    if (typeof callback !== "function") {
      callback = null;
    }

    if (this.captionLanguages) {
      return callback(this.captionLanguages);
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

     this.$el.find("track[type='text/vtt']").each(function(i, el) {
      var $el = $(el);
      var lang = $el.attr("srclang");
      var src = $el.attr("src");
      if (lang && src) {
        if (langs[lang]) {
          return;
        }
        counted++;
        langs[lang] = new Video.Lang({
          default: ($el.attr("default")!==undefined),
          lang: lang,
          src: src,
          label: $el.attr("label")
        }, onLoaded);
      }
    }).remove();

    return langs;

  },

  destroy: chain(Video[p].destroy, function(destroy) {
    
    if (this._$captionobservers) {
      this._$captionobservers.off("click", this.handleInputEvent);
      this._stop_captions();
    }
    
    destroy();
  })

});
 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      poster: this.$el.attr("poster") || false
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    if (this._opts.poster) {
      this.poster("start");
    }
    initialize();

  }),

  poster: function(command, options) {
    switch (command) {
      case "start":
        this._start_poster(options);
        break;
      case "stop":
        this._stop_poster(options);
        break;
    }
    return this;
  },

  _start_poster: function(options) {
    this._$posterobservers =  $("[for='"+this.$el.attr("id")+"'][kind=poster]");

    this._$posterobservers.each(function(index, item) {
      var $item = $(item);
      $item.append($("<img>", {
        class: "jqv-poster-image",
        src: this._opts.poster
      }));
    }.bind(this));

    options = extend({}, this._opts, options, {poster: true});
    this.addEventsHandler(this._render_poster, options);

  },

  _render_poster: function(event, options) {
    switch (event.type) {
      case "play":
        this._$posterobservers.removeClass("playing paused");
        this._$posterobservers.addClass("playing");
        break;
      case "pause":
      case "finish":
        this._$posterobservers.removeClass("playing paused");
        this._$posterobservers.addClass("paused");
        break;
    }

    var isAtStart = this.el.currentTime <= 0.1;
    var isAtEnd = this.el.currentTime  >= this.el.duration -0.1;
    var isInMiddle = (!isAtStart && !isAtEnd);
    var state = isAtStart ? "at-start" : isAtEnd ? "at-end" : "in-middle";
    if (this._opts._posterState !== state) {
      this._$posterobservers[isAtStart?'addClass':'removeClass']("at-start");
      this._$posterobservers[isAtEnd?'addClass':'removeClass']("at-end");
      this._$posterobservers[!isAtStart&&!isAtEnd?'addClass':'removeClass']("in-middle");
      this._opts._posterState = state;
    }

  },

  _stop_poster: function(options) {
    if (!this._$posterobservers) return;
    this._$posterobservers.find(".jqv-poster-image").remove();
    this._$posterobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_poster();
    destroy();
  })

});
var raf = function(cb, timeslice) {
  //return setTimeout(cb, timeslice);
  return window.requestAnimationFrame(cb);
};

// realtime timeupdates
// realtime global functions
extend(Video, {

  _realTimers: [],
  _lastRealTimeEvent: 0,
  _minRealTimeInterval: 62.5,

  _addRealtime: function(video) {
    if (video._opts._realtime) return;
    video._opts._realtime = true;
    Video._realTimers.push(video);
    raf(Video._processRealtimeEvents);
  },

  _processRealtimeEvents: function() {
    if (!Video._realTimers.length) return;
    
    var now = Date.now();
    if (now - Video._lastRealTimeEvent < Video._minRealTimeInterval) return raf(Video._processRealtimeEvents, Video._minRealTimeInterval);
    Video._lastRealTimeEvent = now;

    Video._realTimers.forEach(function(video) {
      if (video.el.paused && !video._opts._inpreplay) return;
      video.$el.trigger("timeupdate", {
        realtime: true
      });
    });

    raf(Video._processRealtimeEvents);
  },

  _removeRealtime: function(video) {
    if (!video._opts._realtime) return;
    video._opts._realtime = false;
    for (var i = Video._realTimers.length -1, l = -1; i > l; i--) {
      var item = Video._realTimers[i];
      if (item !== video) continue;
      Video._realTimers.splice(i,1);
      return;
    }
  }

});

// realtime instance functions
extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      realtime: true
    });
    defaults();
  }),

  initialize: chain(Video[p].initialize, function(initialize) {
    if (!this._opts.realtime) return initialize();
    this.realtime("start");
    initialize();
  }),

  realtime: function(command) {
    switch (command) {
      case "start":
        this._start_realtime();
        break;
      case "stop":
        this._stop_realtime();
        break;
    }
    return this;
  },

  _start_realtime: function() {
    this.addEventsHandler(this._realtime_events);
    if (this.el.paused) return;
    Video._addRealtime(this);
  },

  _realtime_events: function(event, options) {
    var isAtEnd = (Math.abs(Math.floor(this.el.currentTime*10) - Math.floor(this.el.duration*10)) <= 1);
    switch (event.type) {
      case "preplay":
        this._opts._hasfinished = false;
        if (!this.el.loop && isAtEnd) {
          this.el.currentTime = 0;
        }
        this._opts._inpreplay = true;
        Video._addRealtime(this);
        break;
      case "play":
        this._opts._hasfinished = false;
        Video._addRealtime(this);
        this._opts._inpreplay = false;
        break;
      case "finish":
        this._opts._hasfinished = true;
      case "pause": 
        Video._removeRealtime(this);
        this._opts._inpreplay = false;
        if (!this.el.loop && !this._opts._hasfinished && isAtEnd) {
          setTimeout(function() {
            if (!this.$el) return;
            if (this._opts._hasfinished) return;
            this._opts._hasfinished = true;
            this.$el.trigger("finish");
          }.bind(this), 100);
        }
        break;
      case "timeupdate":
        this._opts._hasfinished = false;
        this._opts._inpreplay = false;
        if (!this.el.loop && !this.el.paused && isAtEnd) {
          Video._removeRealtime(this);
          this.el.currentTime = this.el.duration;
          this.el.pause();
          setTimeout(function() {
            if (!this.$el) return;
            if (this._opts._hasfinished) return;
            this._opts._hasfinished = true;
            this.$el.trigger("finish");
          }.bind(this), 100);
        }
        break;
    }
  },


  _stop_realtime: function() {
    this.removeEventsHandler(this._realtime_events);
    Video._removeRealtime(this);
    setTimeout(function() {
      if (!this.el) return;
      this.$el.trigger("timeupdate");
    }.bind(this), 100);
  },

  destroy: chain(Video[p].destroy, function(destroy) {
    this._stop_realtime();
    destroy();
  })

});
 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      scrub: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    this._on_scrub_click = this._on_scrub_click.bind(this);
    this._on_scrub_inner_down = this._on_scrub_inner_down.bind(this);
    this._on_scrub_inner_move = this._on_scrub_inner_move.bind(this);
    this._on_scrub_inner_up = this._on_scrub_inner_up.bind(this);

    if (this._opts.scrub) {
      this.scrub("start");
    }
    initialize();

  }),

  scrub: function(command, options) {
    switch (command) {
      case "start":
        this._start_scrub(options);
        break;
      case "stop":
        this._stop_scrub(options);
        break;
    }
    return this;
  },

  _start_scrub: function(options) {
    this._$scrubobservers =  $("[for='"+this.$el.attr("id")+"'][kind=controls] .scrub");
    if (!this._$scrubobservers.length) {
      this._$scrubobservers = null;
      return;
    }
    this._$scrubobservers.on("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").on("mousedown touchstart", this._on_scrub_inner_down);
    this._$scrubobservers.find(".rail-inner, .rail-back").on("mousemove touchmove", this._on_scrub_inner_move);
    $(document).on("mouseup touchend", this._on_scrub_inner_up);
    options = extend({}, this._opts, options, {scrub: true});
    this.addEventsHandler(this._render_scrub, options);
  },

  _render_scrub: function(event, options) {
    switch (event.type) {
      case "timeupdate":
        this._$scrubobservers.find(".rail-inner").css({
          width: ((100 / this.el.duration) * this.el.currentTime) + "%"
        })
        break;
    }
  },

  _on_scrub_click: function(event) {

  },

  _on_scrub_inner_down: function(event) {
    this._opts._in_scrub_was_playing = !this.el.paused;
    this.$el.pause();
    this._opts._in_scrub_click = true;
    this._move_time_to_event(event);
  },

  _on_scrub_inner_move: function(event) {
    if (!this._opts._in_scrub_click) return;
    this._move_time_to_event(event)
  },

  _on_scrub_inner_up: function(event) {
    if (!this._opts._in_scrub_click) return;
    this._move_time_to_event(event)
    if (this._opts._in_scrub_was_playing) {
      this.$el.play();
    }
    this._opts._in_scrub_click = false;
  },

  _move_time_to_event: function(event) {
    if (isNaN(this.el.duration)) {
      this.el.load();
      return;
    }
    var width = this._$scrubobservers.find(".rail-back").width();
    var left = this._$scrubobservers.find(".rail-back")[0].getBoundingClientRect().left;
    var offsetX;
    switch (event.type) {
      case "touchstart": case "touchend": case "touchmove":
        if (!event || !event.originalEvent || !event.originalEvent.touches || !event.originalEvent.touches.length) return;
        offsetX = event.originalEvent.touches[0].clientX - left;
        break;
      default:
        offsetX = event.clientX - left;
    }

    try {
      this.el.currentTime = (offsetX/width * this.el.duration);
    } catch(e) {
      //try {
        this.$el.play();
        this.el.currentTime = (offsetX/width * this.el.duration);
        this.$el.pause();
      //
    }
  },

  _stop_scrub: function(options) {
    if (!this._$scrubobservers) return;
    this._$scrubobservers.off("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").off("mousedown touchstart", this._on_scrub_inner_down);
    this._$scrubobservers.find(".rail-inner, .rail-back").off("mousemove touchmove", this._on_scrub_inner_move);
    $(document).off("mouseup touchend", this._on_scrub_inner_up);
    this._$scrubobservers = null;
    this.removeEventsHandler(this._render_scrub, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_scrub();
    destroy();
  })

});})(jQuery);