define([], function () {
  
  var TAGNAMES = {
    'select':'input','change':'input',
    'submit':'form','reset':'form',
    'error':'img','load':'img','abort':'img'
  }
  
  Utility = function() {
  };
  
  Utility.isEventSupported = function(eventName) {
    var el = document.createElement(TAGNAMES[eventName] || 'div');
    
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported) {
      el.setAttribute(eventName, 'return;');
      isSupported = typeof el[eventName] == 'function';
    }
    el = null;
    
    return isSupported;
  };
  
  Utility.getSupportedEvent = function(events) {

    // get the length
    var len = events.length;
    if (typeof(len) == 'undefined') {
      len = 0;
    }
    
    for (var i = 0; i < len; i++) {
      if (Utility.isEventSupported(events[i])) {
        return events[i];
      }
    }
    
    return null;
  };
  
  
  return Utility;
});