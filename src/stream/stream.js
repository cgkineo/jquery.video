Media.Stream = Class.extend({

  _destinations$write: null,
  _sources$write: null,
  _frame$write: null,

  sources$get$enum: function() {
    return this._sources = this._sources || [];
  },

  destinations$get$enum: function() {
    return this._destinations = this._destinations || [];
  },

  constructor: function Stream() {
  },

  frame$get$enum: function() {
    return this._frame = this._frame || new Media.Stream.Frame();
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
    this.listenTo(sourceStream, "data", this.data);
    return sourceStream;
  },

  data: function() {
    this.next.apply(this, arguments);
  },

  next: function() {},

  push: function(data) {
    this.trigger("data", data, this);
  }

}, null, {
  instanceEvents: true
});

