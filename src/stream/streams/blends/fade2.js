var Fade2BlendStream = Media.BlendStream.extend({

  webgl: null,
  options: null,
  frame: null,
  firstTexture: null,
  secondTexture: null,
  width: 0,
  height: 0,

  constructor: function Fade2BlendStream(options) {
    this.webgl = new Media.WebGL();
    this.options = defaults(options, {
      amount: 0,
    });
    this.firstTexture = this.webgl.createTexture();
    this.secondTexture = this.webgl.createTexture();
    if (options instanceof Media.LiveOptions) {
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
    this.webgl.runShader("Fade2Shader", {
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

Media.Fade2BlendStream = Fade2BlendStream;



