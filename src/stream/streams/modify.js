var ModifyStream = Video.Stream.extend({

  constructor: function ModifyStream() {},

  _modifiers: null,
  add: function(modifier) {
    if (!this._modifiers) this._modifiers = [];
    this._modifiers.push(modifier);
  },

  next: function(data) {

    var ml = this._modifiers && this._modifiers.length;
    if (!ml) return;

    for (var m = 0; m < ml; m++) {
      this._modifiers[m].modify(data);
    }

    this.push(data);
  }

});

Video.ModifyStream = ModifyStream;
Video.Modify = Class.extend({});
