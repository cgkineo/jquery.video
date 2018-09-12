var BlendStream = Media.Stream.extend({

  _datas: null,
  _lastTick: 0,

  constructor: function BlendStream() {
  },

  datas$get: function() {
    this._datas = this._datas || [];
    this._datas.length = this.sources.length;
    return this._datas;
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

    this.next();
  },

  next: function() {},

  changed: function() {
    this.render();
  }

});

Media.BlendStream = BlendStream;
