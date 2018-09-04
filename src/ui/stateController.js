var StateController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.State(video)
  }

});

Video.state = new StateController();
