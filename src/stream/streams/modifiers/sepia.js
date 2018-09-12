var SepiaModifyStream = Media.Stream.extend({

  amount: 1,

  constructor: function SepiaModifyStream() {
    this.webgl = new Media.WebGL();
    this.texture = this.webgl.createTexture();
  },

  next: function(data) {
    this.webgl.setSize(data.width, data.height);
    this.texture.loadContentsOf(data.canvas);
    this.webgl.runShader("SepiaShader", {
        amount: this.amount
      }, [
        {
          name: "texture",
          texture: this.texture
        }
      ]);
    this.frame.updateFromElement(this.webgl.canvas);
    this.push(data);
  },

  amount$get: function() {
    return this.amount;
  },

  amount$set: function(value) {
    this.amount = value;
  }

});

Media.SepiaModifyStream = SepiaModifyStream;
