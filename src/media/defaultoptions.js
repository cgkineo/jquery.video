Media.DefaultOptions = Class.extend({

  constructor: function Options(options) {
    this.add(options);
  },

  add$value: function(options) {
    extend(this, options);
  },

  get$value: function() {
    var options = {};
    for (var name in this) {
      options[name] = this[name];
    }
    return options;
  }

}, {

  add$value$enum: function(options) {
    defaults(this.prototype, options);
  },

  get$value$enum: function() {
    var options = {};
    for (var name in this.prototype) {
      options[name] = this.prototype[name];
    }
    return options;
  }

}, {
  inheritClassEnumerables: true
});
