define(['jquery', 'net/meisen/general/date/DateLibrary'
                , 'net/meisen/general/interval/IntervalCollection'
                , 'net/meisen/general/interval/Interval'
                , 'net/meisen/ui/gantt/svg/Scrollbar'
                , 'net/meisen/ui/gantt/svg/TimeAxis'
                , 'net/meisen/ui/gantt/svg/IntervalView'], 
       function ($, datelib
                  , IntervalCollection
                  , Interval
                  , Scrollbar
                  , TimeAxis
                  , IntervalView) {
    
  /*
   * Default constructor...
   */
  SvgIllustrator = function() {
    this.layoutStatus = {};
    this.resetStatus();
  };
  
  /*
   * Extended prototype
   */
  SvgIllustrator.prototype = {
    defaultCfg: {
      theme: {
        fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
        fontSize: '12px'
      },
      general: {
        margin: 2
      },
      /*
       * The view is passed to the view as configuration. Therefore 
       * all settings of the view can be applied here.
       */
      view: {
      },
      /*
       * The axis is passed to the time-axis as configuration. Therefore 
       * all settings of the axis can be applied here.
       */
      axis: {
        /*
         * The viewSize determines how many entries are on
         * one view. If null the viewSize varies depending on
         * the defined granularity.
         */
        viewSize: null,
        /*
         * The left and right padding of the axis.
         */
        padding: 100
      }
    },
        
    init: function(panel, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.panel = panel;
      this.panel.empty();
      
      this.intervalCollection = new IntervalCollection();
      
      this.canvas = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      this.canvas.attr('version', '1.1');
      this.canvas.css('fontFamily', this.opts.theme.fontFamily);
      this.canvas.css('fontSize', this.opts.theme.fontSize);
      this.canvas.css('cursor', 'default');
      this.canvas.appendTo(this.panel);
            
      // observe the resize event
      var _ref = this;
      this.panel.on('sizechanged', function(event, data) {
        
        // make sure that the event was triggered for this
        if (event.target == this) {
          _ref.resize(data.width, data.height);
        }
      });
      this.canvas.on('layoutable', function() {
        _ref.layout();
        
        // trigger the final layout
        _ref.canvas.trigger('finishedLayouting');
      });
      
      // create a scrollbar for the time-axis
      this.scrollbar = new Scrollbar('horizontal');
      this.scrollbar.init(this.canvas);
      this.scrollbar.on('viewchange', function(event, data) {
        _ref.timeaxis.setView(data.position, data.size, data.total);
      });
      this.scrollbar.on('sizechanged', function(event, data) {
        _ref.setLayoutStatus('scrollbar', true);
      });
      
      // create the axis
      this.timeaxis = new TimeAxis();
      this.timeaxis.init(this.canvas, this.opts.axis);
      this.timeaxis.on('viewchange', function(event, data) {
        _ref.intervalview.setView(data.rawstart, data.rawend, null, null, _ref.timeaxis);
      });
      this.timeaxis.on('sizechanged', function(event, data) {
        _ref.setLayoutStatus('timeaxis', true);
      });
      
      // create a scrollbar for the view's swim-lanes
      this.scrollbar2 = new Scrollbar('vertical');
      this.scrollbar2.init(this.canvas, { hideOnNoScroll: false });
      this.scrollbar2.on('viewchange', function(event, data) {
        _ref.intervalview.setView(null, null, data.position, data.position + data.size, _ref.timeaxis);
      });
      this.scrollbar2.bindToWheel(this.panel);
      
      // create the view
      this.intervalview = new IntervalView();
      this.intervalview.setResolver(this.timeaxis);
      this.intervalview.init(this.canvas, this.opts.view);
      this.intervalview.on('viewchange', function(event, data) {
          _ref.scrollbar2.setView(data.top, data.swimlanesView, data.swimlanesTotal);
      });
      
      // initialize the scrollbar2
      this.scrollbar2.setView(0, 1, 1);
    },
    
    layout: function() {
      var canvasSize = this.getSize();

      var totalHeight = canvasSize.height - 2 * this.opts.general.margin;
      var totalWidth = canvasSize.width - 2 * this.opts.general.margin;
      
      var totalPosX = this.opts.general.margin;
      var totalPosY = this.opts.general.margin;
      
      var timeaxisSize = this.timeaxis.getSize();
      var scrollbarSize = this.scrollbar.isVisible() ? this.scrollbar.getSize() : { height: 0, width: 0 };

      var scrollbarLeft = totalPosX;
      var scrollbarTop = totalPosY + totalHeight - scrollbarSize.height;
      this.scrollbar.setPosition(scrollbarLeft, scrollbarTop);
      
      var timeaxisLeft = scrollbarLeft + this.opts.axis.padding * 0.5;
      var timeaxisTop = scrollbarTop - timeaxisSize.height - 5; // add 5 pixel margin
      
      this.timeaxis.setPosition(timeaxisLeft, timeaxisTop);
      
      // set the new size and position of the view
      var intervalviewLeft = timeaxisLeft;
      var intervalviewTop = totalPosY;
      var intervalviewWidth = Math.max(0, totalWidth - this.opts.axis.padding);
      var intervalviewHeight = Math.max(0, timeaxisTop - intervalviewTop);
      this.intervalview.setSize(intervalviewWidth, intervalviewHeight);
      this.intervalview.setPosition(intervalviewLeft, intervalviewTop);
      
       // set the new size and position of the scrollbar2
      this.scrollbar2.setPosition(intervalviewLeft + intervalviewWidth, intervalviewTop);
      this.scrollbar2.setExtent(intervalviewHeight);
    },
    
    resetStatus: function() {
      this.layoutStatus.intervalview = true;
      this.layoutStatus.timeaxis = false;
      this.layoutStatus.scrollbar = false;
      this.layoutStatus.scrollbar2 = true;
    },
    
    setLayoutStatus: function(entity, value) {
      this.layoutStatus[entity] = value;
      
      var status = true;
      for (var property in this.layoutStatus) {
        if (this.layoutStatus.hasOwnProperty(property)) {
          if (this.layoutStatus[property] === false) {
            status = false;
            break;
          }
        }
      }
      
      if (status) {
        this.canvas.trigger('layoutable');
        this.resetStatus();
      }
    },
    
    resize: function(width, height) {      
      this.panel.css('width', width);
      this.panel.css('height', height);

      this.canvas.width(width);
      this.canvas.height(height);
      this.canvas.attr('width', width);
      this.canvas.attr('height', height);
      
      width = width - 2 * this.opts.general.margin;
      height = height - 2 * this.opts.general.margin;

      this.scrollbar.setExtent(width);
      this.timeaxis.setWidth(width - this.opts.axis.padding);
      
      this.layout();
    },
    
    draw: function(timeaxisDef, records, map) {
      
      // get the records into a usable data-structure
      this.map = map;
      this.intervalCollection.clear();
      var intervals = [];
      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var interval = new Interval(record[map.start], record[map.end]);
        interval.set(IntervalView.gRawAttr, record);
        intervals.push(interval);
      }
      this.intervalCollection.insertAll(intervals);

      // set the data of the intervalView
      this.intervalview.setData(this.intervalCollection, this.map);
      
      // set the axis
      var level = datelib.normalizeLevel(timeaxisDef.granularity);
      this.timeaxis.setAxis(timeaxisDef.start, timeaxisDef.end, level);

      // set the view of the scrollbar, everything else will be triggered
      this.scrollbar.setView(0, this.getViewSize(level), this.timeaxis.getAmountOfEntries());
    },
    
    getViewSize: function(level) {
      
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
      
      return viewSize;
    },
    
    getSize: function() {
      return { width: this.canvas.width(), height:  this.canvas.height()};
    },
    
    on: function(event, handler) {
      this.canvas.on(event, handler);
    },
    
    off: function(event, handler) {
      this.canvas.off(event, handler);
    }
  };
    
  return SvgIllustrator;
});