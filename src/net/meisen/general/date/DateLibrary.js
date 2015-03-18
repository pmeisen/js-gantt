define([], function () {
    
  /*
   * Default constructor...
   */
  DateLibrary = function() {
  };
  
  /**
   * Static function useful to generate UTC dates. The parameters are optional,
   * i.e. can be null or undefined. If not specified the date-information will be
   * set to today, whereby the time-information will be set to 0 if not specified.
   */
  DateLibrary.createUTC = function(y, m, d, h, mi, s, ms) {
    var now = new Date();
    
    y = typeof(y) == 'undefined' || y == null ? now.getFullYear() : y;
    m = typeof(m) == 'undefined' || m == null ? now.getMonth() : m - 1;
    d = typeof(d) == 'undefined' || d == null ? now.getDate() : d;
    
    h = typeof(h) == 'undefined' || h == null ? 0 : h;
    mi = typeof(mi) == 'undefined' || mi == null ? 0 : mi;
    s = typeof(s) == 'undefined' || s == null ? 0 : s;
    ms = typeof(ms) == 'undefined' || ms == null ? 0 : ms;
    
    return new Date(Date.UTC(y, m, d, h, mi, s, ms));
  };
  
  /**
   * Static function used to truncate a date on a specific level. 
   */
  DateLibrary.truncateUTC = function(date, level) {
    level = DateLibrary.normalizeLevel(level);
    var res = new Date(date.getTime());
    res.setUTCMilliseconds(0);
    
    switch (level) {
      case 'y':
        res.setUTCFullYear(0);
      case 'm':
        res.setUTCMonth(0);
      case 'd':
        res.setUTCDate(1);
      case 'h':
        res.setUTCHours(0);
      case 'mi':
        res.setUTCMinutes(0);
      case 's':
        res.setUTCSeconds(0);
        break;
    }
    
    return res;
  };
  
  DateLibrary.modifyUTC = function(date, amount, level, exact) {
    
    if (amount == 0) {
      return date;
    }
    
    exact = typeof(exact) == 'undefined' || exact == null ? false : exact;
    level = DateLibrary.normalizeLevel(level);
    
    var res;
    if (exact) {
      var sign = amount < 0 ? -1 : 1;
      
      if (level == 'y') {
        /*
         * Instead of using a multiplier like:
         *   multiplier *= DateLibrary.numberOfDays(res.getUTCFullYear());
         * we use the month implementation. This ensures that 0.5 adds 6 months, 
         * instead of the half amount of days. This is more intuitive, someone
         * will expect the middle of the year to be after 6 months and not after
         * 182.5 (or 183) days.
         */
        return DateLibrary.modifyUTC(date, amount * 12, 'm', true);
      } else if (level == 'm') {
        /*
         * This is more or less the most complicated part of the distance.
         * We cannot just add the month, the month depends on the current 
         * amount of days within the month, i.e. January +1 means +31 days
         * on February +1 means +28 days (or even +29). Therefore the distance
         * depends on the date and the distance to the edge of the month.
         * Additionally the target month must be especially handled.
         */
        var edgeDate = DateLibrary.getEdgeDate(date, sign);
        var orgMonthDays = DateLibrary.numberOfDays(date.getUTCFullYear(), date.getUTCMonth() + 1);
        var normDistToEdge = DateLibrary.getDistanceToEdge(date, edgeDate) / orgMonthDays;
        
        // there is not enough amount to move, so just move within the month
        if (Math.abs(amount) < Math.abs(normDistToEdge)) {
          return DateLibrary.modifyUTC(date, amount * orgMonthDays, 'd', true);
        } 
        // change the amount to be still moved, sign determines the direction
        else {
          amount -= normDistToEdge;
        }
        
        date = edgeDate;
      }
        
      // get the base and the remainder
      var base = Math.floor(amount);
      var remainder = amount - base;
      
      // calculate the date based on the base
      res = DateLibrary.modifyUTC(date, base, level, false);
      
      // determine the multiplier
      var multiplier = 1;
      switch (level) {
        case 'm':
          var destMonthDays = DateLibrary.numberOfDays(res.getUTCFullYear(), res.getUTCMonth() + 1);
          multiplier *= destMonthDays;
        case 'd':
          multiplier *= 24;
        case 'h':
          multiplier *= 60;
        case 'mi':
          multiplier *= 60;
        case 's':
          multiplier *= 1000;
          break;
      }
      
      // use the multiplier and calculate the date on milliseconds
      res = new Date(res.getTime() + remainder * multiplier);
    } else {
      res = new Date(date.getTime());
      
      switch (level) {
        case 'y':
          res.setUTCFullYear(date.getUTCFullYear() + amount);
          break;
        case 'm':
          res.setUTCMonth(date.getUTCMonth() + amount);
          break;
        case 'd':
          res.setUTCDate(date.getUTCDate() + amount);
          break;
        case 'h':
          res.setUTCHours(date.getUTCHours() + amount);
          break;
        case 'mi':
          res.setUTCMinutes(date.getUTCMinutes() + amount);
          break;
        case 's':
          res.setUTCSeconds(date.getUTCSeconds() + amount);
          break;
      }
    }
    
    return res;
  };
  
  DateLibrary.getEdgeDate = function(date, sign) {
    
    if (sign == 1) {  
      return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 1);
      //return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 0, 23, 59, 59, 999);
    } else {
      return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    }
  };
  
  DateLibrary.getDistanceToEdge = function(date, edgeDate) {
    
    // calculate the distance to the edge (01 or end) of the month
    edgeDate = typeof(edgeDate) == 'number' ? DateLibrary.getEdgeDate(date, edgeDate) : edgeDate;
    var distToEdge = DateLibrary.distanceUTC(date, edgeDate, 'd', true);
    
    return distToEdge;
  };
    
  DateLibrary.numberOfDays = function(year, month) {
    
    if (typeof(month) == 'undefined' || month == null) {
      var d1 = Date.UTC(year + 1, 0, 0);
      var d2 = Date.UTC(year, 0, 0);
      
      return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    } else {
      
      /*
       * Getting the 0-day of the next month (month is zero based), 
       * is the last day of the requested month.
       */
      return new Date(Date.UTC(year, month, 0)).getUTCDate();
    }
  }
  
  DateLibrary.formatUTC = function(date, format) {
    var p = DateLibrary.pad;
    
    var res = format;
    
    res = res.replace('yyyy', p(date.getUTCFullYear(), 4));
    res = res.replace('MM', p(date.getUTCMonth() + 1));
    res = res.replace('dd', p(date.getUTCDate()));
    res = res.replace('HH', p(date.getUTCHours()));
    res = res.replace('mm', p(date.getUTCMinutes()));
    res = res.replace('ss', p(date.getUTCSeconds()));
    
    return res;
  };
  
  DateLibrary.pad = function(nr, max) {
    var str = '' + nr;
    max = typeof(max) == 'undefined' || max == null ? 2 : max;
    
    return str.length < max ? DateLibrary.pad('0' + str, max) : str;
  };
  
  DateLibrary.normalizeLevel = function(level) {
    switch (level) {
      case 'y':
      case 'year':
      case 'years':
        return 'y';
      case 'm':
      case 'month':
      case 'months':
        return 'm';
      case 'd':
      case 'day':
      case 'days':
        return 'd';
      case 'h':
      case 'hour':
      case 'hours':
        return 'h';
      case 'mi':
      case 'minute':
      case 'minutes':
        return 'mi';
      case 's':
      case 'second':
      case 'seconds':
        return 's';
    }
    
    return null;
  };
  
  DateLibrary.getPreviousLevel = function(level) {
    level = DateLibrary.normalizeLevel(level);
    switch (level) {
      case 'y':
        return 'm';
      case 'm':
        return 'd';
      case 'd':
        return 'h';
      case 'h':
        return 'mi';
      case 'mi':
        return 's';
      case 's':
        return null;
    }
  };
  
  DateLibrary.getLevels = function() {
    return [ 'y', 'm', 'd', 'h', 'mi', 's' ];
  };
  
  DateLibrary.distanceUTC = function(date1, date2, level, exact) {
    exact = typeof(exact) == 'undefined' || exact == null ? false : exact;
    level = DateLibrary.normalizeLevel(level);
    
    if (exact) {
      if (date1.getTime() == date2.getTime()) {
        return 0;
      }
      
      /*
       * The exact calculation is quiet complicated, it has to be following
       * the rules defined by DateLibrary.modifyUTC. It must apply that
       *   
       *  dateB == DateLibrary.modifyUTC(dateA, DateLibrary.distanceUTC(dateA, dateB, l, true), l, true)
       */     
      var base = 0;
      var fraction = 1;
      switch (level) {
        case 'y':
          return DateLibrary.distanceUTC(date1, date2, 'm', true) / 12;
        break;
        case 'm':
          var ord = date1.getTime() < date2.getTime() ? 1 : -1;
        
          // get the distance of each month within itself
          var dist1Edge = DateLibrary.getEdgeDate(date1, ord);
          var dist2Edge = DateLibrary.getEdgeDate(date2, -1 * ord);
          var dist1 = DateLibrary.getDistanceToEdge(date1, dist1Edge) / DateLibrary.numberOfDays(date1.getUTCFullYear(), date1.getUTCMonth() + 1);
          var dist2 = DateLibrary.getDistanceToEdge(date2, dist2Edge) / DateLibrary.numberOfDays(date2.getUTCFullYear(), date2.getUTCMonth() + 1);
          
          // get the base, i.e. the full month between
          var base = DateLibrary.distanceUTC(dist1Edge, dist2Edge, 'm', false);
          return dist1 + -1 * dist2 + base;
        break;
        case 'd':
          fraction *= 24;
        case 'h':
          fraction *= 60;
        case 'mi':
          fraction *= 60;
        case 's':
          fraction *= 1000;
          break;
      }

      return (date2.getTime() - date1.getTime()) / fraction;
    } else {
      var prevLevel = DateLibrary.getPreviousLevel(level);
      
      var truncDate1 = prevLevel == null ? date1 : DateLibrary.truncateUTC(date1, prevLevel);
      var truncDate2 = prevLevel == null ? date2 : DateLibrary.truncateUTC(date2, prevLevel);
      
      // if the truncation modified the end, we increase it by 1
      if (level != 's' && date2.getTime() != truncDate2.getTime()) {
        truncDate2 = DateLibrary.modifyUTC(truncDate2, 1, level);
      }
      
      var diff = 0;
      var fraction = 1;
      switch (level) { 
        case 'd':
          fraction *= 24;
        case 'h':
          fraction *= 60;
        case 'mi':
          fraction *= 60;
        case 's':
          diff = Math.ceil((truncDate2.getTime() - truncDate1.getTime()) / 1000);
          diff /= fraction;
          // nothing to do
          break;
        case 'y':
          diff = truncDate2.getFullYear() - truncDate1.getFullYear();
          break;
        case 'm':      
          diff = (truncDate2.getFullYear() - truncDate1.getFullYear()) * 12;
          diff -= truncDate1.getMonth() + 1;
          diff += truncDate2.getMonth() + 1;
          break;
      }
      
      return Math.ceil(diff);
    }
  };
  
  DateLibrary.parseISO8601 = function(value) {
      
      // check null
      if (value == null || typeof(value) == 'undefined') {
        return null;
      } 
      
      // check if we have a Date
      if (value instanceof Date) {
        return value;
      } 
      
      // check ISO8601 
      var regex = new RegExp('^([\\d]{4})\\-([\\d]{2})\\-([\\d]{2})T([\\d]{2}):([\\d]{2}):([\\d]{2})(\\.([\\d]{3}))?Z$');
      var matches = regex.exec(value);
      if (matches != null) {

        return DateLibrary.createUTC(
          parseInt(matches[1], 10),
          parseInt(matches[2], 10),
          parseInt(matches[3], 10),
          parseInt(matches[4], 10),
          parseInt(matches[5], 10),
          parseInt(matches[6], 10)
        );
      }
      
      // fallback
      return null;
    }
    
  return DateLibrary;
});