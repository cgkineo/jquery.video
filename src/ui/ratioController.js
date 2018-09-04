var RatioController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.Ratio(video)
  }

});

Video.ratio = new RatioController();
