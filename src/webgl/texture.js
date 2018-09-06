var Texture = Class.extend({

  context: null,
  id: null,
  width: 0,
  height: 0,
  format: null,
  type: null,

  constructor: function Texture(context, width, height, format, type) {
    this.context = context;
    this.id = context.createTexture();
    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;

    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    if (width && height) {
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
    }
  },

  loadContentsOf: function(element) {
    this.width = element.width || element.videoWidth;
    this.height = element.height || element.videoHeight;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, this.format, this.type, element);
  },

  initFromBytes: function(width, height, data) {
    this.width = width;
    this.height = height;
    this.format = this.context.RGBA;
    this.type = this.context.UNSIGNED_BYTE;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, width, height, 0, this.context.RGBA, this.type, new Uint8Array(data));
  },

  setContext: function(context) {
    this.context = context;
  },

  use: function(unit) {
    this.context.activeTexture(this.context.TEXTURE0 + (unit || 0));
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
  },

  unuse: function(unit) {
    this.context.activeTexture(this.context.TEXTURE0 + (unit || 0));
    this.context.bindTexture(this.context.TEXTURE_2D, null);
  },

  ensureFormat: function(width, height, format, type) {
    /*
      allow passing an existing texture instead of individual arguments
      TODO: split into separate functions
     */
    if (arguments.length === 1) {
      var texture = arguments[0];
      width = texture.width;
      height = texture.height;
      format = texture.format;
      type = texture.type;
    }

    if (width === this.width && height === this.height && format === this.format && type === this.type) return;

    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);

  },

  drawTo: function(callback) {
    // start rendering to this texture
    this.context.framebuffer = this.context.framebuffer || this.context.createFramebuffer();
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, this.context.framebuffer);
    this.context.framebufferTexture2D(this.context.FRAMEBUFFER, this.context.COLOR_ATTACHMENT0, this.context.TEXTURE_2D, this.id, 0);
    if (this.context.checkFramebufferStatus(this.context.FRAMEBUFFER) !== this.context.FRAMEBUFFER_COMPLETE) {
      throw new Error('incomplete framebuffer');
    }
    this.context.viewport(0, 0, this.width, this.height);

    // do the drawing
    callback();

    // stop rendering to this texture
    this.context.bindFramebuffer(this.context.FRAMEBUFFER, null);
  },

  _canvas: null,
  _context: null,
  fillUsingCanvas: function(callback) {
    this._clearCanvas();
    callback(this._context);
    this.format = this.context.RGBA;
    this.type = this.context.UNSIGNED_BYTE;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.context.RGBA, this.context.RGBA, this.context.UNSIGNED_BYTE, this._canvas);
    return this;
  },

  _clearCanvas: function() {
    if (this._canvas == null) this._canvas = document.createElement('canvas');
    this._canvas.width = this.width;
    this._canvas.height = this.height;
    if (this._context === null) this._context = this._canvas.getContext('2d');
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  },

  toImage: function(image) {
    this.use();
    Video.Shader.getDefaultShader().drawRect();
    var size = this.width * this.height * 4;
    var pixels = new Uint8Array(size);
    this._clearCanvas();
    var c = this._context;
    var data = c.createImageData(this.width, this.height);
    this.context.readPixels(0, 0, this.width, this.height, this.context.RGBA, this.context.UNSIGNED_BYTE, pixels);
    for (var i = 0; i < size; i++) {
      data.data[i] = pixels[i];
    }
    c.putImageData(data, 0, 0);
    image.src = this._canvas.toDataURL();
  },

  swapWith: function(other) {
    var temp;

    temp = other.id;
    other.id = this.id;
    this.id = temp;

    temp = other.width;
    other.width = this.width;
    this.width = temp;

    temp = other.height;
    other.height = this.height;
    this.height = temp;

    temp = other.format;
    other.format = this.format;
    this.format = temp;

    temp = other.context;
    other.context = this.context;
    this.context = temp;

    temp = other.type;
    other.type = this.type;
    this.type = temp;
  },

  destroy: function() {
    this.context.deleteTexture(this.id);
    this.id = null;
  },

},{

  fromElement: function(context, element) {
    var texture = new Video.Texture(context, 0, 0, context.RGBA, context.UNSIGNED_BYTE);
    texture.loadContentsOf(element);
    return texture;
  }

});

Video.Texture = Texture;
