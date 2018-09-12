var AutoStream = Class.extend({

  streams: null,

  constructor: function AutoStream(options) {

    this.streams = {};

    for (var i = 0, l = options.streams.length; i < l; i++) {
      var stream = options.streams[i];
      var Cls = Media[stream.class];
      this.streams[stream.name] = new Cls(stream.options);
    }

    for (var i = 0, l = options.pipes.length; i < l; i++) {
      var pipe = options.pipes[i];
      var fromStream = this.streams[pipe.from];
      var toStream = this.streams[pipe.to];
      fromStream.pipe(toStream);
    }

  }

});

Media.AutoStream = AutoStream;
