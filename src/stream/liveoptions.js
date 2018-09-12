var LiveOptions = Class.extend({

  constructor: function LiveOptions(options) {
    var createProperty = function(name, value) {
      this['_'+name] = value;
      return {
        set: function(value) {
          this['_'+name] = value;
          this.trigger("changed", name, value);
        },
        get: function() {
          return this['_'+name];
        }
      };
    }.bind(this);
    var props = {};
    for (var k in options) {
        props[k] = createProperty(k, options[k]);
    }
    Object.defineProperties(this, props);
  }

});

Media.LiveOptions = LiveOptions;
