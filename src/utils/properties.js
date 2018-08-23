var properties = function(object) {
  var properties = {};
  if (object.$set) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].set = object.$set[k];
    }
  }
  if (object.$get) {
    for (var k in object.$set) {
      properties[k] = properties[k] || {};
      properties[k].get = object.$set[k];
    }
  }
  Object.defineProperties(object, properties);
};
