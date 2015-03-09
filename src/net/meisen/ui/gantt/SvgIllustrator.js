define(['jquery'], function ($) {
    
  /*
   * Default constructor...
   */
  SvgIllustrator = function() {
  };
  
  /*
   * Extended prototype
   */
  SvgIllustrator.prototype = {
    panel: null,
    defaultCfg: {
      
    },
    
    init: function(panel, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.panel = panel;
      this.panel.empty();
      
      // <svg version="1.1" style="font-family:&quot;Lucida Grande&quot;, &quot;Lucida Sans Unicode&quot;, Arial, Helvetica, sans-serif;font-size:12px;" xmlns="http://www.w3.org/2000/svg" width="1327" height="400"></svg>
      this.svg = $('<svg version="1.1"></svg>');
      this.svg.appendTo(this.panel);
      
      // observe the resize event
      var _ref = this;
      this.panel.on('resize', function(event, data) {
        _ref.resize(data.width, data.height);
      });
    },
    
    resize: function(width, height) {
      this.panel.css('width', width);
      this.panel.css('height', height);
      
      this.svg.attr('width', width);
      this.svg.attr('height', height);
    },
    
    draw: function(timeaxis, records, map) {
      
    },
    
    drawTimeaxis: function(timeaxis) {
      
    }
  };
    
  return SvgIllustrator;
});