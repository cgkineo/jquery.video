var SepiaModifyStream = Video.Stream.extend({

  _amount: 1,

  constructor: function SepiaModifyStream() {
    this._webgl = new Video.WebGL();
    this._texture = this._webgl.createTexture();
  },

  next: function(data) {
    this._webgl.setSize(data.width, data.height);
    this._texture.loadContentsOf(data.canvas);
    this._webgl.runShader("SepiaShader", {
        amount: this._amount
      }, [
        {
          name: "texture",
          texture: this._texture
        }
      ]);
    this.frame.updateFromElement(this._webgl.canvas);
    this.push(data);
  },

  amount$get: function() {
    return this._amount;
  },

  amount$set: function(value) {
    this._amount = value;
  }

});

Video.SepiaModifyStream = SepiaModifyStream;
