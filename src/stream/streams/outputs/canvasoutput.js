var CanvasOutputStream = Video.Stream.extend({

  _canvas: null,
  _context: null,
  _width: 0,
  _height: 0,

  constructor: function CanvasOutputStream(canvas) {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d', { alpha: true });
  },

  next: function(data) {
    if (this._width !== data.width || this._height !== data.height) {
      this._canvas.width = data.width;
      this._canvas.height = data.height;
      this._width = data.width;
      this._height = data.height;
    }
    this._context.drawImage(data.canvas, 0, 0, this._width, this._height);
  }

});

Video.CanvasOutputStream = CanvasOutputStream;
