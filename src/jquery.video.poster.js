 extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      poster: this.$el.attr("poster") || false
    });
    defaults();
  }),

  initialize:chain(Video[p].initialize, function(initialize) {

    if (this._opts.poster) {
      this.poster("start");
    }
    initialize();

  }),

  poster: function(command, options) {
    switch (command) {
      case "start":
        this._start_poster(options);
        break;
      case "stop":
        this._stop_poster(options);
        break;
    }
    return this;
  },

  _start_poster: function(options) {
    this._$posterobservers =  $("[for='"+this.$el.attr("id")+"'][kind=poster]");

    this._$posterobservers.each(function(index, item) {
      var $item = $(item);
      $item.append($("<img>", {
        class: "jqv-poster-image",
        src: this._opts.poster
      }));
    }.bind(this));

    options = extend({}, this._opts, options, {poster: true});
    this.addEventsHandler(this._render_poster, options);

  },

  _render_poster: function(event, options) {
    switch (event.type) {
      case "play":
        this._$posterobservers.removeClass("playing paused");
        this._$posterobservers.addClass("playing");
        break;
      case "pause":
      case "finish":
        this._$posterobservers.removeClass("playing paused");
        this._$posterobservers.addClass("paused");
        break;
    }
    var isAtStart = this.el.currentTime <= 1;
    var isAtEnd = this.el.currentTime  >= this.el.duration -1;
    this._$posterobservers[isAtStart?'addClass':'removeClass']("at-start");
    this._$posterobservers[isAtEnd?'addClass':'removeClass']("at-end");
    this._$posterobservers[!isAtStart&&!isAtEnd?'addClass':'removeClass']("in-middle");

  },

  _stop_poster: function(options) {
    if (!this._$posterobservers) return;
    this._$posterobservers.find(".jqv-poster-image").remove();
    this._$posterobservers = null;
    this.removeEventsHandler(this._render_controls, options);
  },

  destroy:chain(Video[p].destroy, function(destroy) {
    this._stop_poster();
    destroy();
  })

});