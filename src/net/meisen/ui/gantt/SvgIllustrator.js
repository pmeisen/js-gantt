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
      this.drawScrollbar();
    },
    
    drawScrollbar: function() {
      var scrollbar = '';
      
      scrollbar += '<g class="scrollbar" transform="translate(10,372)">';
      scrollbar += '  <rect x="0" y="-0.5" fill="#eeeeee" stroke="#eeeeee" stroke-width="1" rx="0" ry="0" height="14" width="1307"></rect>';
      scrollbar += '  <rect y="-0.5" height="14" fill="#bfc8d1" stroke="#bfc8d1" stroke-width="1" rx="0" ry="0" x="1112.5" width="180"></rect>';
      scrollbar += '  <g>';
      scrollbar += '    <rect x="-0.5" y="-0.5" width="14" height="14" strokeWidth="1" stroke="#bbb" stroke-width="1" fill="#ebe7e8"></rect>';
      scrollbar += '    <path fill="#666" d="M 8 4 L 8 10 5 7"></path>';
      scrollbar += '  </g>';
      scrollbar += '  <g transform="translate(1293,0)">';
      scrollbar += '    <rect x="-0.5" y="-0.5" width="14" height="14" strokeWidth="1" stroke="#bbb" stroke-width="1" fill="#ebe7e8"></rect>';
      scrollbar += '    <path fill="#666" d="M 6 4 L 6 10 9 7"></path>';
      scrollbar += '  </g>';
      scrollbar += '</g>';
      
      scrollbar='<div></div>';
      
      console.log(this.panel.html());
      
      var el = $(scrollbar);
      el.appendTo(this.panel);
      this.panel.append(el);
    },
    
    drawTimeaxis: function(timeaxis) {
      
    }
  };
    
  return SvgIllustrator;
});