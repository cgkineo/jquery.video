var extend = function(subject) {
  for (var i = 1, l = arguments.length; i < l; i++) {
    var arg = arguments[i];
    for (var k in arg) {
      subject[k] = arg[k];
    }
  }
  return subject;
};