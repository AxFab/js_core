'use strict';

var EE = (function () {

  var DEFAULT_MAX_LISTENERS = 10;

  var EventEmitter = function () {
    var events = {};
    this.defaultMaxListeners = DEFAULT_MAX_LISTENERS;
    this._events = function (type) {
      if (events[type] == null) { 
        events[type] = [];
      }
      return events[type];
    };
    this.eventsNames = function () {
      var eventNames = [];
      for (var k in events) {
        eventNames.push(k);
      }
      return eventNames;
    }
  }

  EventEmitter.prototype._addListener = function (type, listener, prepend) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function.');
    }
    var handlers = this._events(type);
    if (handlers.length >= this.defaultMaxListeners) {
      throw new TypeError('Max "listener" count reached.');
    }
    this.emit('newListener', type, listener.listener ? listener.listener : listener);
    if (prepend) {
      handlers.unshift(listener);
    } else {
      handlers.push(listener);
    }
    return this;
  }

  EventEmitter.prototype.removeListener = function (type, listener) {
    var handlers = this._events(type);
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    for (var idx = 0; idx < handlers.length; ++idx) {
      if (handlers[idx] === listener) {
        EventEmitter._spliceOne(handlers, idx);
        this.emit('removeListener', type, listener);
        break;
      }
    }
  };

  EventEmitter.prototype.addListener = function (type, listener) {
    return this._addListener(type, listener, false);
  };

  EventEmitter.prototype.prependListener  = function (type, listener) {
    return this._addListener(type, listener, true);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.once = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    this.on(type, EventEmitter._onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    this.prependListener(type, EventEmitter._onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.emit = function (type) {
    var handlers = this._events(type);
    if (handlers.length === 0) {
      return;
    }
    var args = EventEmitter._arrayClone(arguments, arguments.length, 1);
    for (var i=0; i<handlers.length; ++i) {
      handlers[i].apply(this, args);
    }
  };

  EventEmitter.prototype.listenerCount = function (type) {
    return this._events(type).length;
  };

  EventEmitter._onceWrap = function(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  };

  EventEmitter._arrayClone = function(arr, i, e) {
    // if (!i) i = arr.length;
    // if (!e) e = 0;
    var copy = new Array(i - e);
    while (i-- > e) {
      copy[i - e] = arr[i];
    }
    return copy;
  }

  // About 1.5x faster than the two-arg version of Array.splice().
  EventEmitter._spliceOne = function(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
      list[i] = list[k];
    }
    list.pop();
    return list;
  };

  return EventEmitter;
})();

if (typeof module !== 'undefined' && module.exports) {// Node.js
  module.exports = EE;
}
