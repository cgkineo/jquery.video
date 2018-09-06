var Events = {

  _listeningTo: null,
  _eventsId: 0,
  _events: null,

  listenTo: function(subject, name, callback) {
    if (!subject._eventsId) subject._eventsId = ++Events._eventsId;
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    if (!this._listeningTo) this._listeningTo = {};
    this._listeningTo[subject._eventsId] = subject;
    subject.on(name, callback, this);
    this._listeningTo[subject.id] = true;
    return this;
  },

  listenToOnce: function(subject, name, callback) {
    if (!subject._eventsId) subject._eventsId = ++Events._eventsId;
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    if (!this._listeningTo) this._listeningTo = {};
    this._listeningTo[subject._eventsId] = subject;
    subject.once(name, callback, this);
    this._listeningTo[subject.id] = true;
    return this;
  },

  stopListening: function(subject, name, callback) {
    // check turn on listening on subject and this
    if (!subject) {
      if (!this._listeningTo) return;
      for (var k in this._listeningTo) {
        this._listeningTo[k].off(name, callback, this);
        // do clearup here
      }
      return;
    }
    if (!name) {
      if (!this._listeningTo[subject._eventsId]) return;
      this._listeningTo[subject._eventsId].off(name, callback, this);
      // do clearup
      return;
    }
    subject.off(name, callback);
    return this;
  },

  on: function(name, callback, subject) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.on(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.on(k, name[k], subject || callback);
        return this;
    }
    this._events = this._events || {};
    this._events[name] = this._events[name] || [];
    this._events[name].push({
      subject: subject || this,
      callback: callback,
      once: false
    });
    return this;
  },

  once: function(name, callback, subject) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.once(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.on(k, name[k], subject || callback);
        return this;
    }
    this._events = this._events || {};
    this._events[name] = this._events[name] || [];
    this._events[name].push({
      subject: subject || this,
      callback: callback,
      once: true
    });
    return this;
  },

  off: function(name, callback, subject) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    switch (typeof name) {
      case "string":
        var events = name.split(" ");
        if (events.length > 1) {
          events.forEach(function(name) {
            this.off(name, callback, subject);
          }.bind(this));
          return this;
        }
        break;
      case "object":
        for (var k in name) this.off(k, name[k], subject);
        return this;
    }
    if (!name) {
      this._events = null;
      return this;
    }
    if (!this._events) return this;
    if (!this._events[name]) return this;
    for (var i = this._events[name].length-1; i > -1; i--) {
      if (callback && this._events[name][i].callback !== callback) continue;
      if (subject && this._events[name][i].subject !== subject) continue;
      this._events[name].splice(0, i);
    }
    if (!this._events[name].length) delete this._events[name];
    return this;
  },

  trigger: function(name) {
    if (!this._eventsId) this._eventsId = ++Events._eventsId;
    if (!name) return this;
    if (!this._events) return this;
    if (!this._events[name]) return;
    var args = toArray(arguments, 1);
    var remove = [];
    for (var i = 0, l = this._events[name].length; i < l; i++) {
      var handler = this._events[name][i];
      handler.callback.apply(handler.subject, args);
      if (handler.once) remove.unshift(i);
    }
    for (var i = 0, l = remove.length; i < l; i++) {
      this._events[name].splice(remove[i], 1);
    }
    if (!this._events[name].length) delete this._events[name];
  },

  destroy: function() {
    this.off();
  }

};
