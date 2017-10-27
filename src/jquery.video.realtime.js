var raf = function(cb, timeslice) {
  //return setTimeout(cb, timeslice);
  return window.requestAnimationFrame(cb);
};

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
    if (now - Video._lastRealTimeEvent < Video._minRealTimeInterval) return raf(Video._processRealtimeEvents, Video._minRealTimeInterval);
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
        this._opts._hasfinished = false;
        if (!this.el.loop && Math.floor(this.el.currentTime*10) >= Math.floor(this.el.duration*10)) {
          this.el.currentTime = 0;
        }
        this._opts._inpreplay = true;
        Video._addRealtime(this);
        break;
      case "play":
        this._opts._hasfinished = false;
        Video._addRealtime(this);
        this._opts._inpreplay = false;
        break;
      case "finish":
        this._opts._hasfinished = true;
      case "pause": 
        Video._removeRealtime(this);
        this._opts._inpreplay = false;
        if (!this.el.loop && !this._opts._hasfinished && Math.floor(this.el.currentTime*10) >= Math.floor(this.el.duration*10)) {
          setTimeout(function() {
            if (!this.$el) return;
            if (this._opts._hasfinished) return;
            this._opts._hasfinished = true;
            this.$el.trigger("finish");
          }.bind(this), 100);
        }
        break;
      case "timeupdate":
        this._opts._hasfinished = false;
        this._opts._inpreplay = false;
        if (!this.el.loop && !this.el.paused && Math.floor(this.el.currentTime*10) >= Math.floor(this.el.duration*10)) {
          Video._removeRealtime(this);
          this.el.currentTime = this.el.duration;
          this.el.pause();
          setTimeout(function() {
            if (!this.$el) return;
            if (this._opts._hasfinished) return;
            this._opts._hasfinished = true;
            this.$el.trigger("finish");
          }.bind(this), 100);
        }
        break;
    }
  },

  _stop_realtime: function() {
    this.removeEventsHandler(this._realtime_events);
    Video._removeRealtime(this);
    setTimeout(function() {
      if (!this.el) return;
      this.$el.trigger("timeupdate");
    }.bind(this), 100);
  },

  destroy: chain(Video[p].destroy, function(destroy) {
    this._stop_realtime();
    destroy();
  })

});