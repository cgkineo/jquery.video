// global api
$.fn.videos = function(options) {

  // get all video tags selected and make Video instances for them
  var $videos = this.find("video");
  $videos = $videos.add(this.filter("video"));

  switch (options) {
    case "destroy":
      // tear down all video class + dom associations
      $videos.each(function(index, item) {
        if (!item[Video._prop]) return;
        item[Video._prop].destroy();
        delete item[Video._prop];
      });
      return $videos;
  }

  $videos.each(function(index, item) {
    if (!item[Video._prop]) {
      new Video($(item), options);
    }
  });
  return $videos;

};

// Video class
var Video = $.Video = function Video($el, options) {
  this.id = ++Video._ids;
  this.el = $el[0];
  this.$el = $el;
  this.el[Video._prop] = this;
  this.options = this._opts = {};
  this.defaults();
  this.setOptions(options);
  this.initialize();
};

// Video global functions
extend(Video, {

  _ids: 0,
  _eventsHandler_count: 0,
  _eventsHandlers: {},
  _prop: "player",
  _events: ["play", "pause", "timeupdate", "finish"],

  removeEventsHandler: function() {

    var eventsHandlers = Video._eventsHandlers;

    if (!Video._eventsHandler_count) return;

    for (var id in eventsHandlers) {
      var eventsHandler = eventsHandlers[id];
      var $el = eventsHandler.$el;
      eventsHandler.forEach(function(item) {
        Video._events.forEach(function(event) {
          $el.off(event, Video._processeventsHandlerEvents);
        });
      });
      delete eventsHandlers[id];
      Video._eventsHandler_count--;
    }

  },

  _processeventsHandlerEvents: function(event, data) {

    extend(event, data);

    var eventsHandlers = Video._eventsHandlers;

    var el = event.currentTarget;
    var id = event.currentTarget[Video._prop].id;
    if (!id) return;

    var eventsHandler = eventsHandlers[id];

    if (!eventsHandler) return;
    if (!eventsHandler.length) return;

    var video = el[Video._prop];

    eventsHandler.forEach(function(item) {
      item.callback.call(video, event, item._opts)
    });
    
  }

});

// Video instance functions
extend(Video[p], {

  defaults: function() {},

  setOptions: function(options) {
    extend(this._opts, options);
  },

  initialize: function() {},

  destroy: function() {
    delete this.el[Video._prop];
    this.id = null;
    this.el = null;
    this.$el = null;
  },

  addEventsHandler: function(callback, options) {

    var eventsHandlers = Video._eventsHandlers;
  
    if (!callback) return;

    var el = this.el;

    if (!this._opts.eventsHandler) {
      this._opts.eventsHandler = true;
      eventsHandlers[el[Video._prop].id] = [];
      eventsHandlers[el[Video._prop].id].$el = this.$el;
      Video._events.forEach(function(event) {
        this.$el.on(event, Video._processeventsHandlerEvents);
      }.bind(this));
      Video._eventsHandler_count++;
    }

    var eventsHandler = eventsHandlers[el[Video._prop].id];

    for (var i = 0, l = eventsHandler.length; i < l; i++) {
      var item = eventsHandler[i];
      if (item.callback === callback && item.context === this) return;
    }

    eventsHandler.push({
      context: this,
      callback: callback,
      options: options
    });

  },

  removeEventsHandler: function(callback) {

    var el = this.el;
    var eventsHandlers = Video._eventsHandlers;

    if (!this._opts.eventsHandler) return;
    if (!Video._eventsHandler_count) return;

    var eventsHandler = eventsHandlers[el[Video._prop].id];
    
    if (!eventsHandler) return;
    if (!eventsHandler.length) return;

    if (callback) {
    
      for (var i = eventsHandler.length-1, l = -1; i > l; i--) {
        var item = eventsHandler[i];
        if (item.context !== this || item.callback !== callback) continue;
        eventsHandler.splice(i,1);
        if (!eventsHandler.length) {
          Video._events.forEach(function(event) {
            this.$el.off(event, Video._processeventsHandlerEvents);
          }.bind(this));
          delete eventsHandlers[this.id];
          this._opts.eventsHandler = false;
          Video._eventsHandler_count--;
        }
        break;
      }

      return;

    }

    eventsHandler.forEach(function(item) {
      Video._events.forEach(function(event) {
        this.$el.off(event, Video._processeventsHandlerEvents);
      }.bind(this));
    }.bind(this));
    delete eventsHandlers[this.id];
    this._opts.eventsHandler = false;
    Video._eventsHandler_count--;

  },

  destroy: chain(Video[p].destroy, function(destroy) {
    this.removeEventsHandler();
    destroy();
  })

});