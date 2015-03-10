define(['jquery', 'net/meisen/ui/gantt/svg/HorizontalScrollbar'], function ($, HorizontalScrollbar) {
    
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
      
      this.canvas = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      this.canvas.attr('version', '1.1')
      this.canvas.css('fontFamily', this.opts.theme.fontFamily);
      this.canvas.css('fontSize', this.opts.theme.fontSize);
      this.canvas.appendTo(this.panel);
      
      // observe the resize event
      var _ref = this;
      this.panel.on('resize', function(event, data) {
        _ref.resize(data.width, data.height);
      });
      
      // create a scrollbars
      this.scrollbar = new HorizontalScrollbar();
      this.scrollbar.init(this.canvas);
      
      this.scrollbar.on('viewchange', function(event, data) {
        console.log(data);
      });
    },
    
    resize: function(width, height) {
      this.panel.css('width', width);
      this.panel.css('height', height);
      
      this.canvas.attr('width', width);
      this.canvas.attr('height', height);

      this.scrollbar.setWidth(width);
      this.scrollbar.setView(0, 100, 1000);
    },
    
    draw: function(timeaxis, records, map) {
      
    },
    
    drawHorizontalScrollbar: function(topX, topY) {
      
    },
    
    drawTimeaxis: function(timeaxis) {
      
    }
  };
    
  return SvgIllustrator;
});