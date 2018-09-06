var CanvasOutputStream = Video.Stream.extend({

  _canvas: null,
  _context: null,

  constructor: function CanvasOutputStream(canvas) {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d', { alpha: true });
  },

  next: function(data) {
    if (!this._size || this._size.time !== data.size.time) {
    	this._canvas.width = data.size.width;
    	this._canvas.height = data.size.height;
      this._size = data.size;
    }
    this._context.drawImage(data.canvas, 0, 0, this._size.width, this._size.height);
  }

});

Video.CanvasOutputStream = CanvasOutputStream;
