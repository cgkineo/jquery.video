var SplitBlend = Video.Blend.extend({

  constructor: function SplitBlend() {},

  blend: function(destination, sources) {

    var size = destination.size;
    var halfHeight = size.height / 2;

    for (var s = 0, sl = sources.length; s < sl; s++) {
      var source = sources[s];
      if (s === 1) {
        // copy top half to top
        destination.context.drawImage(source.canvas, 0, 0, size.width, halfHeight, 0, 0, size.width, halfHeight);
      } else {
        // copy bottom half to bottom
        destination.context.drawImage(source.canvas, 0, halfHeight, size.width, halfHeight, 0, halfHeight, size.width, halfHeight);
      }
    }

  }

});

Video.SplitBlend = SplitBlend;



