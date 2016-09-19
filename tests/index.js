#!/usr/bin/env node

var suites = [
  './events.js',
];

require('./niut.js').runner(suites, function(echec) {
  if (echec) throw new Error('CheckMate...');
});

