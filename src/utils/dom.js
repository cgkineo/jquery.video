var toggleClass = function(element, classNames, bool) {
  switch (typeof classNames) {
    case "string":
      classNames = classNames.split(" ");
      break;
  }
  bool = (bool === undefined) ? true : bool;
  var classList = element.classList;
  for (var n = 0, nl = classNames.length; n < nl; n++) {
    var nameItem = classNames[n];
    var found = false;
    for (var i = 0, l = classList.length; i < l; i++) {
      var classItem = classList[i];
      if (classItem !== nameItem) continue;
      found = true;
    }
    if (!found && bool) classList.add(nameItem);
    else if (found && !bool) classList.remove(nameItem);
  }
};

var removeElement = function(element) {
  if (element.remove) element.remove();
  else element.parentNode.removeChild(element);
};

var createEvent = function(name) {
  if (!createEvent._ie11) {
    try {
      var event = new Event('timeupdate');
      return event;
    } catch (e) {
      createEvent._ie11 = true;
    }
  }
  if (!createEvent._ie11) return;
  var event = document.createEvent('Event');
  event.initEvent('timeupdate', true, true);
  return event;
};

var rAF = function(cb) {
  return window.requestAnimationFrame(cb);
};
