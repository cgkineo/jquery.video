Media.WebGL.BrightnessContrastShader = Media.WebGL.Shader.extend({

  constructor: function BrightnessContrastShader() {
    Media.WebGL.Shader.prototype.constructor.apply(this, arguments);
  },

  fragmentSource: '\
    uniform sampler2D texture;\
    uniform float brightness;\
    uniform float contrast;\
    varying vec2 vTextureCoord;\
    void main() {\
      vec4 color = texture2D(texture, vTextureCoord);\
      color.rgb += brightness;\
      if (contrast > 0.0) {\
        color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;\
      } else {\
        color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;\
      }\
      gl_FragColor = color;\
    }\
  ',

  parseUniforms: function(uniforms) {
    return {
      brightness: clamp(-1, uniforms.brightness, 1),
      contrast: clamp(-1, uniforms.contrast, 1)
    };
  }

});
