var Frame = Class.extend({

  source: null,
  size: null,
  webgl: null,
  canvas: null,
  context: null,
  webglTexture: null,

  constructor: function Frame(size, source) {
    this.source = source;
    this.webgl = new WebGL();
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.setSize(size);
  },

  setSize: function(size) {
    this.size = size;
    this.canvas.height = size.height;
    this.canvas.width = size.width;
  },

  update: function() {
    this.context.drawImage(this.source, 0, 0, this.size.width, this.size.height);
    if (!this.webglTexture) {
      this.webglTexture = this.webgl.texture(this.canvas);
    } else {
      this.webglTexture.loadContentsOf(this.canvas);
    }
  }

});

Video.Frame = Frame;
