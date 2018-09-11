var delay = function(callback, time) {
  setTimeout(callback, time);
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

var bindAll = function(subject, names) {
  if (!(names instanceof Array)) {
    names = toArray(arguments, 1);
  }
  for (var i = 0, l = names.length; i < l; i++) {
    var name = names[i];
    if (!(subject[name] instanceof Function)) continue;
    subject[name] = subject[name].bind(subject);
  }
};
