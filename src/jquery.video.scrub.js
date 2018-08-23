 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      scrub: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    this._on_scrub_click = this._on_scrub_click.bind(this);
    this._on_scrub_inner_down = this._on_scrub_inner_down.bind(this);
    this._on_scrub_inner_move = this._on_scrub_inner_move.bind(this);
    this._on_scrub_inner_up = this._on_scrub_inner_up.bind(this);

    if (this._opts.scrub) {
      this.scrub("start");
    }
    initialize();

  }),

  scrub: function(command, options) {
    switch (command) {
      case "start":
        this._start_scrub(options);
        break;
      case "stop":
        this._stop_scrub(options);
        break;
    }
    return this;
  },

  _start_scrub: function(options) {
    this._$scrubobservers =  $("[for='"+this.$el.attr("id")+"'][kind=controls] .scrub");
    if (!this._$scrubobservers.length) {
      this._$scrubobservers = null;
      return;
    }
    this._$scrubobservers.on("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").on("mousedown touchstart", this._on_scrub_inner_down);
    this._$scrubobservers.find(".rail-inner, .rail-back").on("mousemove touchmove", this._on_scrub_inner_move);
    $(document).on("mouseup touchend", this._on_scrub_inner_up);
    options = extend({}, this._opts, options, {scrub: true});
    this.addEventsHandler(this._render_scrub, options);
  },

  _render_scrub: function(event, options) {
    switch (event.type) {
      case "timeupdate":
        this._$scrubobservers.find(".rail-inner").css({
          width: ((100 / this.el.duration) * this.el.currentTime) + "%"
        })
        break;
    }
  },

  _on_scrub_click: function(event) {

  },

  _on_scrub_inner_down: function(event) {
    this._opts._in_scrub_was_playing = !this.el.paused;
    this.$el.pause();
    this._opts._in_scrub_click = true;
    this._move_time_to_event(event);
  },

  _on_scrub_inner_move: function(event) {
    if (!this._opts._in_scrub_click) return;
    this._move_time_to_event(event)
  },

  _on_scrub_inner_up: function(event) {
    if (!this._opts._in_scrub_click) return;
    this._move_time_to_event(event)
    if (this._opts._in_scrub_was_playing) {
      this.$el.play();
    }
    this._opts._in_scrub_click = false;
  },

  _move_time_to_event: function(event) {
    if (isNaN(this.el.duration)) {
      this.el.load();
      return;
    }
    var width = this._$scrubobservers.find(".rail-back").width();
    var left = this._$scrubobservers.find(".rail-back")[0].getBoundingClientRect().left;
    var offsetX;
    switch (event.type) {
      case "touchstart": case "touchend": case "touchmove":
        if (!event || !event.originalEvent || !event.originalEvent.touches || !event.originalEvent.touches.length) return;
        offsetX = event.originalEvent.touches[0].clientX - left;
        break;
      default:
        offsetX = event.clientX - left;
    }

    try {
      this.el.currentTime = (offsetX/width * this.el.duration);
    } catch(e) {
      //try {
        this.$el.play();
        this.el.currentTime = (offsetX/width * this.el.duration);
        this.$el.pause();
      //
    }
  },

  _stop_scrub: function(options) {
    if (!this._$scrubobservers) return;
    this._$scrubobservers.off("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").off("mousedown touchstart", this._on_scrub_inner_down);
    this._$scrubobservers.find(".rail-inner, .rail-back").off("mousemove touchmove", this._on_scrub_inner_move);
    $(document).off("mouseup touchend", this._on_scrub_inner_up);
    this._$scrubobservers = null;
    this.removeEventsHandler(this._render_scrub, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_scrub();
    destroy();
  })

});