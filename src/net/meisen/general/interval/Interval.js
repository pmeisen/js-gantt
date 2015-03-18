define(['net/meisen/general/date/DateLibrary'], function (datelib) {
  
  var determineType = function(val) {
    switch (typeof(val)) {
      case 'number':
        return 'number';
        break;
      case 'object':
        if (val instanceof Date) {
          return 'date';
        } else {
          return null;
        }
        break;
      default:
        return null;
    }
  };
  
  var compare = function(type, val1, val2) {
    
    // null is handled as MAX_VALUE
    if (val1 == Interval.MAX_VALUE && val2 == Interval.MAX_VALUE) {
      return 0;
    } else if (val1 == Interval.MAX_VALUE) {
      return 1;
    } else if (val2 == Interval.MAX_VALUE) {
      return -1;
    }
    
    // handle a type if we have one
    if (type == 'number') {
      return val1 < val2 ? -1 : (val1 > val2 ? 1 : 0);
    } else if (type == 'date') {
      var dist = datelib.distanceUTC(val1, val2, 's');
      return dist > 0 ? -1 : (dist < 0 ? 1 : 0);
    }
  };
  
  /**
   * Constructor specifying the start and end as well 
   * as additional meta-information.
   */
  Interval = function(start, end, data) {

    // get the type
    if (start == Interval.MAX_VALUE) {
      this.type = determineType(end);
    } else if (end == Interval.MAX_VALUE) {
      this.type = determineType(start);
    } else if (!((this.type = determineType(start)) == determineType(end))) {
      throw new Error('Invalid type "' + this.type + '" (' + start + ', ' + end + ').');
    }
    
    // make sure we have a type
    if (this.type == null) {
      throw new Error('Type cannot be determined, both values are Interval.MAX_VALUE ("' + start + ', "' + end + '").');
    }
    
    this.start = start;
    this.end = end;
    this.data = typeof(data) == 'undefined' ? null : data;
  };
  
  /**
   * Static value representing the MAX_VALUE, independent of the type.
   */
  Interval.MAX_VALUE = {};
  
  /**
   * Extended prototype
   */
  Interval.prototype = {
    
    get: function(value) {
      if (this.data == null) {
        return null;
      } else {
        return this.data[value];
      }
    },
    
    /**
     * Method used to set a meta-information for the this.
     */
    set: function(attribute, value) {
      if (this.data == null) {
        this.data = {};
      }
      this.data[attribute] = value;
    },
    
    /**
     * Compares this interval with the specified interval and
     * returns an int which tells if this is 
     * - less than (i.e. this < interval => -1), 
     * - equal (i.e. this == interval => 0), or 
     * - greater (i.e. this > interval => 1) than.
     */
    compare: function(interval) {
      var startCmp = compare(this.type, this.start, interval.start);

      if (startCmp == 0) {
        return compare(this.type, this.end, interval.end);
      } else {
        return startCmp;
      }
    },
    
    /**
     * Compares this interval with the specified interval and
     * returns an int which tells if this is 
     * - less than (i.e. this < interval => -1), 
     * - equal (i.e. this == interval => 0), or 
     * - greater (i.e. this > interval => 1) than.
     *
     * Compare reverse checks for the end first of equality and 
     * than of the start.
     */
    compareReverse: function(interval) {
      var endCmp = -1 * compare(this.type, this.end, interval.end);

      if (endCmp == 0) {
        return compare(this.type, this.start, interval.start);
      } else {
        return endCmp;
      }
    },
    
    /**
     * Compares the start value of this with the specified value.
     */
    compareStart: function(value) {
      return compare(this.type, this.start, value);
    },
    
    /**
     * Compares the end value of this with the specified value.
     */
    compareEnd: function(value) {
      return compare(this.type, this.end, value);
    },
    
    toString: function() {
      return '[' + this.start + ',' + this.end + ']';
    }
  };
  
  return Interval;
});