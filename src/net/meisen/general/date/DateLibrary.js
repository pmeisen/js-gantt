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
  DateLibrary.createUTC = function(y, m, d, h, mi, s) {
    var now = new Date();
    
    y = typeof(y) == 'undefined' || y == null ? now.getFullYear() : y;
    m = typeof(m) == 'undefined' || m == null ? now.getMonth() : m - 1;
    d = typeof(d) == 'undefined' || d == null ? now.getDate() : d;
    
    h = typeof(h) == 'undefined' || h == null ? 0 : h;
    mi = typeof(mi) == 'undefined' || mi == null ? 0 : mi;
    s = typeof(s) == 'undefined' || s == null ? 0 : s;
    
    return new Date(Date.UTC(y, m, d, h, mi, s));
  };
  
  /**
   * Static function used to truncate a date on a specific level. 
   */
  DateLibrary.truncateUTC = function(date, level) {
    level = DateLibrary.normalizeLevel(level);
    var res = new Date(date.getTime());
    
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
  
  DateLibrary.modifyUTC = function(date, amount, level) {
    level = DateLibrary.normalizeLevel(level);
    var res = new Date(date.getTime());
    
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
    
    return res;
  };
  
  DateLibrary.format = function(date, format) {
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
  
  DateLibrary.distanceUTC = function(date1, date2, level) {
    level = DateLibrary.normalizeLevel(level);
    var prevLevel = DateLibrary.getPreviousLevel(level);
    
    var truncDate1 = prevLevel == null ? date1 : DateLibrary.truncateUTC(date1, prevLevel);
    var truncDate2 = prevLevel == null ? date2 : DateLibrary.truncateUTC(date2, prevLevel);
    
    // if the truncation modified the end, we increase it by 1
    if (level != 's' && date2.getTime() != truncDate2.getTime()) {
      truncDate2 = DateLibrary.modifyUTC(truncDate2, 1, level);
    }
        
    var diff = Math.ceil((truncDate2.getTime() - truncDate1.getTime()) / 1000);
    switch (level) { 
      case 'd':
        diff /= 24;
      case 'h':
        diff /= 60;
      case 'mi':
        diff /= 60;
      case 's':
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