(function($) {

    // global api
    $.fn.video = function(options) {

        switch (options) {
            case "destroy":
                // tear down all video class + dom associations
                this.each(function(index, item) {
                    if (!item[$.Video._prop]) return;
                    item[$.Video._prop].destroy();
                    delete item[$.Video._prop];
                });
                return this;
        }

        // get all video tags selected and make Video instances for them
        var rtn = [];
        var $videos = this.find("video");
        $videos = $videos.add(this.filter("video"));
        $videos.each(function(index, item) {
            if (!item[$.Video._prop]) {
                new $.Video($(item), options);
            }
            rtn.push(item[$.Video._prop]);
        });
        return rtn;

    };

    // Video class
    $.Video = function Video($el, options) {
        this.id = ++$.Video._ids;
        this.el = $el[0];
        this.$el = $el;
        this.el[$.Video._prop] = this;
        this.options = {};
        this.defaults();
        this.setOptions(options);
        this.initialize();
    };

    // Video global functions
    $.extend($.Video, {

        _ids: 0,
        _ticker_count: 0,
        _tickers: {},
        _prop: "_jqv",
        _events: ["play", "pause", "timeupdate", "finish"],

        removeTickers() {

            var tickers = $.Video._tickers;

            if (!$.Video._ticker_count) return;

            for (var id in tickers) {
                var ticker = tickers[id];
                var $el = ticker.$el;
                ticker.forEach(function(item) {
                    $.Video._events.forEach(function(event) {
                        $el.off(event, $.Video._processTickerEvents);
                    });
                });
                delete tickers[id];
                $.Video._ticker_count--;
            }

        },

        _processTickerEvents: function(event, data) {

            $.extend(event, data);

            var tickers = $.Video._tickers;

            var el = event.currentTarget;
            var id = event.currentTarget[$.Video._prop].id;
            if (!id) return;

            var ticker = tickers[id];

            if (!ticker) return;
            if (!ticker.length) return;

            var video = el[$.Video._prop];

            ticker.forEach(function(item) {
                item.callback.call(video, event, item.options)
            });
            
        }

    });

    // Video instance functions
    $.extend($.Video.prototype, {

        chain: function(func_name, callback) {
            var original = this[func_name];
            return function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    return original.apply(this, args);
                }.bind(this));
                return callback.apply(this, args);
            };
        },

        defaults: function() {},

        setOptions: function(options) {
            $.extend(this.options, options);
        },

        initialize: function() {},

        destroy: function() {
            delete this.el[$.Video._prop];
            this.id = null;
            this.el = null;
            this.$el = null;
        }

    });

    // Video ticker callback attachment
    $.extend($.Video.prototype, {

        addTicker: function(callback, options) {

            var tickers = $.Video._tickers;
        
            if (!callback) return;

            var el = this.el;

            if (!this.options.ticker) {
                this.options.ticker = true;
                tickers[el[$.Video._prop].id] = [];
                tickers[el[$.Video._prop].id].$el = this.$el;
                $.Video._events.forEach(function(event) {
                    this.$el.on(event, $.Video._processTickerEvents);
                }.bind(this));
                $.Video._ticker_count++;
            }

            var ticker = tickers[el[$.Video._prop].id];

            for (var i = 0, l = ticker.length; i < l; i++) {
                var item = ticker[i];
                if (item.callback === callback && item.context === this) return;
            }

            ticker.push({
                context: this,
                callback: callback,
                options: options
            });

        },

        removeTickers(callback) {

            var el = this.el;
            var tickers = $.Video._tickers;

            if (!this.options.ticker) return;
            if (!$.Video._ticker_count) return;

            var ticker = tickers[el[$.Video._prop].id];
            
            if (!ticker) return;
            if (!ticker.length) return;

            if (callback) {
            
                for (var i = ticker.length-1, l = -1; i > l; i--) {
                    var item = ticker[i];
                    if (item.context !== this || item.callback !== callback) continue;
                    ticker.splice(i,1);
                    if (!ticker.length) {
                        $.Video._events.forEach(function(event) {
                            this.$el.off(event, $.Video._processTickerEvents);
                        }.bind(this));
                        delete tickers[this.id];
                        this.options.ticker = false;
                        $.Video._ticker_count--;
                    }
                    break;
                }

                return;

            }

            ticker.forEach(function(item) {
                $.Video._events.forEach(function(event) {
                    this.$el.off(event, $.Video._processTickerEvents);
                }.bind(this));
            }.bind(this));
            delete tickers[this.id];
            this.options.ticker = false;
            $.Video._ticker_count--;

        },

        destroy: $.Video.prototype.chain('destroy', function(destroy) {
            this.removeTickers();
            destroy();
        })

    });


})(jQuery);