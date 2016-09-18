'use strict';

var EE = (function () {

  var DEFAULT_MAX_LISTENERS = 10;

  var Emitter = {};

  Emitter._addListener = function (ee, type, listener, prepend) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function.');
    }
    var handlers = ee.__events(type);
    if (handlers.length >= ee.getMaxListeners()) {
      throw new TypeError('Max "listener" count reached.');
    }
    ee.emit('newListener', type, listener.listener ? listener.listener : listener);
    if (prepend) {
      handlers.unshift(listener);
    } else {
      handlers.push(listener);
    }
    return ee;
  };

  Emitter._onceWrap = function(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    };
    g.listener = listener;
    return g;
  };

  Emitter._arrayClone = function(arr, i, e) {
    // if (!i) i = arr.length;
    // if (!e) e = 0;
    var copy = new Array(i - e);
    while (i-- > e) {
      copy[i - e] = arr[i];
    }
    return copy;
  };

  // About 1.5x faster than the two-arg version of Array.splice().
  Emitter._spliceOne = function(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
      list[i] = list[k];
    }
    list.pop();
    return list;
  };


  var EventEmitter = function () {
    var data = {
      events: {},
      maxListeners: DEFAULT_MAX_LISTENERS
    };

    Object.defineProperty(this, '__eventEmitter', {
      enumerable: false,
      writable: true,
      value: function () { return data; }
    });
  };

  EventEmitter.prototype.__events = function (type) {
    if (this.__eventEmitter().events[type] == null) { 
      this.__eventEmitter().events[type] = [];
    }
    return this.__eventEmitter().events[type];
  };

  EventEmitter.prototype.eventsNames = function () {
    var eventNames = [];
    for (var k in this.__eventEmitter().events) {
      eventNames.push(k);
    }
    return eventNames;
  };

  EventEmitter.prototype.getMaxListeners = function () {
    return this.__eventEmitter().maxListeners;
  };

  EventEmitter.prototype.setMaxListeners = function (value) {
    this.__eventEmitter().maxListeners = value;
  };

  EventEmitter.prototype.removeListener = function (type, listener) {
    var handlers = this.__events(type);
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    for (var idx = 0; idx < handlers.length; ++idx) {
      if (handlers[idx] === listener) {
        Emitter._spliceOne(handlers, idx);
        this.emit('removeListener', type, listener);
        break;
      }
    }
  };

  EventEmitter.prototype.removeAllListeners = function (type) {
    var handlers = this.__events(type);
    while (handlers.length > 0)
      handlers.pop();
  };

  EventEmitter.prototype.addListener = function (type, listener) {
    return Emitter._addListener(this, type, listener, false);
  };

  EventEmitter.prototype.prependListener  = function (type, listener) {
    return Emitter._addListener(this, type, listener, true);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.once = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    this.on(type, Emitter._onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('"listener" argument must be a function');
    }
    this.prependListener(type, Emitter._onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.emit = function (type) {
    var handlers = this.__events(type);
    if (handlers.length === 0) {
      return;
    }
    var args = Emitter._arrayClone(arguments, arguments.length, 1);
    for (var i=0; i<handlers.length; ++i) {
      handlers[i].apply(this, args);
    }
  };

  EventEmitter.prototype.listenerCount = function (type) {
    return this.__events(type).length;
  };

  return EventEmitter;
})();

if (typeof module !== 'undefined' && module.exports) {// Node.js
  module.exports = EE;
}
