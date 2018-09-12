var extend = function(subject) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      subject[k] = arg[k];
    }
  }
  return subject;
};

var defaults = function(subject) {
  subject = subject || {};
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      if (!subject.hasOwnProperty(k)) subject[k] = arg[k];
      if (subject[k] instanceof Object && !isArray(subject[k])) {
        subject[k] = defaults(subject[k], arg[k]);
      }
    }
  }
  return subject;
};
