define(['jquery'], function ($) {
    
  /*
   * Default constructor...
   */
  DivIllustrator = function() {
  };
  
  /*
   * Extended prototype
   */
  DivIllustrator.prototype = {
    panel: null,
    defaultCfg: {
      
    },
    
    init: function(panel, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.panel = panel;
      this.panel.empty();
    },
    
    draw: function(timeaxis, records, map) {

    }
  };
    
  return DivIllustrator;
});