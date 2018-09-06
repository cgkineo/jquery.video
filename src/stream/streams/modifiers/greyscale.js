var GreyScaleModify = Video.Modify.extend({

  constructor: function GreyScaleModify() {},

  modify: function(data) {
    data.webgl
      .draw(data.webglTexture)
      .shade("HueSaturationShader", { hue: 0, saturation: -1 })
      .update();
    data.context.drawImage(data.webgl.canvas, 0, 0, data.size.width, data.size.height);
  }

});

Video.GreyScaleModify = GreyScaleModify;
