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