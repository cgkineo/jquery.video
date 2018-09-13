Media.Stream.MediaInput = Media.Stream.Input.extend({

  media: null,

  constructor: function MediaInput(media) {
    Media.Stream.Input.prototype.constructor.apply(this, arguments);
    if (media instanceof Media) this.media = media;
    else if (media instanceof HTMLVideoElement) this.media = media[Media.propName];
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

