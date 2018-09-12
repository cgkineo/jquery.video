var Displacement2BlendStream = Media.BlendStream.extend({

  webgl: null,
  options: null,
  displacementImage: null,
  firstTexture: null,
  secondTexture: null,
  displacementTexture: null,
  width: 0,
  height: 0,

  constructor: function Displacement2BlendStream(options) {
    this.webgl = new Media.WebGL();
    this.options = defaults(options, {
      amount: 0.5,
      src: "./displacement.jpg"
    });
    this.displacementImage = new Image();
    this.displacementImage.addEventListener("load", function() {
      this.displacementTexture.loadContentsOf(this.displacementImage);
    }.bind(this));
    this.displacementImage.src = this.options.src;
    this.firstTexture = this.webgl.createTexture();
    this.secondTexture = this.webgl.createTexture();
    this.displacementTexture = this.webgl.createTexture();
    if (this.options instanceof Media.LiveOptions) {
      this.listenTo(options, "changed", this.changed);
    }
  },

  next: function() {
    var sources = this.sources;
    var datas = this.datas;
    this.width = datas[0].width;
    this.height = datas[0].height;
    this.firstTexture.loadContentsOf(datas[0].canvas);
    this.secondTexture.loadContentsOf(datas[1].canvas);

    this.webgl.setSize(this.width, this.height);
    this.webgl.runShader("Displacement2Shader", {
        width: this.width,
        height: this.height,
        amount: this.options.amount
      }, [
        {
          name: "firstTexture",
          texture: this.firstTexture
        },
        {
          name: "secondTexture",
          texture: this.secondTexture
        },
        {
          name: "displacement",
          texture: this.displacementTexture
        }
      ]);

    this.frame.updateFromElement(this.webgl.canvas);
    this.push(this.frame);
  },

  amount$set: function(value) {
    this.options.amount = value;
    this.setDirty();
  },

  amount$get: function() {
    return this.options.amount;
  }

});

Media.Displacement2BlendStream = Displacement2BlendStream;



