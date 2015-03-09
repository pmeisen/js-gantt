define([], function () {
    
  /*
   * Default constructor...
   */
  DateLibrary = function() {
  };
  
  /*
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
  
  DateLibrary.truncateUTC = function(y, m, d, h, mi, s) {
    
  };
    
  return DateLibrary;
});