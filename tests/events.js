

var EE = require('../lib/events.js');

var assert = function (expr) {
  if (!expr)
    throw new Error('Failed !');
};

var didThrow = function (callback) {
  try {
    callback();
    return false;
  } catch (e) {
    return true;
  }
};

var test = function (name, callback) 
{
  try {
    callback();
  } catch (e) {
    console.log ('Error at ' + name);
    throw e;
  }
};

// Test that we emit on the right arguments
test('#1', function () {
  var test = 0;
  var obj = new EE();
  obj.on('check', function (value) {
    test += value;
  });
  obj.emit('check', 3);
  obj.emit('check', 2);
  obj.emit('checked', 4);
  assert (test === 5);
  assert (obj.eventsNames().length === 3);
});


// Test that we trigger once listener only one time
test('#2', function () {
  var test = false;
  var obj = new EE();
  obj.once('check', function () {
    assert (!test);
    test = true;
  });
  obj.emit('check');
  obj.emit('check');
  assert (obj.eventsNames().length === 3);
});


// Test handling of several arguments
test('#3', function () {
  var obj = new EE();
  var sum9 = function (a, b) {
    assert (a + b === 9);
  }
  obj.on('check', sum9);
  obj.emit('check', 1, 8);
  obj.emit('check', 2, 7);
  obj.emit('check', 3, 6);
  obj.emit('check', 9, 0);
  obj.removeListener('check', sum9);
  assert (obj.eventsNames().length === 3);
});


// Test handling of several listeners
test('#4', function () {
  var test = 0;
  var obj = new EE();
  obj.on('check', function (value) {
    test += value;
  });
  obj.on('check', function (value) {
    test += value;
  });
  obj.emit('check', 1);
  assert (test === 2);
  assert (obj.eventsNames().length === 2);
});

test('#5', function () {
  var obj = new EE();
  assert(didThrow(function () {
    obj.on('check', 'Error');
  }));
  assert(didThrow(function () {
    obj.on('check', 90);
  }));
  assert(didThrow(function () {
    obj.once('check', {});
  }));
  assert(didThrow(function () {
    obj.prependOnceListener('check', []);
  }));

  assert(obj.listenerCount('check') === 0);

  obj.prependOnceListener ('check', function() {});
  assert(didThrow(function () {
    for (var i=0; i < obj.defaultMaxListeners; ++i) 
      obj.on('check', function() {});
    
  }));
  assert(didThrow(function () {
    obj.removeListener('check', 'all');
  }));

});

test('#6', function () {
  var obj = new EE();
  var handler1 = function () {};
  var handler2 = function () {};
  var handler3 = function () {};

  obj.on('check', handler1);
  obj.on('check', handler2);
  obj.on('check', handler3);
  assert(obj.listenerCount('check') === 3);
  obj.removeListener('check', handler2);
  assert(obj.listenerCount('check') === 2);
  obj.removeListener('check', handler3);
  assert(obj.listenerCount('check') === 1);
  obj.removeListener('check', handler2);
  assert(obj.listenerCount('check') === 1);
  obj.removeListener('check', handler1);
  assert(obj.listenerCount('check') === 0);

});
