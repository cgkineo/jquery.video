var CopyModifyStream = Video.Stream.extend({

  constructor: function CopyModifyStream() {},

  next: function(data, fromStream) {
    this.frame.copy(data);
    this.push(this.frame);
  }

});

Video.CopyModifyStream = CopyModifyStream;
