 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      scrub: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    this._on_scrub_click = this._on_scrub_click.bind(this);
    this._on_scrub_inner_click = this._on_scrub_inner_click.bind(this);

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
    this._$scrubobservers.on("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").on("click", this._on_scrub_inner_click);
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
    event.preventDefault();
    event.stopPropagation();
  },

  _on_scrub_inner_click: function(event) {
    var width = this._$scrubobservers.find(".rail-back").width();
    this.el.currentTime = (event.offsetX/width * this.el.duration);
  },

  _stop_scrub: function(options) {
    if (!this._$scrubobservers) return;
    this._$scrubobservers.off("click", this._on_scrub_click);
    this._$scrubobservers.find(".rail-inner, .rail-back").off("click", this._on_scrub_inner_click);
    this._$scrubobservers = null;
    this.removeEventsHandler(this._render_scrub, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_scrub();
    destroy();
  })

});