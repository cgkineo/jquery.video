var Elements = List.extend({

  subject: document,

  constructor: function Elements(selector) {
    this.add(selector);
  },

  add: function(selector) {
    if (selector instanceof HTMLElement) {
      this.push(selector);
      return;
    }
    if (selector instanceof Array) {
      for (var i = 0, l = selector.length; i < l; i++) {
        this.add(selector[i]);
      }
      return;
    }
    if (typeof selector === "string") {
      var elements = this.subject.querySelectorAll(selector);
      for (var i = 0, l = elements.length; i < l; i++) {
        this.push(elements[i]);
      }
      return;
    }
  },

  on: function(name, callback, options) {
    if (name instanceof Object) {
      for (var k in name) {
        this.on(k, name[k], callback);
      }
      return this;
    }
    this.forEach(function(element) {
      element.addEventListener(name, callback, options);
    });
    return this;
  },

  off: function(name, callback) {
    if (name instanceof Object) {
      for (var k in name) {
        this.off(k, name[k]);
      }
      return this;
    }
    this.forEach(function(element) {
      element.removeEventListener(name, callback);
    });
    return this;
  },

  groupByAttributes: function(attributes) {
    var groups = {};
    var subjects = [];
    var tempSubjects = [groups];
    if (!(attributes instanceof Array)) {
      attributes = toArray(arguments);
    }
    if (!attributes || !attributes.length) return groups;
    var values = new Array(attributes.length);
    for (var i = 0, l = this.length; i < l; i++) {
      var obj = this[i];
      subjects = tempSubjects;
      tempSubjects = [];
      for (var a = 0, al = attributes.length; a < al; a++) {
        var isAtEnd = (a === al - 1);
        var attrNames = attributes[a].split(" ");
        for (var an = 0, anl = attrNames.length; an < anl; an++) {
          var attrName = attrNames[an];
          var attrValue = obj.getAttribute(attrName);
          if (attrValue === null) continue;
          var values = String(attrValue).split(" ");
          for (var v = 0, vl = values.length; v < vl; v++) {
            var value = values[v];
            for (var s = 0, sl = subjects.length; s < sl; s++) {
              var subject = subjects[s];
              tempSubjects.push(subject[value] = subject[value] || (isAtEnd ? [] : {}));
            }
          }
        }
        subjects = tempSubjects;
        tempSubjects = [];
      }
      for (var s = 0, sl = subjects.length; s < sl; s++) {
        var subject = subjects[s];
        subject.push(obj);
      }
      tempSubjects = [groups];
    }
    return groups;
  }

}, {

});

var elements = function(selector) { return new Elements(selector); };
extend(elements, Elements);
