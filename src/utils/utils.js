var p = "prototype";

var delay = function(callback, time) {
  setTimeout(callback, time);
};

var indexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(fromIndex) : value;
  var match = str.match(regex);
  return match ? str.indexOf(match[0]) + fromIndex : -1;
};

var lastIndexOfRegex = function(value, regex, fromIndex){
  fromIndex = fromIndex || 0;
  var str = fromIndex ? value.substring(0, fromIndex) : value;
  var match = str.match(regex);
  return match ? str.lastIndexOf(match[match.length-1]) : -1;
};

var chain = function(original, callback) {
  return function() {
    var args = Array[p].slice.call(arguments, 0);
    args.unshift(function() {
      var args = Array[p].slice.call(arguments, 0);
      return original.apply(this, args);
    }.bind(this));
    return callback.apply(this, args);
  };
};

var debounce = function(func, time) {
  var handle = null;
  return function() {
    var args = arguments;
    clearTimeout(handle);
    handle = setTimeout(function() {
      func.apply(this, args);
    }.bind(this), time || 0);
  }
};

var toArray = function(args, start) {
  return Array.prototype.slice.call(args, start || 0);
};

var extend = function(subject) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      subject[k] = arg[k];
    }
  }
  return subject;
};