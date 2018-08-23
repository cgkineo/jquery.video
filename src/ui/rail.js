var RailController = Class({

  constructor: function() {
    this.listenTo(Video, {
      "create": this.onCreate
    });
  },

  onCreate: function(video) {
    new Rail(video)
  }

});

var Rail = Class({

  video: null,

  constructor: function(video) {
    this.video = video;
    this.listenTo(video, {
      "timeupdate": this.onTimeUpdate,
      "destroy": this.destroy()
    });
  },

  onTimeUpdate: function() {
    var forId = this.video.el.id;
    if (!Video.dom.elements[forId]) return;
    if (!Video.dom.elements[forId]['rail']) return;
    var rails = Video.dom.elements[forId]['rail'];
    for (var i = 0, l = rails.length; i < l; i++) {
      var rail = rails[i];
      var position = this.video.el.currentTime / this.video.el.duration;
      rail.style.width = position * 100 + "%";
    }
  }

});

Video.rail = new RailController();
