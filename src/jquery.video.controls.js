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
      controls: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {
    this.$el.mute(this._opts.muted);
    this.$el.loop(this._opts.loop);

    this._process_controls = this._process_controls.bind(this);
    this._toggle_play_pause = this._toggle_play_pause.bind(this);

    if (this._opts.controls) {
      this.controls("start");
    }
    initialize();
  }),

  controls: function(command, options) {
    switch (command) {
      case "start":
        this._start_controls(options);
        break;
      case "stop":
        this._stop_controls(options);
        break;
    }
    return this;
  },

  _start_controls: function(options) {
    this._$controlobservers =  $("[for='"+this.$el.attr("id")+"'][kind=controls]");
    this._$controlobservers.on("click", this._process_controls);

    options = extend({}, this._opts, options, {controls: true});
    this.addEventsHandler(this._render_controls, options);

  },

  _process_controls: function(event) {
    var $target = $(event.target);
    if ($target.is("[kind=controls]") || $target.is(".play") || $target.parents(".play").length !== 0) {
      this._toggle_play_pause();
    }
  },

  _toggle_play_pause: function() {
    if (this.$el[0].paused) {
      if (this.$el[0].play) this.$el[0].play();
    } else {
      if (this.$el[0].pause) this.$el[0].pause();
    }
  },

  _render_controls: function(event, options) {
    switch (event.type) {
      case "play":
        this._$controlobservers.removeClass("playing paused");
        this._$controlobservers.addClass("playing");
        break;
      case "pause":
        this._$controlobservers.removeClass("playing paused");
        this._$controlobservers.addClass("paused");
        break;
    }
  },

  _stop_controls: function(options) {
    this._$controlobservers.off("click", this._process_controls);
    this._$controlobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_controls();
    destroy();
  })

});