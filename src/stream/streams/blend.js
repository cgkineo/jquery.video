var BlendStream = Video.Stream.extend({

  _sourceDatas: null,

  constructor: function BlendStream() {},

  datas$get: function() {
    this._sourceDatas = this._sourceDatas || [];
    this._sourceDatas.length = this.sources.length;
    return this._sourceDatas;
  },

  isFullyPopulated$get: function() {
    var datas = this.datas;
    var isFullyPopulated = Boolean(datas.length);
    for (var i = 0, l = datas.length; i < l; i++) {
      if (datas[i]) continue;
      isFullyPopulated = false;
      break;
    }
    return isFullyPopulated;
  },

  _lastTick: 0,
  data: function(data, fromStream) {
    var sources = this.sources;
    var sourceIndex = 0;
    for (var i = 0, l = sources.length; i < l; i++) {
      var source = sources[i];
      if (source === fromStream) {
        sourceIndex = i;
        break;
      }
    }

    this.datas[sourceIndex] = data;

    this.render();
  },

  render: function() {
    if (!this.isFullyPopulated) return;

    var now = Date.now();
    if (this._lastTick > now - (1000/60)) return;
    this._lastTick = now;

    if (this.next) {
      this.next();
    }
  },

  changed: function() {
    this.render();
  }

});

Video.BlendStream = BlendStream;
