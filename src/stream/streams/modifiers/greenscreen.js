var GreenScreenModify = Video.Modify.extend({

  constructor: function GreenScreenModify() {},

  modify: function(pixel) {
    pixel.a = (pixel.g > 100 && pixel.r > 100 && pixel.b < 43) ?
      0 :
      pixel.a;
  }

});

Video.GreenScreenModify = GreenScreenModify;
