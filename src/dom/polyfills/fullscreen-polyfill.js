(function() {

  var debug = true;

  var isObject = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Object]';
  };

  var extend = function(obj) {
    for (var i = 1, l = arguments.length; i < l; i++) {
      var arg = arguments[i];
      for (var k in arg) {
        obj[k] = arg[k];
      }
    }
    return obj;
  };

  var defaults = function(subject) {
    subject = subject || {};
    for (var i = 1, l = arguments.length; i < l; i++) {
      var arg = arguments[i];
      for (var k in arg) {
        if (!subject.hasOwnProperty(k)) subject[k] = arg[k];
        if (!isObject(subject[k])) continue;
        subject[k] = defaults(subject[k], arg[k]);
      }
    }
    return subject;
  };

  var toArray = function(args, start) {
    if (!args) return [];
    return Array.prototype.slice.call(args, start || 0);
  };

  var includes = function(value, search, start) {
    if (typeof start !== 'number') start = 0;
    if (typeof value === "string" && start + search.length > value.length) return false;
    return value.indexOf(search, start) !== -1;
  };

  var createEvent = function(name) {
    if (!createEvent._ie11) {
      try {
        var event = new Event(name);
        return event;
      } catch (e) {
        createEvent._ie11 = true;
      }
    }
    if (!createEvent._ie11) return;
    var event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
  };

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
      var api = false;
      for (var i = 0, l = classList.length; i < l; i++) {
        var classItem = classList[i];
        if (classItem !== nameItem) continue;
        api = true;
      }
      if (!api && bool) classList.add(nameItem);
      else if (api && !bool) classList.remove(nameItem);
    }
  };

  var removeElement = function(element) {
    if (element.remove) return element.remove();
    element.parentNode.removeChild(element);
  };

  var api = {
    fullscreenElement: null,
    exitFullscreen: null,
    requestFullscreen: null,
    fullscreenEnabled: null,
    onfullscreenchange: null,
    onfullscreenerror: null
  };

  var alternativeNames = {
    fullscreenElement: [
      "webkitFullscreenElement",
      "mozFullScreenElement",
      "msFullscreenElement"
    ],
    exitFullscreen: [
      "webkitExitFullscreen",
      "mozCancelFullScreen",
      "msExitFullscreen"
    ],
    requestFullscreen: [
      "webkitRequestFullscreen",
      "mozRequestFullScreen",
      "msRequestFullscreen"
    ],
    fullscreenEnabled: [
      "webkitFullscreenEnabled",
      "mozFullScreenEnabled",
      "msFullscreenEnabled"
    ],
    onfullscreenchange: [
      "onwebkitfullscreenchange",
      "onmozfullscreenchange",
      "onmsfullscreenchange"
    ],
    onfullscreenerror: [
      "onwebkitfullscreenerror",
      "onmozfullscreenerror",
      "onmsfullscreenerror"
    ],
    fullscreenchange: [
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "msfullscreenchange"
    ],
    fullscreenerror: [
      "webkitfullscreenerror",
      "mozfullscreenerror",
      "msfullscreenerror"
    ]
  };

  var proxiedEventListeners = false;
  function proxyEventListener() {
    if (proxiedEventListeners) return;
    proxiedEventListeners = true;
    var redirectFullScreenChange = function (event) {
      event = defaults(createEvent('fullscreenchange'), event);
      document.dispatchEvent(event);
    };
    var redirectFullScreenError = function (event) {
      event = defaults(createEvent('fullscreenerror'), event);
      document.dispatchEvent(event);
    };
    for (var i = 0, l = alternativeNames.onfullscreenchange.length; i < l; i++) {
      if (document[alternativeNames.onfullscreenchange[i]] === undefined) continue;
      document[alternativeNames.onfullscreenchange[i]] = redirectFullScreenChange;
    }
    for (var i = 0, l = alternativeNames.onfullscreenerror.length; i < l; i++) {
      if (document[alternativeNames.onfullscreenerror[i]] === undefined) continue;
      document[alternativeNames.onfullscreenerror[i]] = redirectFullScreenError;
    }
  }

  var isAllSame = true;
  var isAllFound = true;

  var check = function(el, apiName, callback) {
    if (el[apiName] !== undefined) {
      api[apiName] = apiName;
      return;
    }
    for (var i = 0, l = alternativeNames[apiName].length; i < l; i++) {
      var knownAlternative = alternativeNames[apiName][i];
      if (el[knownAlternative] === undefined) continue;
      isAllSame = false;
      api[apiName] = knownAlternative;
      return;
    }
    isAllSame = false;
    isAllFound = false;
    api[apiName] = null;
  };

  var isFullWindow = false;
  var fullWindowElement = null;
  var addToElements = [];
  var removeFromElements = [];
  var requestByFullscreen = false;

  var applied = {
    fullscreenElement: false,
    fullscreenEnabled: false,
    exitFullscreen: false,
    requestFullscreen: false,
    onfullscreenchange: false,
    onfullscreenerror: false
  };

  function fixFullScreenElement() {
    if (applied.fullscreenElement) return;
    applied.fullscreenElement = true;
    Object.defineProperty(document, "fullscreenElement", {
      get: function() {
        if (isFullWindow) {
          debug && console.log("get fullscreenElement", fullWindowElement);
          return fullWindowElement;
        }
        debug && console.log("get fullscreenElement", document[api["fullscreenElement"]]);
        return document[api["fullscreenElement"]];
      }
    });
  }

  function fixFullScreenEnabled() {
    if (applied.fullscreenEnabled) return;
    applied.fullscreenEnabled = true;
    Object.defineProperty(document, "fullscreenEnabled", {
      get: function() {
        if (isFullWindow) {
          debug && console.log("get fullscreenEnabled", true);
          return true;
        }
        debug && console.log("get fullscreenEnabled", document[api["fullscreenEnabled"]]);
        return document[api["fullscreenEnabled"]];
      }
    });
  }

  function fixExitFullScreen() {
    if (applied.exitFullscreen) return;
    applied.exitFullscreen = true;
    document.exitFullscreen = function() {
      debug && console.log("exitFullscreen");
      if (isFullWindow) {
        fullWindowElement = null;
        document.dispatchEvent(createEvent("fullscreenchange"));
        return;
      }
      return document[api.exitFullscreen].apply(this, arguments);
    }
  }

  function fixRequestFullScreen() {
    if (applied.requestFullscreen) return;
    applied.requestFullscreen = true;
    Element.prototype.requestFullscreen = function(options) {
      requestByFullscreen = defaults(extend({}, options), {
        style: "contain",
        height: this.clientHeight,
        width: this.clientWidth,
        element: this
      });
      debug && console.log("requestFullscreen", this);
      if (isFullWindow) {
        fullWindowElement = this;
        document.dispatchEvent(createEvent("fullscreenchange"));
        return;
      }
      return this[api.requestFullscreen].apply(this, arguments);
    };
  }

  function fixOnFullScreenChange() {
    if (applied.onfullscreenchange) return;
    applied.onfullscreenchange = true;
    Object.defineProperty(document, "onfullscreenchange", {
      get: function() {
        debug && console.log("get onfullscreenchange", document[api["onfullscreenchange"]]);
        return document[api["onfullscreenchange"]];
      },
      set: function(value) {
        debug && console.log("set onfullscreenchange", document[api["onfullscreenchange"]]);
        document[api["onfullscreenchange"]] = value;
      }
    });
  }

  function fixOnFullScreenError() {
    if (applied.onfullscreenerror) return;
    applied.onfullscreenerror = true;
    Object.defineProperty(document, "onfullscreenerror", {
      get: function() {
        debug && console.log("get onfullscreenerror", document[api["onfullscreenerror"]]);
        return document[api["onfullscreenerror"]];
      },
      set: function(value) {
        debug && console.log("set onfullscreenerror", document[api["onfullscreenerror"]]);
        document[api["onfullscreenerror"]] = value;
      }
    });
  }

  function fixFullScreenStyle() {
    var head = document.querySelector('head');
    var style = document.createElement("style");
    style.setAttribute("id", "polyfill--fullscreen");
    style.textContent = '\
.polyfill--fullscreen-overflowhidden-fullwindow,\
.polyfill--fullscreen-overflowhidden {\
  overflow: hidden !important;\
}\
.polyfill--fullscreen:before {\
  content: " ";\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: -1;\
}\
.polyfill--fullscreen {\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: 999;\
}\
.polyfill--fullscreen-fullwindow:before {\
  content: " ";\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: -1;\
}\
.polyfill--fullscreen-fullwindow {\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  z-index: 999;\
  background: black;\
}\
';
    head.appendChild(style);
  }

  function wrapElement(element) {
    toggleClass(element, "polyfill--fullscreen" + (isFullWindow ? "-fullwindow" : ""), true);
    toggleClass(document.body, "polyfill--fullscreen-overflowhidden" + (isFullWindow ? "-fullwindow" : ""), true);
  }

  function unwrapElement(element) {
    toggleClass(document.body, "polyfill--fullscreen-overflowhidden", false);
    toggleClass(document.body, "polyfill--fullscreen-overflowhidden-fullwindow", false);
    toggleClass(element, "polyfill--fullscreen", false);
    toggleClass(element, "polyfill--fullscreen" + (isFullWindow ? "-fullwindow" : ""), false);
  }

  document.addEventListener("fullscreenchange", function(event) {
    if (removeFromElements.length) {
      for (var i = 0, l = removeFromElements.length; i < l; i++) {
        unwrapElement(removeFromElements[i]);
      }
      removeFromElements.length = 0;
    }
    if (document.fullscreenElement && requestByFullscreen) {
      var element = document.fullscreenElement;
      wrapElement(element);
      removeFromElements.push(element);
      requestByFullscreen = false;
    }
    debug && console.log("fullscreenchange", document.fullscreenElement, event);
  });

  document.addEventListener("fullscreenerror", function(event) {
    requestByFullscreen = false;
    debug && console.log("fullscreenerror", document.fullscreenElement, event);
    isFullWindow = true;
    //document.exitFullscreen && document.exitFullscreen();
    document.exitFullscreen && document.exitFullscreen();
  });

  check(document, "fullscreenElement");
  check(document, "exitFullscreen");
  check(Element.prototype, "requestFullscreen");
  check(document, "fullscreenEnabled");
  check(document, "onfullscreenchange");
  check(document, "onfullscreenerror");

  function onKeyUp (event) {
    if (event.keyCode !== 27) return;
    if (!fullWindowElement) return;
    if (!isFullWindow) return;
    document.exitFullscreen();
  }

  function fixEscapeKey() {
    window.removeEventListener("keyup", onKeyUp);
    window.addEventListener("keyup", onKeyUp);
  }

  proxyEventListener();

  if (document.body) {
    setTimeout(fixFullScreenStyle, 1);
  } else {
    window.addEventListener('load', fixFullScreenStyle);
  }

  fixFullScreenElement();
  fixFullScreenEnabled();
  fixExitFullScreen();
  fixRequestFullScreen();
  fixOnFullScreenChange();
  fixOnFullScreenError();
  fixEscapeKey();

  isFullWindow = !document.fullscreenEnabled;

  window['fullscreenPolyfill'] = {};
  Object.defineProperties(window['fullscreenPolyfill'], {
    isFullWindow: {
      get: function() {
        return isFullWindow;
      },
      set: function(value) {
        isFullWindow = value;
      },
      enumerable: true
    },
    api: {
      get: function() {
        return api;
      },
      enumerable: true
    },
    applied: {
      get: function() {
        return applied;
      },
      enumerable: true
    },
    debug: {
      get: function() {
        return debug;
      },
      set: function(value) {
        debug = value;
      }
    }
  });

  if (!isAllFound) {
    console.log("Fullscreen API (from broken API).");
  } else if (isAllSame) {
    console.log("Fullscreen API (from perfect API).");
  } else {
    console.log("Fullscreen API (from partially implemented API).");
  }

})();
