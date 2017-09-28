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
    this._toggle_play_pause = this._toggle_play_pause.bind(this);

    this._get_langs(this._on_captions_loaded.bind(this));
    this._$captionobservers =  $("[for='"+this.$el.attr("id")+"'][kind=captions],[for='"+this.$el.attr("id")+"'][kind=subtitles]");
    this._$captionobservers.on("click", this._toggle_play_pause);

    options = extend({}, this._opts, options, {captions: true});
    this.addEventsHandler(this._render_captions, options);

    //TODO: add caption styling to document
  },

  _toggle_play_pause: function() {
    if (this.$el[0].paused) {
      if (this.$el[0].play) this.$el[0].play();
    } else {
      if (this.$el[0].pause) this.$el[0].pause();
    }
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
    this._$captionobservers.off("click", this._toggle_play_pause);
    this._stop_captions();
    destroy();
  })

});