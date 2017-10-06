 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      buffering: true
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    if (this._opts.buffering) {
      this.buffering("start");
    }
    initialize();

  }),

  buffering: function(command, options) {
    switch (command) {
      case "start":
        this._start_buffering(options);
        break;
      case "stop":
        this._stop_buffering(options);
        break;
    }
    return this;
  },

  _start_buffering: function(options) {
    this._$bufferingobservers =  $("[for='"+this.$el.attr("id")+"'][kind=buffering]");

    options = extend({}, this._opts, options, {buffering: true});
    this.addEventsHandler(this._render_buffering, options);

  },

  _render_buffering: function(event, options) {
    switch (event.type) {
      case "timeupdate":
        if (!this._opts._seconds) {
          this._opts._seconds = this.el.currentTime;
        } else if (this._opts._seconds === this.el.currentTime) {
          if (!this._opts._lastStalled) {
            this._opts._lastStalled = Date.now();
          } else {
            var timeSinceStalled = (Date.now() - this._opts._lastStalled);
            if (timeSinceStalled > 1) {
              this._$bufferingobservers.addClass("buffering");
              return;
            }
          }
        }
      default:
        this._$bufferingobservers.removeClass("buffering");
        this._opts._seconds = this.el.currentTime;
    }
  },

  _stop_buffering: function(options) {
    this._$bufferingobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_buffering();
    destroy();
  })

});