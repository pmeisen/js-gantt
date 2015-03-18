module('testIntervalCollection');

test('testGeneral', function() {
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  notEqual(IntervalCollection, undefined, 'IntervalCollection prototype available');
});

test('testCompare', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
  
  equal(IntervalCollection.compare(new Interval(2, 5), new Interval(2, 5)), 0);
  
  equal(IntervalCollection.compare(new Interval(2, 5), new Interval(2, 6)), -1);
  equal(IntervalCollection.compare(new Interval(2, 7), new Interval(2, 6)), 1);

  equal(IntervalCollection.compare(new Interval(1, 6), new Interval(2, 6)), -1);  
  equal(IntervalCollection.compare(new Interval(3, 6), new Interval(2, 6)), 1);
});

test('testCompareReverse', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
 
  equal(IntervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 5)), 0);
  
  equal(IntervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 6)), 1);
  equal(IntervalCollection.compareReverse(new Interval(2, 7), new Interval(2, 6)), -1);

  equal(IntervalCollection.compareReverse(new Interval(1, 6), new Interval(2, 6)), -1);  
  equal(IntervalCollection.compareReverse(new Interval(3, 6), new Interval(2, 6)), 1);
  
  equal(IntervalCollection.compareReverse(new Interval(1, 6), new Interval(6, 6)), -1);  
  equal(IntervalCollection.compareReverse(new Interval(6, 6), new Interval(2, 6)), 1);
});

test('testFindPosition', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
  
  // set a sortedList
  var list = [
    new Interval(1, 5), //  0
    new Interval(1, 6), //  1
    new Interval(1, 7), //  2
    new Interval(2, 3), //  3
    new Interval(2, 4), //  4
    new Interval(2, 4), //  5
    new Interval(2, 6), //  6
    new Interval(5, 7), //  7
    new Interval(5, 7), //  8
    new Interval(5, 8), //  9
    new Interval(6, 6)  // 10
  ];
  
  equal(IntervalCollection.findPosition(list, new Interval(-2, 2)), 0);
  equal(IntervalCollection.findPosition(list, new Interval(2, 5)), 6);
  equal(IntervalCollection.findPosition(list, new Interval(5, 7)), 9);
  equal(IntervalCollection.findPosition(list, new Interval(6, 6)), 11);
});

test('testInsert', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
  equal(0, IntervalCollection.size());
  
  // add and check
  IntervalCollection.insert(new Interval(5, 6, { id: 1 }));
  equal(1, IntervalCollection.size(), 'size ok');
  
  equal(1, IntervalCollection.sortedStartList[0].get('id'));
  
  equal(1, IntervalCollection.sortedEndList[0].get('id'));
  
  IntervalCollection.insert(new Interval(1, 3, { id: 2 }));
  equal(2, IntervalCollection.size(), 'size ok');
  
  equal(2, IntervalCollection.sortedStartList[0].get('id'));
  equal(1, IntervalCollection.sortedStartList[1].get('id'));
  
  equal(1, IntervalCollection.sortedEndList[0].get('id'));
  equal(2, IntervalCollection.sortedEndList[1].get('id'));
  
  IntervalCollection.insert(new Interval(6, 6, { id: 3 }));
  equal(3, IntervalCollection.size(), 'size ok');
  
  equal(2, IntervalCollection.sortedStartList[0].get('id'));
  equal(1, IntervalCollection.sortedStartList[1].get('id'));
  equal(3, IntervalCollection.sortedStartList[2].get('id'));
  
  equal(1, IntervalCollection.sortedEndList[0].get('id'));
  equal(3, IntervalCollection.sortedEndList[1].get('id'));
  equal(2, IntervalCollection.sortedEndList[2].get('id'));
});

test('testOverlap', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
  equal(0, IntervalCollection.size());
  equal(0, IntervalCollection.overlap(new Interval(5, 8)).length);
  equal(0, IntervalCollection.overlap(new Interval(0, 100)).length);
  equal(0, IntervalCollection.overlap(new Interval(7, 8)).length);
  equal(0, IntervalCollection.overlap(new Interval(3, 4)).length);
  
  // insert one interval
  IntervalCollection.insert(new Interval(6, 6, { id: 1 }));
  equal(1, IntervalCollection.size(), 'size ok');
  
  // check some overlaps
  equal(1, IntervalCollection.overlap(new Interval(5, 8)).length);
  equal(1, IntervalCollection.overlap(new Interval(5, 8))[0].get('id'));
  equal(1, IntervalCollection.overlap(new Interval(0, 100)).length);
  equal(1, IntervalCollection.overlap(new Interval(0, 100))[0].get('id'));
  equal(0, IntervalCollection.overlap(new Interval(7, 8)).length);
  equal(0, IntervalCollection.overlap(new Interval(3, 4)).length);
  
  // add more values
  IntervalCollection.insert(new Interval(2, 6, { id: 2 }));
  IntervalCollection.insert(new Interval(1, 3, { id: 3 }));
  equal(3, IntervalCollection.size(), 'size ok');
  
  // check overlaps
  equal(2, IntervalCollection.overlap(new Interval(5, 8)).length);
  equal(2, IntervalCollection.overlap(new Interval(5, 8))[0].get('id'));
  equal(1, IntervalCollection.overlap(new Interval(5, 8))[1].get('id'));
  equal(0, IntervalCollection.overlap(new Interval(7, 8)).length);
  equal(2, IntervalCollection.overlap(new Interval(3, 4)).length);
  equal(3, IntervalCollection.overlap(new Interval(3, 4))[0].get('id'));
  equal(2, IntervalCollection.overlap(new Interval(3, 4))[1].get('id'));
  equal(1, IntervalCollection.overlap(new Interval(1, 1)).length);
  equal(3, IntervalCollection.overlap(new Interval(1, 1))[0].get('id'));
  
  IntervalCollection.insert(new Interval(1, 1, { id: 4 }));
  equal(2, IntervalCollection.overlap(new Interval(1, 1)).length);
  equal(4, IntervalCollection.overlap(new Interval(1, 1))[0].get('id'));
  equal(3, IntervalCollection.overlap(new Interval(1, 1))[1].get('id'));
});

test('testInsertAll', function() {
  var Interval = require('net/meisen/general/interval/Interval');
  var IntervalCollection = require('net/meisen/general/interval/IntervalCollection');
  
  var IntervalCollection = new IntervalCollection();
  IntervalCollection.insertAll([
    new Interval(1, 4, { id: 1 }),
    new Interval(-10, 8, { id: 2 }),
    new Interval(2, 20, { id: 3 }),
    new Interval(2, 2, { id: 4 }),
    new Interval(-11, -10, { id: 5 }),
    new Interval(6, 20, { id: 6 }),
    new Interval(11, 20, { id: 6 })
  ]);
  
  equal(7, IntervalCollection.overlap(new Interval(-11, 20)).length);
  equal(3, IntervalCollection.overlap(new Interval(8, 10)).length);
});