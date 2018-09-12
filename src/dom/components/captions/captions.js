var CaptionsComponent = Media.Component.extend({

  media: null,
  languages: null,
  defaultLang: null,

  constructor: function CaptionsComponent(media) {
    this.media = media;
    this.getLangs(this.onCaptionsLoaded.bind(this));
    this.listenTo(this.media, {
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

  lastCall: 0,
  onTimeUpdate: function(event) {
    var now = Date.now();
    if (this.lastCall > now - 66) return;
    this.lastCall = now;

    if (!this.languages) return;

    var ct = this.media.el.currentTime;

    var liveLangElements = {}
    var liveLangsCount = 0;

    var groups = Media.dom.fetchElements(this.media);
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

      var newLiveCues = captionLang.cues.filter(function(cue) {
        return (cue.start <= ct && cue.end >= ct && !cue.live);
      });

      var toRemove = captionLang.cues.filter(function(cue) {
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

    var tracks = this.media.el.querySelectorAll("track[type='text/vtt']");
    toArray(tracks).forEach(function(el) {
      var lang = el.getAttribute("srclang");
      var src = el.getAttribute("src");
      if (lang && src) {
        if (langs[lang]) {
          return;
        }
        counted++;
        langs[lang] = new Media.CaptionsComponentLang({
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

Media.CaptionsComponent = CaptionsComponent;
Media.dom.components.add("CaptionsComponent");
