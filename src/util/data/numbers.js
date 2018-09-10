var clamp = function(lo, value, hi) {
  return Math.max(lo, Math.min(value, hi));
};

var isNumber = function(obj) {
  return Object.prototype.toString.call(obj) == '[object Number]';
};
