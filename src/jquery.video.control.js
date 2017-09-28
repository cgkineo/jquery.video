// Video standard instance functions
extend($.fn, {

  play: function() {
    this.videos().each(function(index, item) {
      item.play();
    });
    return this;
  },

  pause: function() {
    this.videos().each(function(index, item) {
      item.pause();
    });
    return this;
  },

  mute: function(bool) {
    var isToggle = (bool === undefined);
    bool = Boolean(bool);
    this.videos().each(function(index, item) {
      var shouldMute = bool || (isToggle && !item.muted);
      if (shouldMute) {
        item.muted = true;
        item.volume = 0;
        return;
      }
      item.muted = false;
      item.volume = 1;
    });
    return this;
  },

  loop: function(bool) {
    var isToggle = (bool === undefined);
    bool = Boolean(bool);
    this.videos().each(function(index, item) {
      var shouldLoop = bool || (isToggle && !item.loop);
      if (shouldLoop) {
        item.loop = true;
        return;
      }
      item.loop = false;
    });
    return this;
  }

});

 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      muted: Boolean(this.$el.attr("muted")) || false,
      loop: Boolean(this.$el.attr("loop")) || false,
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {
    this.$el.mute(this._opts.muted);
    this.$el.loop(this._opts.loop);
    initialize();
  })

});