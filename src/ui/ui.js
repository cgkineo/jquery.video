/*
 Creates a user interface for a video.
 */
var UI = Class.extend({

  canvasTemplate: '<canvas class="output" for="${id}" kind="output size" size="900px auto" ratio="16:9"></canvas>',
  mainTemplate: '\
    <div class="video-container">\
      <div class="captions" for="${id}" kind="captions" srclang="en"></div>\
      <div class="poster" for="${id}" kind="poster"></div>\
      <div class="waiting" for="${id}" kind="waiting"></div>\
      <div class="controls">\
          <button class="big-play" for="${id}" kind="playpausetoggle">Play</button>\
          <div class="scrub" for="${id}" kind="state">\
              <button class="little-playpause" for="${id}" kind="playpausetoggle">Play</button>\
              <div class="railduration" for="${id}" kind="railduration">\
                  <div class="railback">\
                  </div>\
                  <div class="railbuffered" for="${id}" kind="railbuffered">\
                  </div>\
                  <div class="railcurrent" for="${id}" kind="railcurrent">\
                  </div>\
              </div>\
              <button class="little-mute" for="${id}" kind="mutetoggle">Mute</button>\
              <button class="little-captions" for="${id}" kind="captionstoggle">Captions</button>\
              <button class="little-fullscreen" for="${id}" kind="fullscreentoggle">Fullscreen</button>\
          </div>\
      </div>\
    </div>\
  ',

  options: {
    replaceWith: true,
    playsInline: true,
    canvas: false,
    poster: true,
    waiting: true,
    controls: true,
    skip: true,
    bigPlayPause: true,
    scrub: [
      "playpause",
      "rail",
      "captions",
      "fullscreen"
    ]
  },

  selector: null,
  el: null,
  source: null,

  constructor: function UI(selector, options) {
    this.selector = selector;
    this.options = defaults(options, this.options);
    this.source = elements(selector)[0];
    this._ensureElement();
    this._processOptions();
    Video.dom && Video.dom.refreshElements();
  },

  _ensureElement: function() {
    this.el = this._getRenderedTemplate('mainTemplate');
  },

  _getRenderedTemplate: function(name) {
    var attributes = {
      id: this.source.id
    };
    var template = this[name];
    for (var k in attributes) {
      var regex = new RegExp("\\$\\{"+k+"\\}", "gi");
      template = template.replace(regex, attributes[k]);
    }
    var element = document.createElement('div');
    element.innerHTML = template;
    return element.children[0];
  },

  _processOptions: function() {
    if (this.options.playsInline) {
      this.source.setAttribute("playsinline", true);
    }
    if (this.options.replaceWith) {
      replaceWith(this.source, this.el);
      prependElement(this.el, this.source);
    }
    if (this.options.canvas) {
      this.source.style.display = "none";
      var canvas = this._getRenderedTemplate('canvasTemplate');
      prependElement(this.el, canvas);
    }
  }

});

Video.UI = UI;
