module('testDateLibrary');

test('testGeneral', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  notEqual(dateLibrary, undefined, 'DateLibrary prototype available');
});

test('testCreateUTC', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  
  var date;
  
  var now = new Date();
  
  // create a now UTC (day)
  var nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()));
  date  = dateLibrary.createUTC();
  equal(date.getUTCFullYear(), nowUTC.getUTCFullYear(), 'now UTC year');
  equal(date.getUTCMonth(), nowUTC.getUTCMonth(), 'now UTC month');
  equal(date.getUTCDate(), nowUTC.getUTCDate(), 'now UTC day');
  equal(date.getUTCHours(), 0, 'default UTC hours');
  equal(date.getUTCMinutes(), 0, 'default UTC minutes');
  equal(date.getUTCSeconds(), 0, 'default UTC seconds');
  
  // create a specified date without time
  date  = dateLibrary.createUTC(2015, 1, 15);
  equal(date.getUTCFullYear(), 2015, 'created UTC year');
  equal(date.getUTCMonth(), 0, 'created UTC month');
  equal(date.getUTCDate(), 15, 'created UTC day');
  equal(date.getUTCHours(), 0, 'default UTC hours');
  equal(date.getUTCMinutes(), 0, 'default UTC minutes');
  equal(date.getUTCSeconds(), 0, 'default UTC seconds');
  
    // create a specified date with time
  date  = dateLibrary.createUTC(2015, 1, 15, 10, 22, 52);
  equal(date.getUTCFullYear(), 2015, 'created UTC year');
  equal(date.getUTCMonth(), 0, 'created UTC month');
  equal(date.getUTCDate(), 15, 'created UTC day');
  equal(date.getUTCHours(), 10, 'default UTC hours');
  equal(date.getUTCMinutes(), 22, 'default UTC minutes');
  equal(date.getUTCSeconds(), 52, 'default UTC seconds');
});