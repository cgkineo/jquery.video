var Stream = Class.extend({

  _destinations: null,
  _sources: null,
  _frame: null,

  sources$get: function() {
    return this._sources = this._sources || [];
  },

  destinations$get: function() {
    return this._destinations = this._destinations || [];
  },

  constructor: function Stream() {
  },

  frame$get: function() {
    return this._frame = this._frame || new Media.Frame();
  },

  pipe: function(destinationStream, index) {
    this.destinations.push(destinationStream);
    destinationStream.into(this, index);
    return destinationStream;
  },

  into: function(sourceStream, index) {
    if (index === undefined) {
      this.sources.push(sourceStream);
    } else {
      if (this.sources.length < index+1) {
        this.sources.length = index+1;
      }
      if (this.sources[index] !== undefined) {
        this.stopListening(this.sources[index]);
      }
      this.sources[index] = sourceStream;
    }
    if (this.data) {
      this.listenTo(sourceStream, "data", this.data);
    } else if (this.next) {
      this.listenTo(sourceStream, "data", this.next);
    }
    return sourceStream;
  },

  push: function(data) {
    this.trigger("data", data, this);
  }

});

Media.Stream = Stream;

