var BrightnessContrastModifyStream = Video.Stream.extend({

  _options: null,

  constructor: function BrightnessContrastModifyStream(options) {
    this._webgl = new Video.WebGL();
    this._texture = this._webgl.createTexture();
    this._options = defaults(options, {
      brightness: 0,
      contrast: 0
    });
  },

  next: function(data) {
    this._webgl.setSize(data.width, data.height);
    this._texture.loadContentsOf(data.canvas);
    this._webgl.runShader("BrightnessContrastShader", {
        brightness: this._options.brightness,
        contrast: this._options.contrast
      }, [
        {
          name: "texture",
          texture: this._texture
        }
      ]);
    this.frame.updateFromElement(this._webgl.canvas);
    this.push(this.frame);
  },

  brightness$get: function() {
    return this._options.brightness;
  },

  brightness$set: function(value) {
    this._options.brightness = value;
  },

  contrast$get: function() {
    return this._options.contrast;
  },

  contrast$set: function(value) {
    this._options.contrast = value;
  }

});

Video.BrightnessContrastModifyStream = BrightnessContrastModifyStream;
