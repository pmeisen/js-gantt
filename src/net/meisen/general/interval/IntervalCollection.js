define(['net/meisen/general/interval/Interval'], function (Interval) {
    
  /**
   * Default constructor...
   */
  IntervalCollection = function() {
    this.sortedStartList = [];
    this.sortedEndList = [];
  };
  
  /**
   * Extended prototype:
   *
   * The implementation is not based on any typical IntervalTree
   * definition, instead a SortedList (maybe close to an AugmentedTree)
   * is used. Nevertheless, we just use a sorted array, which contains
   * the intervals in a sorted manner (see compare method).
   */
  IntervalCollection.prototype = {
    
    /**
     * Adds all the elements of the specified array.
     */
    insertAll: function(intervals) {
      
      // add all the values
      this.sortedStartList = this.sortedStartList.concat(intervals);
      this.sortedEndList = this.sortedEndList.concat(intervals);

      // sort the list afterwards
      this.sortedStartList.sort(this.compare);
      this.sortedEndList.sort(this.compareReverse);
    },
        
    insert: function(interval) {   
      var posStart = this.findPosition(this.sortedStartList, interval, null, null, this.compare);
      var posEnd = this.findPosition(this.sortedEndList, interval, null, null, this.compareReverse);
      
      // add the element to the list
      this.sortedStartList.splice(posStart, 0, interval);
      this.sortedEndList.splice(posEnd, 0, interval);
    },
    
    overlap: function(start, end) {
      
      // check if we have an interval
      if (start instanceof Interval) {
        end = start.end;
        start = start.start;
      }
      
      var posStart = this.findPosition(this.sortedStartList, new Interval(end, Interval.MAX_VALUE), null, null, this.compare);
      var posEnd = this.findPosition(this.sortedEndList, new Interval(Interval.MAX_VALUE, start), null, null, this.compareReverse);

      // make sure if everything is selected to do a fast path
      if (posStart == posEnd && posStart == this.sortedStartList.length) {
        return this.sortedStartList;
      }
      
      // get the shorter list of both
      var list;
      var cmpFunc;
      if (posStart < posEnd) {
        
        // we select start, i.e. all sel.start <= end
        list = this.sortedStartList.slice(0, posStart);
        cmpFunc = function(entry) {
          
          // compare the end value to make sure its >= start
          return entry.compareEnd(start) != -1;
        }
      } else {
        
        // we select end, i.e. all sel.end >= start
        list = this.sortedEndList.slice(0, posEnd);
        cmpFunc = function(entry) {
          
          // compare the start value to make sure its <= end
          return entry.compareStart(end) != 1;
        }
      }
      
      // filter the results
      var res = [];
      while(list.length > 0) {
        var entry = list.shift();
        if (cmpFunc(entry)) {       
          res.push(entry);
        }
      }
      return res;
    },
    
    size: function() {
      return this.sortedStartList.length;
    },
    
    clear: function() {
      this.sortedStartList = [];
      this.sortedEndList = [];
    },
    
    /**
     * Finds the position the interval has to be added to 
     * within the sortedList.
     */
    findPosition: function(arr, interval, start, end, cmpFunc) {
      cmpFunc = cmpFunc == null || typeof(cmpFunc) !== 'function' ? this.compare : cmpFunc;
      
      var len = arr.length;
      
      // just quit if there is no element, the position is always 0
      if (len == 0) {
        return 0;
      }
      
      start = typeof(start) == 'undefined' || start == null ? 0 : start;
      end = typeof(end) == 'undefined' || end == null ? len : end;

      var pivotPos = Math.floor(start + (end - start) / 2);
      var pivotElement = arr[pivotPos];
      
      var cmp = cmpFunc(pivotElement, interval);
      if (cmp == 0) {
        return pivotPos + 1;
      } else if (end - start <= 1) {
        return cmp == 1 ? pivotPos : pivotPos + 1;
      } else if (cmp == -1) {
        return this.findPosition(arr, interval, pivotPos, end, cmpFunc);
      } else {
        return this.findPosition(arr, interval, start, pivotPos, cmpFunc);
      }
    },
    
    /**
     * Compares two intervals returns an int which tells if the values compare 
     * - less than (i.e. interval1 < interval2 => -1), 
     * - equal (i.e. interval1 == interval2 => 0), or 
     * - greater (i.e. interval1 > interval2 => 1) than.
     */
    compare: function(interval1, interval2) {
      return interval1.compare(interval2);
    },
    
    /**
     * Compares two intervals returns an int which tells if the values compare 
     * - less than (i.e. interval1 < interval2 => -1), 
     * - equal (i.e. interval1 == interval2 => 0), or 
     * - greater (i.e. interval1 > interval2 => 1) than.
     *
     * Compare reverse checks for the end first of equality and than of the start.
     */
    compareReverse: function(interval1, interval2) {
      return interval1.compareReverse(interval2);
    }
  };
  
  return IntervalCollection;
});