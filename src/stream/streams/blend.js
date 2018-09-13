Media.Stream.Blend = Media.Stream.extend({

  _datas$write: null,
  _lastTick$write: 0,

  constructor: function Blend() {
  },

  datas$get$enum: function() {
    this._datas = this._datas || [];
    this._datas.length = this.sources.length;
    return this._datas;
  },

  isReady$get$enum: function() {
    var datas = this.datas;
    var isReady = Boolean(datas.length);
    for (var i = 0, l = datas.length; i < l; i++) {
      if (datas[i]) continue;
      isReady = false;
      break;
    }
    return isReady;
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
    if (!this.isReady) return;

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
