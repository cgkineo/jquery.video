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
