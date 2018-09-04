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

Video.Lang = Lang;
