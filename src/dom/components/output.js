var OutputComponent = Media.Component.extend({

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
    this.listenTo(Media, {
      "dom:create": this.onDOMCreate,
      "dom:destroy": this.onDOMDestroy
    });
    this.onDOMCreate();
  },

  onDOMCreate: function() {
    var groups = Media.dom.fetchElements(this.media);
    this.output = groups.output;
    if (!this.output) return;
    this.setupStream();
    for (var i = 0, l = this.output.length; i < l; i++) {
      var outputStream = new Media.CanvasOutputStream(this.output[i]);
      this.outputStreams.push(outputStream);
      this.inputStream.pipe(outputStream);
    }
  } ,

  onDOMDestroy: function() {
    if (this.output) return;
    // TODO
  },

  setupStream: function() {
    this.inputStream = this.inputStream || new Media.VideoInputStream(this.media.el);
    this.outputStreams = this.outputStreams || [];
  },

  onDestroyed: function() {
    this.onDOMDestroy();
    Media.Component.prototype.destroy.call(this);
  }

});

Media.OutputComponent = OutputComponent;
Media.dom.components.add("OutputComponent");
