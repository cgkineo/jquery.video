var BufferController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.Buffer(video)
  }

});

Video.buffer = new BufferController();
