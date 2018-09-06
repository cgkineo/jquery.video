var WebGL = Class.extend({

  canvas: null,
  context: null,
  shaders: {},

  _isInitialized: false,
  _texture: null,
  _spareTexture: null,
  _extraTexture: null,
  _flippedShader: null,

  constructor: function WebGL() {
    this.canvas = document.createElement('canvas');
    try {
      this.context = this.canvas.getContext('experimental-webgl', {
        premultipliedAlpha: false
      });
    } catch (e) {}
    if (!this.context) throw 'No WebGL support';
  },

  texture: function(element) {
    return Video.Texture.fromElement(this.context, element);
  },

  initialize: function(width, height) {
    var type = this.context.UNSIGNED_BYTE;

    // Go for floating point buffer textures if we can, it'll make the bokeh
    // filter look a lot better. Note that on Windows, ANGLE does not let you
    // render to a floating-point texture when linear filtering is enabled.
    // See http://crbug.com/172278 for more information.
    if (this.context.getExtension('OES_texture_float') && this.context.getExtension('OES_texture_float_linear')) {
      var testTexture = new Video.Texture(this.context, 100, 100, this.context.RGBA, this.context.FLOAT);
      try {
      // Only use this.context.FLOAT if we can render to it
        testTexture.drawTo(function() { type = this.context.FLOAT; });
      } catch (e) {
      }
      testTexture.destroy();
    }

    if (this._texture) this._texture.destroy();
    if (this._spareTexture) this._spareTexture.destroy();
    this.canvas.width = width;
    this.canvas.height = height;
    this._texture = new Video.Texture(this.context, width, height, this.context.RGBA, type);
    this._spareTexture = new Video.Texture(this.context, width, height, this.context.RGBA, type);
    this._extraTexture = this._extraTexture || new Video.Texture(this.context, 0, 0, this.context.RGBA, type);
    this._flippedShader = this._flippedShader || new Video.Shader(this.context, null, '\
      uniform sampler2D texture;\
      varying vec2 texCoord;\
      void main() {\
      gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));\
      }\
    ');
    this._isInitialized = true;
  },

  /*
     Draw a texture to the canvas, with an optional width and height to scale to.
     If no width and height are given then the original texture width and height
     are used.
  */
  draw: function(texture, width, height) {
    if (!this._isInitialized || texture.width != this.canvas.width || texture.height != this.canvas.height) {
      this.initialize(width ? width : texture.width, height ? height : texture.height);
    }

    texture.setContext(this.context);
    texture.use();

    this._texture.setContext(this.context);
    this._texture.drawTo(function() {
      Video.Shader.getDefaultShader(this.context).drawRect();
    }.bind(this));

    return this;
  },

  update: function() {
    this._texture.setContext(this.context);
    this._texture.use();
    this._flippedShader.drawRect();
    return this;
  },

  shade: function(shaderName, uniforms) {
    var ShaderClass = Video[shaderName];
    if (!ShaderClass) {
      throw "Shader not defined " + shaderName;
    }

    var shader = this.shaders[shaderName] =
      this.shaders[shaderName] ||
      new ShaderClass(this.context);

    if (!(shader instanceof Video.Shader)) {
      throw "Instance is not a Video.Shader " + shaderName;
    }

    this._texture.setContext(this.context);
    this._texture.use();
    this._spareTexture.setContext(this.context);
    this._spareTexture.drawTo(function() {
      shader.uniforms(shader.parseUniforms(uniforms)).drawRect();
    });
    this._spareTexture.swapWith(this._texture);

    return this;
  },

  getPixelArray: function() {
    var size = this._texture.width * this._texture.height * 4;
    var pixels = new Uint8Array(size);

    this._texture.setContext(this.context);
    this._texture.use();
    this.context.defaultShader.drawRect();
    this.context.readPixels(0, 0, texture.width, texture.height, this.context.RGBA, this.context.UNSIGNED_BYTE, pixels);

    return pixels;
  }

});

Video.WebGL = WebGL;
