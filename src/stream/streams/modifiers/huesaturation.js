var HueSaturationModifyStream = Video.Stream.extend({

  _options: null,

  constructor: function HueSaturationModifyStream(options) {
    this._webgl = new Video.WebGL();
    this._texture = this._webgl.createTexture();
    this._options = defaults(options, {
      hue: 0,
      saturation: 0
    });
  },

  next: function(data) {
    this._webgl.setSize(data.width, data.height);
    this._texture.loadContentsOf(data.canvas);
    this._webgl.runShader("HueSaturationShader", {
        hue: this._options.hue,
        saturation: this._options.saturation
      }, [
        {
          name: "texture",
          texture: this._texture
        }
      ]);
    this.frame.updateFromElement(this._webgl.canvas);
    this.push(this.frame);
  },

  hue$get: function() {
    return this._options.hue;
  },

  hue$set: function(value) {
    this._options.hue = value;
  },

  saturation$get: function() {
    return this._options.saturation;
  },

  saturation$set: function(value) {
    this._options.saturation = value;
  }

});

Video.HueSaturationModifyStream = HueSaturationModifyStream;
