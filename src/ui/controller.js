var Controller = Class.extend({

  constructor: function Controller() {
    this.listenTo(Video, {
      "created": this.onCreated
    });
  },

  onCreated: function(video) {
    for (var k in Video.components) {
      video.components[k] = new Video.components[k](video);
    }
  }

});

Video.controller = new Controller();
