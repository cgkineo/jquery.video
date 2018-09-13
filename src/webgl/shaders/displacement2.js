Media.WebGL.Displacement2Shader = Media.WebGL.Shader.extend({

  constructor: function Displacement2Shader() {
    Media.WebGL.Shader.prototype.constructor.apply(this, arguments);
  },

  fragmentSource: '\
    varying vec2 vTextureCoord;\
    \
    uniform float amount;\
    uniform vec2 resolution;\
    \
    uniform sampler2D firstTexture;\
    uniform sampler2D secondTexture;\
    uniform sampler2D displacement;\
    \
    void main( void ) {\
      vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);\
      \
      vec4 displacementTexture = texture2D(displacement, textureCoords);\
      \
      float displacementFactor = (cos(amount / (1.0 / 3.141592)) + 1.0) / 2.0;\
      float effectFactor = 1.0;\
      \
      vec2 firstDisplacementCoords = vec2(textureCoords.x + displacementFactor * (displacementTexture.r * effectFactor), textureCoords.y);\
      vec2 secondDisplacementCoords = vec2(textureCoords.x - (1.0 - displacementFactor) * (displacementTexture.r * effectFactor), textureCoords.y);\
      \
      vec4 firstDistortedColor = texture2D(firstTexture, firstDisplacementCoords);\
      vec4 secondDistortedColor = texture2D(secondTexture, secondDisplacementCoords);\
      \
      vec4 finalColor = mix(firstDistortedColor, secondDistortedColor, displacementFactor);\
      \
      finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);\
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
