var ToggleController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    new Video.Toggle(video)
  }

});

Video.toggle = new ToggleController();
