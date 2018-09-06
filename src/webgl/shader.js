var Shader = Class.extend({

  context: null,
  vertexAttribute: null,
  texCoordAttribute: null,

  vertexSource: '\
    attribute vec2 vertex;\
    attribute vec2 _texCoord;\
    varying vec2 texCoord;\
    void main() {\
        texCoord = _texCoord;\
        gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);\
    }',

  fragmentSource: '\
    uniform sampler2D texture;\
    varying vec2 texCoord;\
    void main() {\
        gl_FragColor = texture2D(texture, texCoord);\
    }',

  constructor: function Shader(context, vertexSource, fragmentSource) {
    this.vertexSource = vertexSource || this.vertexSource;
    this.fragmentSource = fragmentSource || this.fragmentSource;
    this.fragmentSource = 'precision highp float;' + this.fragmentSource; // annoying requirement is annoying
    this.context = context;
    this.program = this.context.createProgram();
    this.context.attachShader(this.program, this.compileSource(this.context.VERTEX_SHADER, this.vertexSource));
    this.context.attachShader(this.program, this.compileSource(this.context.FRAGMENT_SHADER, this.fragmentSource));
    this.context.linkProgram(this.program);
    if (!this.context.getProgramParameter(this.program, this.context.LINK_STATUS)) {
        throw 'link error: ' + this.context.getProgramInfoLog(this.program);
    }
  },

  compileSource: function(type, source) {
    var shader = this.context.createShader(type);
    this.context.shaderSource(shader, source);
    this.context.compileShader(shader);
    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      throw 'compile error: ' + this.context.getShaderInfoLog(shader);
    }
    return shader;
  },

  uniforms: function(uniforms) {
    this.context.useProgram(this.program);
    for (var name in uniforms) {
      if (!uniforms.hasOwnProperty(name)) continue;
      var location = this.context.getUniformLocation(this.program, name);
      // Will be null if the uniform isn't used in the shader
      if (location === null) continue;
      var value = uniforms[name];

      if (isArray(value)) {
        switch (value.length) {
          case 1:
            this.context.uniform1fv(location, new Float32Array(value));
            break;
          case 2:
            this.context.uniform2fv(location, new Float32Array(value));
            break;
          case 3:
            this.context.uniform3fv(location, new Float32Array(value));
            break;
          case 4:
            this.context.uniform4fv(location, new Float32Array(value));
            break;
          case 9:
            this.context.uniformMatrix3fv(location, false, new Float32Array(value));
            break;
          case 16:
            this.context.uniformMatrix4fv(location, false, new Float32Array(value));
            break;
          default:
            throw 'dont\'t know how to load uniform "' + name + '" of length ' + value.length;
        }
        continue;
      }

      if (isNumber(value)) {
        this.context.uniform1f(location, value);
        continue;
      }

      throw 'attempted to set uniform "' + name + '" to invalid value ' + (value || 'undefined').toString();
    }
    // allow chaining
    return this;
  },

  // textures are uniforms too but for some reason can't be specified by this.context.uniform1f,
  // even though floating point numbers represent the integers 0 through 7 exactly
  textures: function(textures) {
    this.context.useProgram(this.program);
    for (var name in textures) {
      if (!textures.hasOwnProperty(name)) continue;
      this.context.uniform1i(this.context.getUniformLocation(this.program, name), textures[name]);
    }
    // allow chaining
    return this;
  },

  drawRect: function(left, top, right, bottom) {
    var undefined;
    var viewport = this.context.getParameter(this.context.VIEWPORT);
    top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0;
    left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0;
    right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1;
    bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1;
    if (this.context.vertexBuffer == null) {
      this.context.vertexBuffer = this.context.createBuffer();
    }
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.vertexBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([ left, top, left, bottom, right, top, right, bottom ]), this.context.STATIC_DRAW);
    if (this.context.texCoordBuffer == null) {
      this.context.texCoordBuffer = this.context.createBuffer();
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.texCoordBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ]), this.context.STATIC_DRAW);
    }
    if (this.vertexAttribute == null) {
      this.vertexAttribute = this.context.getAttribLocation(this.program, 'vertex');
      this.context.enableVertexAttribArray(this.vertexAttribute);
    }
    if (this.texCoordAttribute == null) {
      this.texCoordAttribute = this.context.getAttribLocation(this.program, '_texCoord');
      this.context.enableVertexAttribArray(this.texCoordAttribute);
    }
    this.context.useProgram(this.program);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.vertexBuffer);
    this.context.vertexAttribPointer(this.vertexAttribute, 2, this.context.FLOAT, false, 0, 0);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.texCoordBuffer);
    this.context.vertexAttribPointer(this.texCoordAttribute, 2, this.context.FLOAT, false, 0, 0);
    this.context.drawArrays(this.context.TRIANGLE_STRIP, 0, 4);
  },

  destroy: function() {
    if (!this.context) return;
    this.context.deleteProgram(this.program);
    this.program = null;
  }

},{

  getDefaultShader: function(context) {
    context.defaultShader = context.defaultShader || new Video.Shader(context);
    return context.defaultShader;
  }

});

Video.Shader = Shader;
