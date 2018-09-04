var CanvasOutput = Video.Stream.extend({

  _canvas: null,
  _context: null,

  constructor: function CanvasOutput(canvas) {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d');
  },

  _next: function(context, callback) {
  	this._canvas.width = context.canvas.width;
  	this._canvas.height = context.canvas.height;
    this._context.drawImage(context.canvas, 0,0);
  }

});

Video.Stream.CanvasOutput = CanvasOutput;
