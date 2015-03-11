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

test('testTruncateUTC', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  var testDate = dateLibrary.createUTC(2015, 6, 12, 15, 43, 56);
  var date;
  
  date  = dateLibrary.truncateUTC(testDate, 's');
  equal(date.getUTCFullYear(), 2015, 'truncate seconds');
  equal(date.getUTCMonth(), 5, 'truncate seconds');
  equal(date.getUTCDate(), 12, 'truncate seconds');
  equal(date.getUTCHours(), 15, 'truncate seconds');
  equal(date.getUTCMinutes(), 43, 'truncate seconds');
  equal(date.getUTCSeconds(), 0, 'truncate seconds');
  
  date  = dateLibrary.truncateUTC(testDate, 'mi');
  equal(date.getUTCFullYear(), 2015, 'truncate minutes');
  equal(date.getUTCMonth(), 5, 'truncate minutes');
  equal(date.getUTCDate(), 12, 'truncate minutes');
  equal(date.getUTCHours(), 15, 'truncate minutes');
  equal(date.getUTCMinutes(), 0, 'truncate minutes');
  equal(date.getUTCSeconds(), 0, 'truncate minutes');
  
  date  = dateLibrary.truncateUTC(testDate, 'h');
  equal(date.getUTCFullYear(), 2015, 'truncate hours');
  equal(date.getUTCMonth(), 5, 'truncate hours');
  equal(date.getUTCDate(), 12, 'truncate hours');
  equal(date.getUTCHours(), 0, 'truncate hours');
  equal(date.getUTCMinutes(), 0, 'truncate hours');
  equal(date.getUTCSeconds(), 0, 'truncate hours');
  
  date  = dateLibrary.truncateUTC(testDate, 'd');
  equal(date.getUTCFullYear(), 2015, 'truncate days');
  equal(date.getUTCMonth(), 5, 'truncate days');
  equal(date.getUTCDate(), 1, 'truncate days');
  equal(date.getUTCHours(), 0, 'truncate days');
  equal(date.getUTCMinutes(), 0, 'truncate days');
  equal(date.getUTCSeconds(), 0, 'truncate days');
  
  date  = dateLibrary.truncateUTC(testDate, 'm');
  equal(date.getUTCFullYear(), 2015, 'truncate months');
  equal(date.getUTCMonth(), 0, 'truncate months');
  equal(date.getUTCDate(), 1, 'truncate months');
  equal(date.getUTCHours(), 0, 'truncate months');
  equal(date.getUTCMinutes(), 0, 'truncate months');
  equal(date.getUTCSeconds(), 0, 'truncate months');
  
  date  = dateLibrary.truncateUTC(testDate, 'y');
  equal(date.getUTCFullYear(), 0, 'truncate years');
  equal(date.getUTCMonth(), 0, 'truncate years');
  equal(date.getUTCDate(), 1, 'truncate years');
  equal(date.getUTCHours(), 0, 'truncate years');
  equal(date.getUTCMinutes(), 0, 'truncate years');
  equal(date.getUTCSeconds(), 0, 'truncate years');
});

