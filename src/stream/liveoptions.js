Media.Stream.LiveOptions = Class.extend({

  constructor: function LiveOptions(options) {
    var createProperty = function(name, value) {
      Object.defineProperty(this, '_'+name, {
        value: value,
        writable: true,
        enumerable: false
      });
      return {
        set: function(value) {
          this['_'+name] = value;
          this.trigger("changed", name, value);
        },
        get: function() {
          return this['_'+name];
        },
        enumerable: true
      };
    }.bind(this);
    var props = {};
    for (var k in options) {
        props[k] = createProperty(k, options[k]);
    }
    Object.defineProperties(this, props);
  }

});
