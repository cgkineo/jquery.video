var BrightnessContrastModifyStream = Media.Stream.extend({

  options: null,

  constructor: function BrightnessContrastModifyStream(options) {
    this.webgl = new Media.WebGL();
    this.texture = this.webgl.createTexture();
    this.options = defaults(options, {
      brightness: 0,
      contrast: 0
    });
  },

  next: function(data) {
    this.webgl.setSize(data.width, data.height);
    this.texture.loadContentsOf(data.canvas);
    this.webgl.runShader("BrightnessContrastShader", {
        brightness: this.options.brightness,
        contrast: this.options.contrast
      }, [
        {
          name: "texture",
          texture: this.texture
        }
      ]);
    this.frame.updateFromElement(this.webgl.canvas);
    this.push(this.frame);
  },

  brightness$get: function() {
    return this.options.brightness;
  },

  brightness$set: function(value) {
    this.options.brightness = value;
  },

  contrast$get: function() {
    return this.options.contrast;
  },

  contrast$set: function(value) {
    this.options.contrast = value;
  }

});

Media.BrightnessContrastModifyStream = BrightnessContrastModifyStream;
