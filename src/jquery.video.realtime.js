var raf = window.requestAnimationFrame;

// realtime timeupdates
// realtime global functions
extend(Video, {

  _realTimers: [],
  _lastRealTimeEvent: 0,
  _minRealTimeInterval: 62.5,

  _addRealtime: function(video) {
    if (video._opts._realtime) return;
    video._opts._realtime = true;
    Video._realTimers.push(video);
    raf(Video._processRealtimeEvents);
  },

  _processRealtimeEvents: function() {
    if (!Video._realTimers.length) return;
    
    var now = Date.now();
    if (now - Video._lastRealTimeEvent < Video._minRealTimeInterval) return raf(Video._processRealtimeEvents);
    Video._lastRealTimeEvent = now;

    Video._realTimers.forEach(function(video) {
      if (video.el.paused && !video._opts._inpreplay) return;
      video.$el.trigger("timeupdate", {
        realtime: true
      });
    });

    raf(Video._processRealtimeEvents);
  },

  _removeRealtime: function(video) {
    if (!video._opts._realtime) return;
    video._opts._realtime = false;
    for (var i = Video._realTimers.length -1, l = -1; i > l; i--) {
      var item = Video._realTimers[i];
      if (item !== video) continue;
      Video._realTimers.splice(i,1);
      return;
    }
  }

});

// realtime instance functions
extend(Video[p], {

  defaults: chain(Video[p].defaults, function(defaults) {
    this.setOptions({
      realtime: true
    });
    defaults();
  }),

  initialize: chain(Video[p].initialize, function(initialize) {
    if (!this._opts.realtime) return initialize();
    this.realtime("start");
    initialize();
  }),

  realtime: function(command) {
    switch (command) {
      case "start":
        this._start_realtime();
        break;
      case "stop":
        this._stop_realtime();
        break;
    }
    return this;
  },

  _start_realtime: function() {
    this.addEventsHandler(this._realtime_events);
    if (this.el.paused) return;
    Video._addRealtime(this);
  },

  _realtime_events: function(event, options) {
    switch (event.type) {
      case "preplay":
        this._opts._inpreplay = true;
        Video._addRealtime(this);
        break;
      case "play":
        Video._addRealtime(this);
        this._opts._inpreplay = false;
        break;
      case "pause": case "finish":
        Video._removeRealtime(this);
        this._opts._inpreplay = false;
        break;
      case "timeupdate":
        this._opts._inpreplay = false;
        break;
    }
  },

  _stop_realtime: function() {
    this.removeEventsHandler(this._realtime_events);
    Video._removeRealtime(this);
  },

  destroy: chain(Video[p].destroy, function(destroy) {
    this._stop_realtime();
    destroy();
  })

});