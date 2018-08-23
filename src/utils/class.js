var Class = function(prototype, parent) {
  var c = prototype.constructor || function() {};
  extend(c.prototype, Events, prototype || {});
  extend(c, Events, parent || {});
  properties(c.prototype);
  properties(c);
  return c;
};
