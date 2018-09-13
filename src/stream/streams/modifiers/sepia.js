Media.Stream.SepiaModify = Media.Stream.extend({

  options: null,

  constructor: function SepiaModify(options) {
    Media.Stream.prototype.constructor.call(this);
    this.webgl = new Media.WebGL();
    this.texture = this.webgl.createTexture();
    this.options = defaults(options, {
      amount: 1
    });
  },

  next: function(data) {
    this.webgl.setSize(data.width, data.height);
    this.texture.loadContentsOf(data.canvas);
    this.webgl.runShader("SepiaShader", {
        amount: this.options.amount
      }, [
        {
          name: "texture",
          texture: this.texture
        }
      ]);
    this.frame.updateFromElement(this.webgl.canvas);
    this.push(data);
  },

  amount$get$enum: function() {
    return this.options.amount;
  },

  amount$set$enum: function(value) {
    this.options.amount = value;
  }

});
