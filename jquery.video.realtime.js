(function($) {
    
    // realtime timeupdates
    // realtime global functions
    $.extend($.Video, {

        _realTimers: [],
        _lastRealTimeEvent: 0,
        _minRealTimeInterval: 62.5,

        addRealtime: function(video) {
            if (video.options.realtime) return;
            video.options.realtime = true;
            $.Video._realTimers.push(video);
            window.requestAnimationFrame($.Video._processRealtimeEvents);
        },

        checkRealtime: function() {
            window.requestAnimationFrame($.Video._processRealtimeEvents);
        },

        _processRealtimeEvents: function() {
            if (!$.Video._realTimers.length) return;
            
            var now = Date.now();
            if (now - $.Video._lastRealTimeEvent < $.Video._minRealTimeInterval) return window.requestAnimationFrame($.Video._processRealtimeEvents);
            $.Video._lastRealTimeEvent = now;

            $.Video._realTimers.forEach(function(video) {
                if (video.el.paused) return;
                video.$el.trigger("timeupdate", {
                    realtime: true
                });
            });

            window.requestAnimationFrame($.Video._processRealtimeEvents);
        },

        removeRealtime: function(video) {
            if (!video.options.realtime) return;
            video.options.realtime = false;
            for (var i = $.Video._realTimers.length -1, l = -1; i > l; i--) {
                var item = $.Video._realTimers[i];
                if (item !== video) continue;
                $.Video._realTimers.splice(i,1);
                return;
            }
        }

    });

    // realtime instance functions
    $.extend($.Video.prototype, {

        defaults: $.Video.prototype.chain("defaults", function(defaults) {
            this.setOptions({
                realtime: false
            });
            defaults();
        }),

        initialize: $.Video.prototype.chain("initialize", function(initialize) {
            if (!this.options.realtime) return initialize();
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
            this.addTicker(this._realtime_events);
            if (!this.el.paused) {
                $.Video.addRealtime(this);
            }
        },

        _realtime_events: function(event, options) {
            switch (event.type) {
                case "play":
                    if (this.options.realtime) return;
                    $.Video.addRealtime(this);
                    break;
                case "pause": case "finish":
                    if (!this.options.realtime) return;
                    $.Video.removeRealtime(this);
                    break;
            }
        },

        _stop_realtime: function() {
            this.removeTickers(this._realtime_events);
            $.Video.removeRealtime(this);
        },

        destroy: $.Video.prototype.chain('destroy', function(destroy) {
            this._stop_realtime();
            destroy();
        })

    });


})(jQuery);