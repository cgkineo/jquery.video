/**
 * A simple class implementation akin to Backbonejs.
 * var cls = Class({
 *  instanceFunction: function() {
 *    console.log("parent function");
 *  }
 * }, {
 *  classFunction: function() {
 *    console.log("class function");
 *  }
 * });
 * @param {Object} proto  An object describing the Class prototype properties.
 * @param {Object} parent An object describing the Class properties.
 */
var Class = function(proto, cls) {
  // Capture constructor function
  var c = proto.constructor === Object ?
    function() {} :
    proto.constructor;
  // Add Events and proto properties to contructor prototype
  extend(c[p], Events, proto || {});
  // Add Events and cls properties to constructor
  extend(c, Events, cls || {});
  // Apply properties pattern to constructor prototype
  properties(c[p]);
  // Apply properties pattern to constructor
  properties(c);
  return c;
};
