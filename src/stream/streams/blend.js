var BlendStream = Media.Stream.extend({

  sourceDatas: null,

  constructor: function BlendStream() {
  },

  datas$get: function() {
    this.sourceDatas = this.sourceDatas || [];
    this.sourceDatas.length = this.sources.length;
    return this.sourceDatas;
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

  lastTick: 0,
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
    if (this.lastTick > now - (1000/60)) return;
    this.lastTick = now;

    if (this.next) {
      this.next();
    }
  },

  changed: function() {
    this.render();
  }

});

Media.BlendStream = BlendStream;
