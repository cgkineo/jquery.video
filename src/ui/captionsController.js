var CaptionsController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.Captions(video)
  }

});


Video.captions = new CaptionsController();
