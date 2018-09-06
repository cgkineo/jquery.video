var VideoInputStream = Video.Stream.extend({

  video: null,
  size: null,

  constructor: function VideoInputStream(video) {
    if (video instanceof Video) this.video = video;
    if (video instanceof HTMLMediaElement) this.video = video.player;
    this._update = this._update.bind(this);
    this._resize();
    this.listenTo(this.video, {
      "resize": this._resize,
      "loaded": this._resize,
      "timeupdate": this._update
    });
  },

  _resize: function() {
    this._getSize();
    if (!this._frame) {
      this._frame = new Video.Frame(this.size, this.video.el);
    } else {
      this._frame.setSize(this.size);
    }
    this._update();
  },

  _getSize: function() {
    this.size = {
      time: Date.now(),
      height: this.video.el.videoHeight,
      width: this.video.el.videoWidth
    };
  },

  _update: function() {
    if (this.size.width === 0 || this.size.height === 0) {
      this._getSize();
      this._frame.setSize(this.size);
      if (this.size.width === 0 || this.size.height === 0)
        return;
    }
    this._frame.update();
    this.push(this._frame);
  }

});

Video.VideoInputStream = VideoInputStream;
