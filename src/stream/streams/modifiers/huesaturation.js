var HueSaturationModifyStream = Media.Stream.extend({

  options: null,

  constructor: function HueSaturationModifyStream(options) {
    this.webgl = new Media.WebGL();
    this.texture = this.webgl.createTexture();
    this.options = defaults(options, {
      hue: 0,
      saturation: 0
    });
  },

  next: function(data) {
    this.webgl.setSize(data.width, data.height);
    this.texture.loadContentsOf(data.canvas);
    this.webgl.runShader("HueSaturationShader", {
        hue: this.options.hue,
        saturation: this.options.saturation
      }, [
        {
          name: "texture",
          texture: this.texture
        }
      ]);
    this.frame.updateFromElement(this.webgl.canvas);
    this.push(this.frame);
  },

  hue$get: function() {
    return this.options.hue;
  },

  hue$set: function(value) {
    this.options.hue = value;
  },

  saturation$get: function() {
    return this.options.saturation;
  },

  saturation$set: function(value) {
    this.options.saturation = value;
  }

});

Media.HueSaturationModifyStream = HueSaturationModifyStream;
