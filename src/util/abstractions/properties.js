/**
 * A tool for easily creating getter and setters in ES5
 * Class({
 *   propName$set: function(value) {
 *     this._propName = value;
 *   },
 *   propName$get: function() {
 *     return this._propName;
 *   }
 * });
 * @param  {Object} cls Class on which to apply properties pattern
 * @return {Object}     Return cls, modified.
 */
var properties = function(cls) {
  var props = {};
  for (var k in cls) {
    var end = k.slice(-4);
    var begin = k.slice(0,-4);
    switch (end) {
      case "$get":
        props[begin] = props[begin] || {};
        props[begin].get = cls[k];
        break;
      case "$set":
        props[begin] = props[begin] || {};
        props[begin].set = cls[k];
        break
    }
  }
  if (!Object.keys(props).length) return cls;
  Object.defineProperties(cls, props);
  return cls;
};
