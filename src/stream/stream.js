/*
TODO: Make sure to cascade wait for piping
*/
var Stream = Class.extend({

  _sources: null,
  _destinations: null,

  constructor: function Stream() {},

  pipe: function(stream) {
    if (!this._destinations) this._destinations = [];
    this._destinations.push(stream);
    stream._into(this);
    return stream;
  },

  _into: function(sourceStream) {
    if (!this._sources) this._sources = [];
    if (this.next) {
      this.listenTo(sourceStream, "data", this.next);
    }
    this._sources.push(sourceStream);
  },

  push: function(data) {
    this.trigger("data", data, this);
  }

});

Video.Stream = Stream;

