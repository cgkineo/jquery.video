var VideoInput = Video.Stream.extend({

  _from: null,
  _canvas: null,
  _context: null,
  _size: null,

  constructor: function VideoInput(video) {
    if (video instanceof Video) this._from = video;
    if (video instanceof HTMLMediaElement) this._from = video.player;
    this._canvas = document.createElement('canvas');
    this._context = this._canvas.getContext('2d');
    this._capture = this._capture.bind(this);
    this._resize();
    this.listenTo(this._from, {
      "resize": this._resize,
      "timeupdate": this._capture
    });
  },

  _resize: function() {
    this._size = this._getSize();
    this._canvas.width = this._size.width;
    this._canvas.height = this._size.height;
    this._capture();
  },

  _getSize: function() {
    return {
      height: this._from.el.clientHeight,
      width: this._from.el.clientWidth
    };
  },

  _capture: function() {
    this._context.drawImage(this._from.el, 0, 0, this._size.width, this._size.height);
    if (this._isStart) return this.push(this._context);
    this._isWaiting = true;
  },

  _start: function() {
    this._isStart = true;
    if (!this._isWaiting) return;
    this.push(this._context);
  }

});

Video.Stream.VideoInput = VideoInput;
