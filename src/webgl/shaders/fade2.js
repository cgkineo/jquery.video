var Fade2Shader = Video.Shader.extend({

  constructor: function Fade2Shader() {
    Video.Shader.apply(this, arguments);
  },

  fragmentSource: '\
    varying vec2 vTextureCoord;\
    uniform float amount;\
    uniform vec2 resolution;\
    uniform sampler2D firstTexture;\
    uniform sampler2D secondTexture;\
    uniform sampler2D displacement;\
    void main( void ) {\
      vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);\
      \
      vec4 firstDistortedColor = texture2D(firstTexture, textureCoords);\
      vec4 secondDistortedColor = texture2D(secondTexture, textureCoords);\
      \
      float displacementFactor = (cos(amount / (1.0 / 3.141592)) + 1.0) / 2.0;\
      \
      vec4 finalColor = mix(firstDistortedColor, secondDistortedColor, displacementFactor);\
      \
      finalColor = vec4(finalColor.rgb, finalColor.a);\
      \
      gl_FragColor = finalColor;\
    }\
  ',

  parseUniforms: function(uniforms) {
    return {
      resolution: [ uniforms.width, uniforms.height ],
      amount: clamp(0, uniforms.amount, 1)
    };
  }

});

Video.Fade2Shader = Fade2Shader;
