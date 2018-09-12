var Texture = Class.extend({

  context: null,
  id: null,
  width: 0,
  height: 0,
  format: null,
  type: null,

  constructor: function Texture(context, width, height, format, type) {
    width = width || 0;
    height = height || 0;
    format = format || context.RGBA;
    type = type || context.UNSIGNED_BYTE;
    this.context = context;
    this.id = context.createTexture();
    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;

    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    if (width && height) {
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
    }
  },

  setSize: function(width, height) {
    this.width = width;
    this.height = height;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
  },

  loadContentsOf: function(element) {
    this.width = element.width || element.mediaWidth;
    this.height = element.height || element.mediaHeight;
    this.context.bindTexture(this.context.TEXTURE_2D, this.id);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, this.format, this.type, element);
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

  destroy: function() {
    this.context.deleteTexture(this.id);
    this.id = null;
  },

},{

  fromElement: function(context, element) {
    var texture = new Media.Texture(context, 0, 0, context.RGBA, context.UNSIGNED_BYTE);
    if (element) {
      texture.loadContentsOf(element);
    }
    return texture;
  }

});

Media.Texture = Texture;
