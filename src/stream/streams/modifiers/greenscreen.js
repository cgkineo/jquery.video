var GreenScreenModifyStream = Video.Stream.extend({

  constructor: function GreenScreenModifyStream() {},

  next: function(pixel) {
    pixel.a = (pixel.g > 100 && pixel.r > 100 && pixel.b < 43) ?
      0 :
      pixel.a;
  }

});

Video.GreenScreenModifyStream = GreenScreenModifyStream;
