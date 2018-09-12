var WebGL = Class.extend({

  canvas: null,
  context: null,
  shaders: {},
  width: null,
  height: null,

  constructor: function WebGL() {
    this.canvas = document.createElement('canvas');
    try {
      this.context = this.canvas.getContext("webgl", {
        alpha: true
      }) || this.canvas.getContext('experimental-webgl', {
        alpha: true
      });
    } catch (e) {}
    if (!this.context) throw 'No WebGL support';
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
    this.context.enable(this.context.BLEND);
  },

  createTexture: function(element) {
    return Media.Texture.fromElement(this.context, element);
  },

  setSize: function(width, height) {
    if (this.width === width && this.height === height) return this;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context.viewport(0, 0, width, height);
    return this;
  },

  runShader: function(shaderName, uniforms, textures) {
    var ShaderClass = Media[shaderName];
    if (!ShaderClass) {
      throw "Shader not defined " + shaderName;
    }

    var shader = this.shaders[shaderName] =
      this.shaders[shaderName] ||
      new ShaderClass(this.context);

    if (!(shader instanceof Media.Shader)) {
      throw "Instance is not a Media.Shader " + shaderName;
    }

    shader.uniforms(shader.parseUniforms(uniforms)).textures(textures).drawRect();

    return this;
  }

});

Media.WebGL = WebGL;
