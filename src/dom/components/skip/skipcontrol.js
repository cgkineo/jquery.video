var SkipControlComponent = Media.Component.extend({

  floorPrecision: 10,

  media: null,
  events: null,
  interactions: null,
  skipcontrol: null,
  lastEvent: 0,
  skipped: 0,

  constructor: function SkipControlComponent(media) {
    var skipon = media.options.skipon || "touchend mouseup";
    if (!skipon) return;

    this.interactions = [];
    this.clear = debounce(this.clear.bind(this), 500);
    this.media = media;
    this.events = {};
    this.events[media.options.skipon] = this.onUp.bind(this),
    this.media = media;
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate,
      "dom:destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.skipcontrol = groups.skipcontrol;
    elements(this.skipcontrol).off(this.events).on(this.events);
  },

  onDOMDestroy: function() {
    elements(this.skipcontrol).off(this.events);
  },

  onUp: function(event) {

    var kind = event.target.getAttribute("kind") || "";
    var kinds = kind.split(" ");
    if (!includes(kinds, "skipcontrol")) return;

    event.preventDefault();

    var now = Date.now();
    var offsetParent = event.target.offsetParent;
    var parentBound = offsetParent.getBoundingClientRect();
    var x = (event.type === "touchend") ?
      event.changedTouches[0].clientX - parentBound.left :
      event.offsetX;
    var width = offsetParent.clientWidth;
    var lateralRatio = (x / width);
    var direction = (lateralRatio < 0.5) ?
      'left' :
      (lateralRatio > 0.5) ?
      'right' :
      'none';
    this.interactions.push({
      direction: direction
    });

    this.skip();
    this.clear();
  },

  skip: function() {
    var skipAmount = this.getSkipAmount();
    if (!skipAmount) return;
    if (!this.isEvenInteractions()) return;
    var skipNow = skipAmount - this.skipped;
    var currentTime = this.media.el.currentTime;
    var duration = this.media.el.duration;
    skipNow = clamp(-currentTime, skipNow, duration - currentTime);
    if (!skipNow) return;
    this.media.dispatchEvent("skip", { skipAmount: skipAmount });
    this.media.el.currentTime += skipNow
    this.skipped += skipNow;
  },

  clear: function() {
    var skipAmount = this.getSkipAmount();
    if (!skipAmount) return;
    this.interactions.length = 0;
    this.skipped = 0;
  },

  isEvenInteractions: function() {
    var halve = this.interactions.length / 2;
    return (Math.floor(halve) - halve === 0);
  },

  getSkipAmount: function() {
    var interactions = this.interactions.slice(0);
    if (interactions === undefined) return;

    if (!this.isEvenInteractions()) {
      interactions.pop();
    }

    if (!interactions.length) return;

    var unit = this.media.options.skipunit || 10;

    var rights = 0, lefts = 0;
    for (var i = 0, l = interactions.length; i < l; i++) {
      switch (interactions[i].direction) {
        case "left":
          lefts++;
          break;
        case "right":
          rights++;
          break;
      }
    }

    if (!rights && !lefts) return;
    if (rights - lefts === 0) return;

    var total = (lefts > rights) ?
      -(lefts - rights):
      rights - lefts;

    var skipAmount = (total / 2) * unit;
    return skipAmount;
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    this.media = null;
    Media.Component.prototype.destroy.call(this);
  }

});

Media.domEvents.push("skip");
Media.SkipControlComponent = SkipControlComponent;
Media.dom.components.add("SkipControlComponent");
