(function() {

  var debug = false;

  var extend = function(obj) {
    for (var i = 1, l = arguments.length; i < l; i++) {
      var arg = arguments[i];
      for (var k in arg) {
        obj[k] = arg[k];
      }
    }
    return obj;
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
      if (event.type === "fullscreenchange") return;
      event = extend(createEvent('fullscreenchange'), event);
      document.dispatchEvent(createEvent('fullscreenchange'));
    };
    var redirectFullScreenError = function (event) {
      if (event.type === "fullscreenerror") return;
      event = extend(createEvent('fullscreenerror'), event);
      document.dispatchEvent(event);
    };
    for (var i = 0, l = alternativeNames.onfullscreenchange.length; i < l; i++) {
      document[alternativeNames.onfullscreenchange[i]] = redirectFullScreenChange;
    }
    for (var i = 0, l = alternativeNames.onfullscreenerror.length; i < l; i++) {
      document[alternativeNames.onfullscreenerror[i]] = redirectFullScreenError;
    }
    document._addEventListener = document.addEventListener;
    document._removeEventListener = document.removeEventListener;
    document.addEventListener = function() {
      var args = toArray(arguments);
      document._addEventListener.apply(this, args);
      if (includes(alternativeNames.fullscreenchange, args[0])) {
        args[0] = "fullscreenchange";
        document._addEventListener.apply(this, args);
      } else if (includes(alternativeNames.fullscreenerror, args[0])) {
        args[0] = "fullscreenerror";
        document._addEventListener.apply(this, args);
      }
    };
    document.removeEventListener = function(name) {
      var args = toArray(arguments);
      document._removeEventListener.apply(this, args);
      if (includes(alternativeNames.fullscreenchange, args[0])) {
        args[0] = "fullscreenchange";
        document._removeEventListener.apply(this, args);
      } else if (includes(alternativeNames.fullscreenerror, args[0])) {
        args[0] = "fullscreenerror";
        document._removeEventListener.apply(this, args);
      }
    };
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
        if (fullWindowElement) {
          toggleClass(fullWindowElement, "polyfill--fullscreen", false);
        }
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
    Element.prototype.requestFullscreen = function() {
      debug && console.log("requestFullscreen", this);
      if (isFullWindow) {
        fullWindowElement = this;
        toggleClass(this, "polyfill--fullscreen", true);
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
      .polyfill--fullscreen:before {\
        content: " ";\
        position: fixed;\
        top: 0;\
        left: 0;\
        bottom: 0;\
        right: 0;\
        background: black;\
        z-index: -1;\
      }\
      .polyfill--fullscreen {\
        position: fixed;\
        top: 0;\
        left: 0;\
        right: 0;\
        bottom: 0;\
        z-index: 999;\
        background: black;\
      }\
    ';
    head.appendChild(style);
  }

  document.addEventListener("fullscreenchange", function(event) {
    debug && console.log("fullscreenchange", document.fullscreenElement, event);
  });

  document.addEventListener("fullscreenerror", function(event) {
    debug && console.log("fullscreenerror", document.fullscreenElement, event);
    switchToFullWindow();
  });

  check(document, "fullscreenElement");
  check(document, "exitFullscreen");
  check(Element.prototype, "requestFullscreen");
  check(document, "fullscreenEnabled");
  check(document, "onfullscreenchange");
  check(document, "onfullscreenerror");

  function switchToFullWindow() {
    if (isFullWindow) return;
    window.addEventListener("keyup", function(event) {
      if (event.keyCode !== 27) return;
      if (!fullWindowElement) return;
      document.exitFullscreen();
    });
    if (document.body) {
      setTimeout(fixFullScreenStyle, 1);
    } else {
      window.addEventListener('load', fixFullScreenStyle);
    }
    document.exitFullscreen && document.exitFullscreen();
    isFullWindow = true;
    fixFullScreenElement();
    fixFullScreenEnabled();
    fixExitFullScreen();
    fixRequestFullScreen();
    fixOnFullScreenChange();
    fixOnFullScreenError();
    proxyEventListener();
    document.exitFullscreen();
  }

  window['polyfill--fullscreen'] = {
    switchToFullWindow: switchToFullWindow
  };
  Object.defineProperties(window['polyfill--fullscreen'], {
    isFullWindow: {
      get: function() {
        return isFullWindow;
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
    console.log("Fullscreen API is broken, replacing.");
    switchToFullWindow();
    return;
  } else if (isAllSame) {
    console.log("Fullscreen API is perfect.");
    return;
  } else {
    console.log("Fullscreen API is partially implemented, fixing.");
    proxyEventListener();
  }

  if (api["fullscreenElement"] !== "fullscreenElement") fixFullScreenElement();
  if (api["fullscreenEnabled"] !== "fullscreenEnabled") fixFullScreenEnabled();
  if (api["exitFullscreen"] !== "exitFullscreen") fixExitFullScreen();
  if (api["requestFullscreen"] !== "requestFullscreen") fixRequestFullScreen();
  if (api["onfullscreenchange"] !== "onfullscreenchange") fixOnFullScreenChange();
  if (api["onfullscreenerror"] !== "onfullscreenerror") fixOnFullScreenError();

})();
