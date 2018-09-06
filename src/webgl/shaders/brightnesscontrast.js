var BrightnessContrastShader = Video.Shader.extend({

  constructor: function BrightnessContrastShader() {
    Video.Shader.apply(this, arguments);
  },

  fragmentSource: '\
    uniform sampler2D texture;\
    uniform float brightness;\
    uniform float contrast;\
    varying vec2 texCoord;\
    void main() {\
      vec4 color = texture2D(texture, texCoord);\
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

Video.BrightnessContrastShader = BrightnessContrastShader;
