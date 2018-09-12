var CanvasOutputStream = Media.OutputStream.extend({

  canvas: null,
  context: null,
  width: 0,
  height: 0,

  constructor: function CanvasOutputStream(canvas) {
    Media.OutputStream.prototype.constructor.apply(this, arguments);
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d', { alpha: true });
  },

  next: function(data) {
    if (this.width !== data.width || this.height !== data.height) {
      this.canvas.width = data.width;
      this.canvas.height = data.height;
      this.width = data.width;
      this.height = data.height;
    }
    this.context.drawImage(data.canvas, 0, 0, this.width, this.height);
  }

});

Media.CanvasOutputStream = CanvasOutputStream;
