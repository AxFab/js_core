

var EE = require('../lib/events.js');

var assert = function (expr) {
  if (!expr)
    throw new Error('Failed !');
}

var test = function (name, callback) 
{
  try {
    callback();
  } catch (e) {
    console.log ('Error at ' + name);
    throw e;
  }
}

// Test that we emit on the right arguments
test('#1', function () {
  var test = 0;
  var obj = new EE();
  obj.on('check', function (value) {
    test += value;
  });
  obj.emit('check', 3)
  obj.emit('check', 2)
  obj.emit('checked', 4)
  assert (test == 5);
});


// Test that we trigger once listener only one time
test('#2', function () {
  var test = false;
  var obj = new EE();
  obj.once('check', function () {
    assert (!test);
    test = true;
  });
  obj.emit('check')
  obj.emit('check')
});


// Test handling of several arguments
test('#3', function () {
  var obj = new EE();
  obj.once('check', function (a, b) {
    assert (a + b == 9);
  });
  obj.emit('check', 1, 8)
  obj.emit('check', 2, 7)
  obj.emit('check', 3, 6)
  obj.emit('check', 9, 0)
});


// Test handling of several listeners
test('#4', function () {
  var test = 0;
  var obj = new EE();
  obj.on('check', function (value) {
    test += value;
  });
});
