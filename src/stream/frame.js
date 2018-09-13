Media.Stream.Frame = Class.extend({

  height: 0,
  width: 0,
  canvas: null,
  context: null,

  constructor: function Frame() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
  },

  updateFromElement: function(element) {
    if (element instanceof Media.Stream.Frame) element = element.canvas;
    // TODO : work out precedence
    var width = element.videoWidth || element.originalWidth || element.width || element.clientWidth;
    var height = element.videoHeight || element.originalHeight || element.height || element.clientHeight;
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.source = element;
    this.context.drawImage(this.source, 0, 0, this.width, this.height);
  },

  clear: function() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

});
