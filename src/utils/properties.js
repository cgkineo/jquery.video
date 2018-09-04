/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   $set: {
 *     propName: function(value) {
 *       this._propName = value;
 *     }
 *   },
 *   $get: {
 *     propName: function() {
 *       return this._propName;
 *     }
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls) {
  var props = {};
  if (cls.$set) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].set = cls.$set[k];
    }
  }
  if (cls.$get) {
    for (var k in cls.$set) {
      props[k] = props[k] || {};
      props[k].get = cls.$set[k];
    }
  }
  Object.defineProperties(cls, props);
  return cls;
};
