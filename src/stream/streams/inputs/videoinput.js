var VideoInputStream = Video.Stream.extend({

  video: null,
  _frame: null,

  constructor: function VideoInputStream(video) {
    if (video instanceof Video) this.video = video;
    if (video instanceof HTMLMediaElement) this.video = video.player;
    this.update = this.update.bind(this);
    this.listenTo(this.video, "timeupdate", this.update);
  },

  update: function() {
    this.frame.updateFromElement(this.video.el);
    this.push(this.frame);
  }

});

Video.VideoInputStream = VideoInputStream;
