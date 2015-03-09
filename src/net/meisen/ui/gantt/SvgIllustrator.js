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
      theme: {
        fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
        fontSize: '12px'
      }
    },
    
    init: function(panel, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.panel = panel;
      this.panel.empty();
      
      this.svg = $('<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>');
      this.svg.css('fontFamily', this.opts.theme.fontFamily);
      this.svg.css('fontSize', this.opts.theme.fontSize);
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