test('testModifyUTC', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  var testDate = dateLibrary.createUTC(2015, 6, 12, 15, 43, 56);
  var date;
  
  date  = dateLibrary.modifyUTC(testDate, 10, 'y');
  equal(date.getUTCFullYear(), 2025, 'modify years');
  equal(date.getUTCMonth(), 5, 'modify years');
  equal(date.getUTCDate(), 12, 'modify years');
  equal(date.getUTCHours(), 15, 'modify years');
  equal(date.getUTCMinutes(), 43, 'modify years');
  equal(date.getUTCSeconds(), 56, 'modify years');
  
  date  = dateLibrary.modifyUTC(testDate, 13, 'm');
  equal(date.getUTCFullYear(), 2016, 'modify months');
  equal(date.getUTCMonth(), 6, 'modify months');
  equal(date.getUTCDate(), 12, 'modify months');
  equal(date.getUTCHours(), 15, 'modify months');
  equal(date.getUTCMinutes(), 43, 'modify months');
  equal(date.getUTCSeconds(), 56, 'modify months');
  
  date  = dateLibrary.modifyUTC(testDate, 31, 'd');
  equal(date.getUTCFullYear(), 2015, 'modify days');
  equal(date.getUTCMonth(), 6, 'modify days');
  equal(date.getUTCDate(), 13, 'modify days');
  equal(date.getUTCHours(), 15, 'modify days');
  equal(date.getUTCMinutes(), 43, 'modify days');
  equal(date.getUTCSeconds(), 56, 'modify days');
  
  date  = dateLibrary.modifyUTC(testDate, 43, 'h');
  equal(date.getUTCFullYear(), 2015, 'modify hours');
  equal(date.getUTCMonth(), 5, 'modify hours');
  equal(date.getUTCDate(), 14, 'modify hours');
  equal(date.getUTCHours(), 10, 'modify hours');
  equal(date.getUTCMinutes(), 43, 'modify hours');
  equal(date.getUTCSeconds(), 56, 'modify hours');
  
  date  = dateLibrary.modifyUTC(testDate, -75, 'mi');
  equal(date.getUTCFullYear(), 2015, 'modify minutes');
  equal(date.getUTCMonth(), 5, 'modify minutes');
  equal(date.getUTCDate(), 12, 'modify minutes');
  equal(date.getUTCHours(), 14, 'modify minutes');
  equal(date.getUTCMinutes(), 28, 'modify minutes');
  equal(date.getUTCSeconds(), 56, 'modify minutes');
  
  date  = dateLibrary.modifyUTC(testDate, -57, 's');
  equal(date.getUTCFullYear(), 2015, 'modify seconds');
  equal(date.getUTCMonth(), 5, 'modify seconds');
  equal(date.getUTCDate(), 12, 'modify seconds');
  equal(date.getUTCHours(), 15, 'modify seconds');
  equal(date.getUTCMinutes(), 42, 'modify seconds');
  equal(date.getUTCSeconds(), 59, 'modify seconds');
  
  // ask for an exact adding
  date  = dateLibrary.modifyUTC(testDate, 4.5, 'mi', true);
  equal(date.getUTCFullYear(), 2015, 'modify exact minutes');
  equal(date.getUTCMonth(), 5, 'modify exact minutes');
  equal(date.getUTCDate(), 12, 'modify exact minutes');
  equal(date.getUTCHours(), 15, 'modify exact minutes');
  equal(date.getUTCMinutes(), 48, 'modify exact minutes');
  equal(date.getUTCSeconds(), 26, 'modify exact minutes');
  
  date  = dateLibrary.modifyUTC(testDate, 4.5, 'd', true);
  equal(date.getUTCFullYear(), 2015, 'modify exact days');
  equal(date.getUTCMonth(), 5, 'modify exact days');
  equal(date.getUTCDate(), 17, 'modify exact days');
  equal(date.getUTCHours(), 3, 'modify exact days');
  equal(date.getUTCMinutes(), 43, 'modify exact days');
  equal(date.getUTCSeconds(), 56, 'modify exact days');
  
  date  = dateLibrary.modifyUTC(testDate, 4.5, 'm', true);
  equal(date.getUTCFullYear(), 2015, 'modify exact months');
  equal(date.getUTCMonth(), 9, 'modify exact months');
  equal(date.getUTCDate(), 28, 'modify exact months');
  equal(date.getUTCHours(), 3, 'modify exact months');
  equal(date.getUTCMinutes(), 43, 'modify exact months');
  equal(date.getUTCSeconds(), 56, 'modify exact months');
  
  date  = dateLibrary.modifyUTC(testDate, 4.5, 'y', true);
  equal(date.getUTCFullYear(), 2019, 'modify exact years');
  equal(date.getUTCMonth(), 11, 'modify exact years');
  equal(date.getUTCDate(), 12, 'modify exact years');
  equal(date.getUTCHours(), 15, 'modify exact years');
  equal(date.getUTCMinutes(), 43, 'modify exact years');
  equal(date.getUTCSeconds(), 56, 'modify exact years');
});

test('testParseISO8601', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  var date;
  
  date = dateLibrary.parseISO8601('2007-12-24T18:21:10Z');
  equal(date.getUTCFullYear(), 2007, 'parsed year');
  equal(date.getUTCMonth(), 11, 'parsed month');
  equal(date.getUTCDate(), 24, 'parsed day');
  equal(date.getUTCHours(), 18, 'parsed hours');
  equal(date.getUTCMinutes(), 21, 'parsed minutes');
  equal(date.getUTCSeconds(), 10, 'parsed seconds');
});

test('testDistance', function() {
  var dateLibrary = require('net/meisen/general/date/DateLibrary');
  var diff;

  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2015, 1, 15, 10, 22, 52), 
            dateLibrary.createUTC(2015, 1, 15, 10, 22, 52), 
            's');
  equal(diff, 0);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2015, 1, 15, 10, 22, 52), 
            dateLibrary.createUTC(2015, 1, 15, 10, 22, 52), 
            'mi');
  equal(diff, 1);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2015, 1, 15, 08, 27, 55), 
            dateLibrary.createUTC(2015, 1, 15, 11, 22, 02), 
            'mi');
  equal(diff, 29 + 60 + 60 + 27);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2015, 1, 13, 08, 27, 55), 
            dateLibrary.createUTC(2015, 1, 15, 11, 22, 02), 
            'd');
  equal(diff, 3);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2015, 1, 13, 08, 27, 55), 
            dateLibrary.createUTC(2015, 1, 15, 11, 22, 02), 
            'm');
  equal(diff, 1);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2013, 11, 13, 08, 27, 55), 
            dateLibrary.createUTC(2015, 3, 15, 11, 22, 02), 
            'm');
  equal(diff, 17);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2014, 11, 13, 08, 27, 55), 
            dateLibrary.createUTC(2014, 12, 15, 11, 22, 02), 
            'm');
  equal(diff, 2);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2014, 11, 13, 08, 27, 55), 
            dateLibrary.createUTC(2014, 12, 15, 11, 22, 02), 
            'y');
  equal(diff, 1);
  
  diff = dateLibrary.distanceUTC(
            dateLibrary.createUTC(2013, 11, 13, 08, 27, 55), 
            dateLibrary.createUTC(2015, 3, 15, 11, 22, 02), 
            'y');
  equal(diff, 3);
});