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
      event = defaults(createEvent('fullscreenchange2'), event);
      document.dispatchEvent(event);
    };
    var redirectFullScreenError = function (event) {
      event = defaults(createEvent('fullscreenerror2'), event);
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
  var requestByFullscreen2 = false;

  var applied = {
    fullscreenElement2: false,
    fullscreenEnabled2: false,
    exitFullscreen2: false,
    requestFullscreen2: false,
    onfullscreenchange2: false,
    onfullscreenerror2: false
  };

  function fixFullScreenElement() {
    if (applied.fullscreenElement2) return;
    applied.fullscreenElement2 = true;
    Object.defineProperty(document, "fullscreenElement2", {
      get: function() {
        if (isFullWindow) {
          debug && console.log("get fullscreenElement2", fullWindowElement);
          return fullWindowElement;
        }
        debug && console.log("get fullscreenElement2", document[api["fullscreenElement"]]);
        return document[api["fullscreenElement"]];
      }
    });
  }

  function fixFullScreenEnabled() {
    if (applied.fullscreenEnabled2) return;
    applied.fullscreenEnabled2 = true;
    Object.defineProperty(document, "fullscreenEnabled2", {
      get: function() {
        if (isFullWindow) {
          debug && console.log("get fullscreenEnabled2", true);
          return true;
        }
        debug && console.log("get fullscreenEnabled2", document[api["fullscreenEnabled"]]);
        return document[api["fullscreenEnabled"]];
      }
    });
  }

  function fixExitFullScreen() {
    if (applied.exitFullscreen2) return;
    applied.exitFullscreen2 = true;
    document.exitFullscreen2 = function() {
      debug && console.log("exitFullscreen2");
      if (isFullWindow) {
        fullWindowElement = null;
        document.dispatchEvent(createEvent("fullscreenchange2"));
        return;
      }
      return document[api.exitFullscreen].apply(this, arguments);
    }
  }

  function fixRequestFullScreen() {
    if (applied.requestFullscreen2) return;
    applied.requestFullscreen2 = true;
    Element.prototype.requestFullscreen2 = function(options) {
      requestByFullscreen2 = defaults(extend({}, options), {
        style: "contain",
        height: this.clientHeight,
        width: this.clientWidth,
        element: this
      });
      debug && console.log("requestFullscreen2", this);
      if (isFullWindow) {
        fullWindowElement = this;
        document.dispatchEvent(createEvent("fullscreenchange2"));
        return;
      }
      return this[api.requestFullscreen].apply(this, arguments);
    };
  }

  function fixOnFullScreenChange() {
    if (applied.onfullscreenchange2) return;
    applied.onfullscreenchange2 = true;
    Object.defineProperty(document, "onfullscreenchange2", {
      get: function() {
        debug && console.log("get onfullscreenchange2", document[api["onfullscreenchange"]]);
        return document[api["onfullscreenchange"]];
      },
      set: function(value) {
        debug && console.log("set onfullscreenchange2", document[api["onfullscreenchange"]]);
        document[api["onfullscreenchange"]] = value;
      }
    });
  }

  function fixOnFullScreenError() {
    if (applied.onfullscreenerror2) return;
    applied.onfullscreenerror2 = true;
    Object.defineProperty(document, "onfullscreenerror2", {
      get: function() {
        debug && console.log("get onfullscreenerror2", document[api["onfullscreenerror"]]);
        return document[api["onfullscreenerror"]];
      },
      set: function(value) {
        debug && console.log("set onfullscreenerror2", document[api["onfullscreenerror"]]);
        document[api["onfullscreenerror"]] = value;
      }
    });
  }

  function fixFullScreenStyle() {
    var head = document.querySelector('head');
    var style = document.createElement("style");
    style.setAttribute("id", "polyfill--fullscreen");
    style.textContent = '\
.polyfill--fullscreen-overflowhidden {\
  overflow: hidden !important;\
}\
.polyfill--fullscreen2-wrapper {\
  display: inline-block;\
  position: fixed;\
  top: 50%;\
  left: 50%;\
  transform: translate(-50%,-50%);\
}\
.polyfill--fullscreen2:before {\
  content: " ";\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: -1;\
}\
.polyfill--fullscreen2 {\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: 999;\
}\
.polyfill--fullscreen2-fullwindow:before {\
  content: " ";\
  position: fixed;\
  top: 0;\
  left: 0;\
  width: 100vw;\
  height: 100vh;\
  background: black;\
  z-index: -1;\
}\
.polyfill--fullscreen2-fullwindow {\
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
    toggleClass(element, "polyfill--fullscreen2" + (isFullWindow ? "-fullwindow" : ""), true);
    var wrapper = document.createElement('div');
    wrapper.classList.add("polyfill--fullscreen2-wrapper");
    do {
      wrapper.appendChild(element.childNodes[0]);
    } while (element.childNodes.length)
    element.appendChild(wrapper);
    if (!requestByFullscreen2 || !requestByFullscreen2.height || !requestByFullscreen2.width) return;
    setTimeout(fullscreenResize, 100);
  }

  function fullscreenResize() {
    var element = document.fullscreenElement2;
    if (!element || !requestByFullscreen2) return;
    var wrapper = element.querySelector(".polyfill--fullscreen2-wrapper");
    if (!wrapper) return;
    switch (requestByFullscreen2.style) {
      case "cover":
        wrapper.style.height = "100%";
        wrapper.style.width = "100%";
        break;
      default:
        var ratio = requestByFullscreen2.width / requestByFullscreen2.height;
        var elRatio = element.clientWidth / element.clientHeight;
        var width;
        var height;
        if (ratio > elRatio) {
          width = element.clientWidth;
          height = width / ratio;
        } else {
          height = element.clientHeight;
          width = height * ratio;
        }
        wrapper.style.height = height+"px";
        wrapper.style.width = width+"px";
        break;
    }
    toggleClass(document.body, "polyfill--fullscreen-overflowhidden", true);
  }

  window.addEventListener("resize", fullscreenResize);

  function unwrapElement(element) {
    toggleClass(document.body, "polyfill--fullscreen-overflowhidden", false);
    toggleClass(element, "polyfill--fullscreen2", false);
    toggleClass(element, "polyfill--fullscreen2" + (isFullWindow ? "-fullwindow" : ""), false);
    var wrapper = element.querySelector(".polyfill--fullscreen2-wrapper");
    if (!wrapper) return;
    do {
      element.appendChild(wrapper.childNodes[0]);
    } while (wrapper.childNodes.length)
    removeElement(wrapper);
  }

  document.addEventListener("fullscreenchange2", function(event) {
    if (removeFromElements.length) {
      for (var i = 0, l = removeFromElements.length; i < l; i++) {
        unwrapElement(removeFromElements[i]);
      }
      removeFromElements.length = 0;
    }
    if (document.fullscreenElement2 && requestByFullscreen2) {
      var element = document.fullscreenElement2;
      wrapElement(element);
      removeFromElements.push(element);
    } else {
      requestByFullscreen2 = false;
    }
    debug && console.log("fullscreenchange2", document.fullscreenElement2, event);
  });

  document.addEventListener("fullscreenerror2", function(event) {
    requestByFullscreen2 = false;
    debug && console.log("fullscreenerror2", document.fullscreenElement2, event);
    isFullWindow = true;
    document.exitFullscreen && document.exitFullscreen();
    document.exitFullscreen2 && document.exitFullscreen2();
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
    document.exitFullscreen2();
  }

  function fixEscapeKey() {
    window.removeEventListener("keyup", onKeyUp);
    window.addEventListener("keyup", onKeyUp);
  }

  window['fullscreen2Polyfill'] = {};
  Object.defineProperties(window['fullscreen2Polyfill'], {
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
    console.log("Fullscreen2 API (from broken API).");
  } else if (isAllSame) {
    console.log("Fullscreen2 API (from perfect API).");
  } else {
    console.log("Fullscreen2 API (from partially implemented API).");
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

})();
