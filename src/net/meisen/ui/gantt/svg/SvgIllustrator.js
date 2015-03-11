define(['jquery', 'net/meisen/general/date/DateLibrary'
                , 'net/meisen/ui/gantt/svg/HorizontalScrollbar'
                , 'net/meisen/ui/gantt/svg/TimeAxis'], 
       function ($, datelib
                  , HorizontalScrollbar
                  , TimeAxis) {
    
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
      },
      axis: {
        /*
         * The tickInterval defines that every tickIntervals
         * tick should be shown (e.g. the tick of every twentieth
         * value is shown and labelled).
         */
        tickInterval: null,
        /*
         * The viewSize determines how many entries are on
         * one view. If null the viewSize varies depending on
         * the defined granularity.
         */
        viewSize: null,
        /*
         * The left and right padding of the axis.
         */
        padding: 80
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
        _ref.timeAxis.setView(data.position, data.size);
      });
      
      // create the axis
      this.timeAxis = new TimeAxis();
      this.timeAxis.init(this.canvas, this.opts.axis);
      this.timeAxis.on('viewchange', function(event, data) {
        console.log(data);
      });
      
    },
    
    resize: function(width, height) {
      this.panel.css('width', width);
      this.panel.css('height', height);
      
      this.canvas.attr('width', width);
      this.canvas.attr('height', height);

      this.scrollbar.setWidth(width);
      this.timeAxis.setWidth(width - this.opts.axis.padding);
      
      this.scrollbar.setPosition(0, 100);
      this.timeAxis.setPosition(0.5 * this.opts.axis.padding, 65);
    },
    
    draw: function(timeAxisDef, records, map) {
      var level = datelib.normalizeLevel(timeAxisDef.granularity);
      this.timeAxis.setAxis(timeAxisDef.start, timeAxisDef.end, level);

      // the total amount is the last value calculated by the timeAxis
      var viewTotal = this.timeAxis.getAmountOfEntries();
      
      // the size is defined or calculated based on the level used
      var viewSize;
      if (typeof(this.opts.axis.viewSize) == 'undefined' || this.opts.axis.viewSize == null) {
        
        switch (level) {
          case 'y':
            viewSize = 10;
            break;
          case 'm':
            viewSize = 12;
            break;
          case 'd':
            viewSize = 7;
            break;
          case 'h':
            viewSize = 24;
            break;
          case 'mi':
            viewSize = 1440;
            break;
          case 's':
            viewSize = 60 * 1440;
            break;
        }
      } else {
        viewSize = this.opts.axis.viewSize;
      }
            
      // set the values for the scrolling and the axis
      this.scrollbar.setView(0, viewSize, viewTotal);
      this.timeAxis.setView(0, viewSize, viewTotal);
    }
  };
    
  return SvgIllustrator;
});