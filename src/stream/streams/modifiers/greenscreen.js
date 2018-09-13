Media.Stream.GreenScreenModify = Media.Stream.extend({

  constructor: function GreenScreenModify() {
  },

  next: function(pixel) {
    pixel.a = (pixel.g > 100 && pixel.r > 100 && pixel.b < 43) ?
      0 :
      pixel.a;
  }

});
