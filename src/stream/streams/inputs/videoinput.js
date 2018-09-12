var VideoInputStream = Media.InputStream.extend({

  media: null,
  frame: null,

  constructor: function VideoInputStream(media) {
    Media.InputStream.prototype.constructor.apply(this, arguments);
    if (media instanceof Media) this.media = media;
    else if (media instanceof HTMLVideoElement) this.media = media.player;
    else throw "Cannot use element type";
    this.update = this.update.bind(this);
    this.listenTo(this.media, "timeupdate", this.update);
  },

  update: function(event) {
    if (!event.fake) return;
    this.frame.updateFromElement(this.media.el);
    this.push(this.frame);
  }

});

Media.VideoInputStream = VideoInputStream;
