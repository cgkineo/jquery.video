var OutputComponent = Video.Component.extend({

  video: null,
  output: null,
  inputStream: null,
  outputStreams: [],

  constructor: function OutputComponent(video) {
    this.video = video;
    this.listenTo(video, {
      "pause play timeupdate ended": this.onUpdate,
      "destroyed": this.destroy
    });
    this.listenTo(Video, {
      "uicreate": this.onUICreate
    });
    this.setupStream();
    this.onUICreate();
  },

  setupStream: function() {
    this.inputStream = new Video.VideoInputStream(this.video.el);
    this.outputStreams = [];
  },

  onUICreate: function() {
    var groups = Video.dom.fetchElements(this.video);
    this.output = groups.output;
    if (!this.output) return;
    for (var i = 0, l = this.output.length; i < l; i++) {
      var outputStream = new Video.CanvasOutputStream(this.output[i]);
      this.outputStreams.push(outputStream);
      this.inputStream.pipe(outputStream);
    }
  }

});

Video.OutputComponent = OutputComponent;
Video.dom.components.add("OutputComponent");
