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
var ClassExtend = function(proto, cls, options) {
  var parent = this;
  var child;
  // Create or pick constructor
  if (proto && proto.hasOwnProperty("constructor")) child = proto.constructor;
  else child = function Class() { return parent.apply(this, arguments); };
  // Generate new prototype chain
  child.prototype = Object.create(parent.prototype);
  // Extend constructor.prototype with prototype chain
  extend(child.prototype, proto);
  // Reassign constructor
  child.prototype.constructor = child;
  // Extend constructor with parent functions and cls properties
  extend(child, parent, cls, {
    extend: ClassExtend
  });
  // Apply properties pattern to constructor prototype
  properties(child.prototype);
  // Apply properties pattern to constructor
  properties(child);
  return child;
};

var ClassParent = function Class(proto, cls) {};
var ListParent = function List(proto, cls) {};
ListParent.prototype = new Array();

// Create base Class and List prototypes
// Add Events system to both class and instances
var Class = ClassExtend.call(ClassParent, Events, Events);
Class.List = ClassExtend.call(ListParent, Events, Events);
