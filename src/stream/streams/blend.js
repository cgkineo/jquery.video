var BlendStream = Video.Stream.extend({

  _sources: null,
  _sourceDatas: null,

  constructor: function BlendStream(sources) {
    this._sources = sources;
    this._sourceDatas = new Array(this._sources.length);
    this._frame = new Video.Frame(sources[0].size);
    for (var i = 0, l = this._sources.length; i < l; i++) {
      var source = this._sources[i];
      this.listenTo(source, "data", this.next);
    }
  },

  _blenders: null,
  add: function(blender) {
    if (!this._blenders) this._blenders = [];
    this._blenders.push(blender);
  },

  _size: null,
  _lastTick: 0,
  next: function(data, fromStream) {
    if (!this._frame.size || this._frame.size.time !== data.size.time) {
      this._frame.setSize(data.size);
      this._size = data.size;
    }

    var sourceIndex = 0;
    for (var i = 0, l = this._sources.length; i < l; i++) {
      var source = this._sources[i];
      if (source === fromStream) {
        sourceIndex = i;
        break;
      }
    }

    this._sourceDatas[sourceIndex] = data;

    var isFullyPopulated = true;
    for (var i = 0, l = this._sourceDatas.length; i < l; i++) {
      if (this._sourceDatas[i]) continue;
      isFullyPopulated = false;
      break;
    }

    if (!isFullyPopulated) return;

    var bl = this._blenders && this._blenders.length;
    if (!bl) return;

    var now = Date.now();
    if (this._lastTick > now - 66) return;
    this._lastTick = now;

    // Loop through the modifiers
    for (var b = 0; b < bl; b++) {
      this._blenders[b].blend(this._frame, this._sourceDatas);
    }

    this.push(this._frame);
  }

});

Video.BlendStream = BlendStream;
Video.Blend = Class.extend({});
