var toArray = function(args, start) {
  if (!args) return [];
  return Array.prototype.slice.call(args, start || 0);
};

var isArray = function(obj) {
  return Object.prototype.toString.call(obj) == '[object Array]';
};
