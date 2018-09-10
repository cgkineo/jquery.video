var Displacement2BlendStream = Video.BlendStream.extend({

  _webgl: null,
  _options: null,
  _displacementImage: null,
  _firstTexture: null,
  _secondTexture: null,
  _displacementTexture: null,
  _width: 0,
  _height: 0,

  constructor: function Displacement2BlendStream(options) {
    this._webgl = new Video.WebGL();
    this._options = defaults(options, {
      amount: 0.5,
      src: "./displacement.jpg"
    });
    this._displacementImage = new Image();
    this._displacementImage.addEventListener("load", function() {
      this._displacementTexture.loadContentsOf(this._displacementImage);
    }.bind(this));
    this._displacementImage.src = this._options.src;
    this._firstTexture = this._webgl.createTexture();
    this._secondTexture = this._webgl.createTexture();
    this._displacementTexture = this._webgl.createTexture();
    if (this._options instanceof Video.LiveOptions) {
      this.listenTo(options, "changed", this.changed);
    }
  },

  next: function() {
    var sources = this.sources;
    var datas = this.datas;
    this._width = datas[0].width;
    this._height = datas[0].height;
    this._firstTexture.loadContentsOf(datas[0].canvas);
    this._secondTexture.loadContentsOf(datas[1].canvas);

    this._webgl.setSize(this._width, this._height);
    this._webgl.runShader("Displacement2Shader", {
        width: this._width,
        height: this._height,
        amount: this._options.amount
      }, [
        {
          name: "firstTexture",
          texture: this._firstTexture
        },
        {
          name: "secondTexture",
          texture: this._secondTexture
        },
        {
          name: "displacement",
          texture: this._displacementTexture
        }
      ]);

    this.frame.updateFromElement(this._webgl.canvas);
    this.push(this.frame);
  },

  amount$set: function(value) {
    this._options.amount = value;
    this.setDirty();
  },

  amount$get: function() {
    return this._options.amount;
  }

});

Video.Displacement2BlendStream = Displacement2BlendStream;



