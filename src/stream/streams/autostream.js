var AutoStream = Class.extend({

  _streams: null,

  constructor: function AutoStream(options) {

    this._streams = {};

    for (var i = 0, l = options.streams.length; i < l; i++) {
      var stream = options.streams[i];
      var Cls = Video[stream.class];
      this._streams[stream.name] = new Cls(stream.options);
    }

    for (var i = 0, l = options.pipes.length; i < l; i++) {
      var pipe = options.pipes[i];
      var fromStream = this._streams[pipe.from];
      var toStream = this._streams[pipe.to];
      fromStream.pipe(toStream);
    }

  }

});

Video.AutoStream = AutoStream;
