// Video standard instance functions
extend($.fn, {

  play: function() {
    this.videos().each(function(index, item) {
      item[Video._prop].play();
    });
    return this;
  },

  pause: function() {
    this.videos().each(function(index, item) {
      item[Video._prop].pause();
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

    this.handleInputEvent = this.handleInputEvent.bind(this);
    this._toggle_play_pause = this._toggle_play_pause.bind(this);
    this._on_after_mouseover = debounce(this._on_after_mouseover, 3000);

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

  play: function() {
    if (!this.$el[0].play) return;
    this.$el.trigger("preplay");
    try {
      this.$el[0].play();
    } catch(err) {
      
    }
  },

  pause: function() {
    if (!this.$el[0].play) return;
    this.$el[0].pause();
  },

  _start_controls: function(options) {
    this._$controlobservers =  $("[for='"+this.$el.attr("id")+"'][kind=controls]");
    this._$controlobservers.on("click", this.handleInputEvent);
    this._$controlobservers.on("mousemove", this.handleInputEvent);

    options = extend({}, this._opts, options, {controls: true});
    this.addEventsHandler(this._render_controls, options);
    
    this._render_control_classes();
    this._$controlobservers.removeClass("playing paused");
    this._$controlobservers.addClass("paused");
  },

  handleInputEvent: function(event) {
    var $target = $(event.target);

    if ($.fn.videos.isTouch) {
      switch (event.type) {
      case "click":
        if (!this.el.paused && $.fn.videos.isTouch && !this._triggeredMouseMove && this._$controlobservers.find(".scrub").length > 0) {
          this._triggeredMouseMove = true;
          this._$controlobservers.addClass("mousemove");
          this._on_after_mouseover();
          return;
        }

        if ($target.is(".play, .toggle") || $target.parents(".play, .toggle").length !== 0) {
          this._toggle_play_pause();
        }
        this._on_after_mouseover();
        break;
      case "mousemove":
        this._on_after_mouseover();
      }
      return
    }

    switch (event.type) {
      case "click":
        if ($target.is(".play, .toggle") || $target.parents(".play, .toggle").length !== 0) {
          this._toggle_play_pause();
        }
        break;
      case "mousemove":
        this._triggeredMouseMove = true;
        this._$controlobservers.addClass("mousemove");
        this._on_after_mouseover();
    }

  },

  _triggeredMouseMove: false,
  _on_after_mouseover: function() {
    this._triggeredMouseMove = false;
    this._$controlobservers.removeClass("mousemove");
  },

  _toggle_play_pause: function() {
    if (this.$el[0].paused) {
      this.play();
    } else {
      this.pause();
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
    this._render_control_classes();
  },

  _render_control_classes: function() {
    var isAtStart = this.el.currentTime <= 1;
    var isAtEnd = this.el.currentTime  >= this.el.duration -1;
    this._$controlobservers[isAtStart?'addClass':'removeClass']("at-start");
    this._$controlobservers[isAtEnd?'addClass':'removeClass']("at-end");
    this._$controlobservers[!isAtStart&&!isAtEnd?'addClass':'removeClass']("in-middle");
  },

  _stop_controls: function(options) {
    if (!this._$controlobservers) return;
    this._$controlobservers.off("click", this.handleInputEvent);
    this._$controlobservers.off("mousemove", this.handleInputEvent);
    this._$controlobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_controls();
    destroy();
  })

});