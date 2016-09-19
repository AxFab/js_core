
var suite = (function () {

  var EE = EE || require('../lib/events.js'),
      niut = niut || require('./niut.js'),
      suite = niut.newSuite('EventEmitter');


  // Test that we emit on the right arguments
  suite.test('Arguments check', function (assert, done) {
    var test = 0;
    var obj = new EE();
    obj.on('check', function (value) {
      test += value;
    });
    obj.emit('check', 3);
    obj.emit('check', 2);
    obj.emit('checked', 4);
    assert.isEquals(test, 5);
    assert.isEquals(obj.eventsNames().length, 3);
    done();
  });

  // Test that we trigger once listener only one time
  suite.test('Once listeners', function (assert, done) {
    var test = false;
    var obj = new EE();
    obj.once('check', function () {
      assert.isFalse(test);
      test = true;
    });
    obj.emit('check');
    obj.emit('check');
    assert.isEquals(obj.eventsNames().length, 3);
    done();
  });

  // Test handling of several arguments
  suite.test('Several arguments', function (assert, done) {
    var obj = new EE();
    var sum9 = function (a, b) {
      assert.isEquals(a + b, 9);
    };
    obj.on('check', sum9);
    obj.emit('check', 1, 8);
    obj.emit('check', 2, 7);
    obj.emit('check', 3, 6);
    obj.emit('check', 9, 0);
    obj.removeListener('check', sum9);
    assert.isEquals(obj.eventsNames().length, 3);
    done();
  });

  // Test handling of several listeners
  suite.test('Several listeners', function (assert, done) {
    var test = 0;
    var obj = new EE();
    obj.on('check', function (value) {
      test += value;
    });
    obj.on('check', function (value) {
      test += value;
    });
    obj.emit('check', 1);
    assert.isEquals(test, 2);
    assert.isEquals(obj.eventsNames().length, 2);
    done();
  });

  suite.test('Listeners should be functions', function (assert, done) {
    var obj = new EE();
    assert.willThrow(function () {
      obj.on('check', 'Error');
    });
    assert.willThrow(function () {
      obj.on('check', 90);
    });
    assert.willThrow(function () {
      obj.once('check', {});
    });
    assert.willThrow(function () {
      obj.prependOnceListener('check', []);
    });

    assert.isEquals(obj.listenerCount('check'), 0);

    obj.prependOnceListener ('check', function() {});
    assert.willThrow(function () {
      for (var i=0; i < obj.getMaxListeners(); ++i) {
        obj.on('check', function() {});
      }
    });

    obj.setMaxListeners(obj.getMaxListeners() + 1);
    obj.on('check', function() {});
    
    assert.willThrow(function () {
      obj.removeListener('check', 'all');
    });

    obj.removeAllListeners('check');
    assert.isEquals(obj.listenerCount('check'), 0);
    done();
  });

  suite.test('Remove and count listeners', function (assert, done) {
    var obj = new EE();
    var handler1 = function () {};
    var handler2 = function () {};
    var handler3 = function () {};

    obj.on('check', handler1);
    obj.on('check', handler2);
    obj.on('check', handler3);
    assert.isEquals(obj.listenerCount('check'), 3);
    obj.removeListener('check', handler2);
    assert.isEquals(obj.listenerCount('check'), 2);
    obj.removeListener('check', handler3);
    assert.isEquals(obj.listenerCount('check'), 1);
    obj.removeListener('check', handler2);
    assert.isEquals(obj.listenerCount('check'), 1);
    obj.removeListener('check', handler1);
    assert.isEquals(obj.listenerCount('check'), 0);
    done();
  });

  return suite;
})();

if (typeof module !== 'undefined' && module.exports) {// Node.js
  module.exports = suite;
}
