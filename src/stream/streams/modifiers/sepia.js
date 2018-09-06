var SepiaModify = Video.Modify.extend({

  constructor: function SepiaModify() {},

  modify: function(data) {
    data.webgl
      .draw(data.webglTexture)
      .shade("SepiaShader", { amount: 1 })
      .update();
    data.context.drawImage(data.webgl.canvas, 0, 0, data.size.width, data.size.height);
  }

});

Video.SepiaModify = SepiaModify;
