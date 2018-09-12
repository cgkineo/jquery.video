var EventsInitialize = function(subject) {
  subject._eventsId = subject._eventsId || ++Events._eventsId;
  subject._events = subject._events || [];
  subject.trigger = subject.trigger || Events.trigger;
};

var EventsArgumentsNotation = function(args, cb, that) {
  args = toArray(args);
  if (args[0] instanceof Object) {
    var subject = args[1] || this;
    for (var k in args[0]) {
      var names = k.split(" ");
      for (var i = 0, l = names.length; i < l; i++) {
        var name = names[i];
        var callback = args[0][k];
        cb.call(that, name, callback, subject);
      }
    }
  } else if (typeof args[0] === "string") {
    var subject = args[2] || this;
    var names = args[0].split(" ");
    for (var i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      var callback = args[1];
      cb.call(that, name, callback, subject);
    }
  } else if (args.length === 0) {
    return cb.call(that, null, null, null);
  }
};

var EventRegister = function(options) {
  if (!options.name) return;
  if (!options.callback) return;
  EventsInitialize(options.from);
  EventsInitialize(options.to);
  this.from = options.from;
  this.to = options.to;
  this.context = options.context;
  this.name = options.name;
  this.callback = options.callback;
  this.once = options.once;
  this.from._events.push(this);
  if (this.from === this.to) return;
  this.to._events.push(this);
};
EventRegister.prototype.destroy = function() {
  this.from._events = this.from._events.filter(function(event) {
    return event !== this;
  }.bind(this));
  if (this.from === this.to) return;
  this.to._events = this.to._events.filter(function(event) {
    return event !== this;
  }.bind(this));
};

var Events = {

  _eventsId: 0,
  _events: null,

  listenTo: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      new EventRegister({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  },

  listenToOnce: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      new EventRegister({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  },

  stopListening: function(subject, name, callback) {
    var args = toArray(arguments, 1);
    args.push(subject);
    EventsArgumentsNotation(args, function(name, callback, subject) {
      for (var i = this._events.length - 1; i > -1; i--) {
        var event = this._events[i];
        if (event.to !== this) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  },

  on: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      new EventRegister({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  },

  once: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      new EventRegister({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  },

  off: function(name, callback, context) {
    EventsArgumentsNotation(arguments, function(name, callback, context) {
      for (var i = this._events.length - 1; i > -1; i--) {
        var event = this._events[i];
        if (event.from !== this) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  },

  trigger: function(name) {
    EventsInitialize(this);
    var args = toArray(arguments, 1);
    var events = this._events.filter(function(event) {
      if (event.from !== this) return;
      if (event.name !== name) return;
      return true;
    }.bind(this)).reverse();
    for (var i = events.length - 1; i > -1; i--) {
      var event = events[i];
      event.callback.apply(event.context, args);
      if (!event.once) continue;
      event.destroy();
    }
  },

  destroy: function() {
    this.stopListening();
    this.off();
  }

};
