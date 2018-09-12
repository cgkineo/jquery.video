/*
 Creates a user interface for a media.
 */
var UI = Class.extend({

  templates: {
    main: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    canvas: '<canvas class="${domclassprefix}${name}" for="${id}" kind="${kind}" size="900px auto" ratio="16:9"></canvas>',
    captions: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}" srclang="en"></div>',
    poster: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    waiting: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    controls: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    bigplaypause: '<button class="${domclassprefix}${name}" for="${id}" kind="${kind}">Play</button>',
    skip: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    scrub: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    littleplaypause: '<button class="${domclassprefix}${name}" for="${id}" kind="${kind}">Play</button>',
    railduration: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    railback: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    railbuffered: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}"></div>',
    railcurrent: '<div class="${domclassprefix}${name}" for="${id}" kind="${kind}">',
    littlemute: '<button class="${domclassprefix}${name}" for="${id}" kind="${kind}">Mute</button>',
    littlecaptions: '<button class="${domclassprefix}${name}" for="${id}" kind="${kind}">Captions</button>',
    littlefullscreen: '<button class="${domclassprefix}${name}" for="${id}" kind="${kind}">Fullscreen</button>',
  },

  defaults: {
    uienabled: true,
    uireplace: true,
    mediaplaysinline: true,
    domclassprefix: "media--",
    uilayout: {
      main: { kind: "fullscreen" },
      canvas: { parent: "main", order: 1, enabled: false, kind: "output" },
      captions: { parent: "main", order: 2, enabled: true, kind: "captions captionsstate" },
      poster: { parent: "main", order: 3, enabled: true, kind: "poster" },
      waiting: { parent: "main", order: 4, enabled: true, kind: "waiting" },
      controls: { parent: "main", order: 5, enabled: true, kind: "skipcontrol" },
      skip: { parent: "controls", order: 1, enabled: true, kind: "skipstate" },
      bigplaypause: { parent: "controls", order: 2, enabled: true, kind: "playpausetoggle playpausestate" },
      scrub: { parent: "controls", order: 3, enabled: true, kind: "" },
      littleplaypause: { parent: "scrub", order: 1, enabled: true, kind: "playpausetoggle playpausestate" },
      railduration: { parent: "scrub", order: 2, enabled: true, kind: "railduration" },
      railback: { parent: "railduration", order: 1, enabled: true, kind: "" },
      railbuffered: { parent: "railduration", order: 2, enabled: true, kind: "railbuffered" },
      railcurrent: { parent: "railduration", order: 3, enabled: true, kind: "railcurrent" },
      littlemute: { parent: "scrub", order: 3, enabled: true, kind: "mute mutestate" },
      littlecaptions: { parent: "scrub", order: 4, enabled: true, kind: "captionstoggle captionsstate" },
      littlefullscreen: { parent: "scrub", order: 5, enabled: true, kind: "fullscreentoggle fullscreenstate" }
    }
  },

  selector: null,
  el: null,
  source: null,

  constructor: function UI(selector, options) {
    if (!options.uienabled) return;
    this.selector = selector;
    this.options = defaults(options, this.defaults);
    this.source = elements(selector)[0];
    this.ensureElement();
    this.processOptions();
  },

  ensureElement: function() {
    this.el = this.getRenderedTemplate('main', extend({
      name: 'main'
    }, this.options.uilayout.main));
    this.constructUserInterface();
  },

  constructUserInterface: function() {
    var configs = [];
    for (var k in this.options.uilayout) {
      var item = this.options.uilayout[k];
      if (k === "main") continue;
      if (!item.enabled) continue;
      item.name = k;
      configs.push(item);
    }
    configs.sort(function(a,b) {
      return b.parent.localeCompare(a.parent) ||
        b.order - a.order;
    });
    var ticks = 0;
    var containers = { main: this.el };
    var i = -1;
    do {
      if (i < 0) { ticks++; i = configs.length - 1; }
      var item = configs[i];
      if (item.parent && !containers[item.parent])
        { i--; continue; }
      var el = this.getRenderedTemplate(item.name, item);
      if (!el) { configs.splice(i, 1); i--; continue;}
      containers[item.name] = el;
      containers[item.parent].appendChild(el);
      configs.splice(i, 1);
      i--;
    } while (configs.length && ticks < 10)
  },

  getRenderedTemplate: function(name, attributes) {
    var attributes = defaults(extend({}, attributes), this.options);
    var template = this.templates[name];
    if (!template) return;
    template = replace(template, attributes);
    var element = document.createElement('div');
    element.innerHTML = template;
    return element.children[0];
  },

  processOptions: function() {
    if (this.options.mediaplaysinline && this.source.tagName === "VIDEO") {
      this.source.setAttribute("playsinline", true);
    }
    if (this.options.uireplace) {
      replaceWith(this.source, this.el);
      prependElement(this.el, this.source);
    }
    if (this.options.uilayout.canvas.enabled) {
      this.source.style.display = "none";
    }
  }

});

Media.UI = UI;
