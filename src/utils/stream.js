/*
TODO: Make sure to cascade wait for piping
*/
var Stream = Class.extend({

  constructor: function Stream() {},

  pipe: function(stream) {
    this.next = this.next.bind(this);
    this.start = this.start.bind(this);
    this._to = stream;
    delay(this.start, 1);
    return stream;
  },

  start: function() {
    this._start();
  },

  _start: function() {},

  next: function(data) {
    this._next(data, function(data) {
      this.push(data);
    }.bind(this));
  },

  _next: function(data, callback) {
    callback(data);
  },

  push: function(data) {
    this._to.next(data);
  }

});

Video.Stream = Stream;

