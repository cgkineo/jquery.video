var RailController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.Rail(video)
  }

});

Video.rail = new RailController();
