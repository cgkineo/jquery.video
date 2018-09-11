var SizeComponent = Video.Component.extend({

  video: null,
  size: null,

  constructor: function SizeComponent(video) {
    this.video = video;
    this.onResize = this.onResize.bind(this);
    this.listenTo(Video, {
      "uicreate": this.onUICreate
    });
    this.listenTo(video, {
      "resize": this.onResize,
      "destroyed": this.onDestroyed
    });
    this.onUICreate();
    this.attachEventListeners();
    this.onResize();
  },

  onUICreate: function() {
    var groups = Video.dom.fetchElements(this.video);
    this.size = groups.size;
  },

  attachEventListeners: function() {
    window.removeEventListener("resize", this.onResize);
    window.addEventListener("resize", this.onResize);
  },

  onResize: function() {
    if (!this.size) return;

    this.size.forEach(function(el) {
      if (!el.offsetParent) return;

      var size = this.getSize(el);
      var parent = this.getParent(el);

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

    }.bind(this));

  },

  getSize: function(el) {
    var size = el.getAttribute("size") || "none";
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
      ratio: this.getRatio(el),
      width: sizeWidth,
      height: sizeHeight
    };
  },

  getRatio: function(el) {
    var ratio = el.getAttribute("ratio") || "16:9";
    ratio = ratio.trim();
    ratio = ratio.replace(/\:/g, " ");
    ratio = ratio.replace(/\//g, " ");
    ratio = ratio.replace(/\*/g, "");

    var ratioParts = ratio.split(" ");
    var ratioWidth = parseUnit(ratioParts[0] || "16");
    var ratioheight = parseUnit(ratioParts[1] || "9");

    return ratioWidth.value / ratioheight.value;
  },

  getParent: function(el) {
    var offsetParent = el.offsetParent;
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

Video.SizeComponent = SizeComponent;
Video.dom.components.add("SizeComponent");
