var GreyscaleTransform = Video.Stream.extend({

  constructor: function GreyscaleTransform() {},

  _next: function(context, callback) {
    var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var data = imageData.data;
    // Loop through the pixels, turning them grayscale
    for (var i = 0; i < data.length; i+=4) {
        var r = data[i];
        var g = data[i+1];
        var b = data[i+2];
        var brightness = (3*r+4*g+b)>>>3;
        data[i] = brightness;
        data[i+1] = brightness;
        data[i+2] = brightness;
    }
    imageData.data = data;
    context.putImageData(imageData, 0, 0);
    callback(context);
  }

});

Video.Stream.GreyscaleTransform = GreyscaleTransform;
