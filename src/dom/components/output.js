Media.DOM.OutputComponent = Media.DOM.Component.extend({

  media: null,
  output: null,
  inputStream: null,
  outputStreams: null,

  constructor: function OutputComponent(media) {
    this.media = media;
    this.listenTo(media, {
      "pause play timeupdate ended": this.onUpdate,
      "destroyed": this.onDestroyed
    });
    this.listenTo(Media.DOM, {
      "create": this.onDOMCreate,
      "destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.DOM.fetchElements(this.media);
    this.output = groups.output;
    if (!this.output) return;
    this.setupStream();
    for (var i = 0, l = this.output.length; i < l; i++) {
      var outputStream = new Media.DOM.CanvasOutputStream(this.output[i]);
      this.outputStreams.push(outputStream);
      this.inputStream.pipe(outputStream);
    }
  } ,

  onDOMDestroy: function() {
    if (this.output) return;
    // TODO
  },

  setupStream: function() {
    this.inputStream = this.inputStream || new Media.DOM.VideoInputStream(this.media.el);
    this.outputStreams = this.outputStreams || [];
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    Media.DOM.Component.prototype.destroy.call(this);
  }

});

Media.DOM.register("OutputComponent");
