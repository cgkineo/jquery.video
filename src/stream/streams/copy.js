var CopyStream = Video.Stream.extend({

  constructor: function CopyStream() {},

  _frame: null,
  _size: null,

  next: function(data, fromStream) {
    if (!this._size || this._size.time !== data.size.time) {
      if (!this._frame) {
        this._frame = new Video.Frame(data.size, data.canvas);
      } else {
        this._frame.setSize(data.size);
      }
      this._size = data.size;
    }
    this._frame.update();
    this.push(this._frame);
  }

});

Video.CopyStream = CopyStream;
