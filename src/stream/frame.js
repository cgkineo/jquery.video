var Frame = Class.extend({

  source: null,
  height: 0,
  width: 0,
  canvas: null,
  context: null,

  constructor: function Frame() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
  },

  setSize: function(width, height) {
    if (this.width === width && this.height === height) return;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  },

  copy: function(frame) {
    this.updateFromElement(frame.canvas);
  },

  updateFromElement: function(element) {
    // TODO : work out precedence
    var width = element.videoWidth || element.originalWidth || element.width || element.clientWidth;
    var height = element.videoHeight || element.originalHeight || element.height || element.clientHeight;
    this.setSize(width, height);
    this.source = element;
    this.update();
  },

  update: function() {
    this.context.drawImage(this.source, 0, 0, this.width, this.height);
  },

  clear: function() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

});

Media.Frame = Frame;
