define(['jquery', 
        'net/meisen/general/date/DateLibrary', 
        'net/meisen/ui/gantt/svg/SvgIllustrator', 
        'net/meisen/ui/svglibrary/SvgLibrary', 
        'net/meisen/ui/svglibrary/LoadingCircles'], function (
        $, 
        datelib,
        SvgIllustrator, 
        svglib, 
        loadingImage) {
    
  /*
   * Hidden utilities, only used within the GanttChart.
   */
  var utilities = {
    generateMap: function(mapper, names) {
      var group = this.validateArray(mapper.group);
      var label = this.validateArray(mapper.label);
      var tooltip = this.validateArray(mapper.tooltip);
      
      var mappedGroup = this.createArray(group.length, -1);
      var mappedLabel = this.createArray(label.length, -1);
      var mappedTooltip = this.createArray(tooltip.length, -1);
      
      // create the initial map
      var map = { start: -1, end: -1, group: mappedGroup, label: mappedLabel, tooltip: mappedTooltip };
      
      // get the arrays to look through
      var arrays = [
        [group, mappedGroup], 
        [label, mappedLabel], 
        [tooltip, mappedTooltip]
      ];
      
      // look-up the names and the defined maps
      $.each(names, function(idx, val) {
        if (val == mapper.startname) {
          map.start = idx;
        } else if (val == mapper.endname) {
          map.end = idx;
        } 
        
        $.each(arrays, function(nr, pair) {
          var arrayIdx = $.inArray(val, pair[0]);
          if (arrayIdx != -1) {
            pair[1][arrayIdx] = idx;
          }
        });
      });
      
      // validate the result, no -1 present anymore
      var validateValue = function(value) {
        if (!$.isNumeric(value) || parseInt(value) !== value || value < 0) {
          throw Error('Mapping failed (reason: value="' + value + '", map="' + JSON.stringify(map) + '", names="' + JSON.stringify(names) + '")');
        }
      }
      $.each(map, function(key, value) {
        if ($.isArray(value)) {
          $.each(value, function(idx, val) {
            validateValue(val);
          });
        } else {
          validateValue(value);
        }
      });
      
      return map;
    },
    
    createArray: function(length, value) {
      var res = [];
      
      for (var i = 0; i < length; i++) {
        res[i] = value;
      }
      
      return res;
    },
    
    validateArray: function(array) {
      var res;
      
      if (!$.isArray(array)) {
        res = [];
        res.push(array);
      } else {
        res = array;
      }
      
      return res;
    },
    
    initTimeaxis: function(timeaxis, map, records) {
      var start = timeaxis.start;
      var end = timeaxis.end;
      
      var needStart = start == null || typeof(start) == 'undefined';
      var needEnd = end == null || typeof(end) == 'undefined';

      if (needStart || needEnd) {
      
        // get the needed values
        if (records == null || typeof(records) == 'undefined' || !$.isArray(records) || records.length == 0 ||
          map == null || typeof(map) == 'undefined' || map.start == -1 || map.end == -1) {
          start = needStart ? datelib.createUTC() : start;
          end = needEnd ? datelib.createUTC(null, null, null, 23, 59, 0) : end;
        } else {
          var max = -1;
          var min = -1;
          
          $.each(records, function(idx, val) {
            var s = datelib.parseISO8601(val[map.start]).getTime();
            var e = datelib.parseISO8601(val[map.end]).getTime();
            
            if (needStart && $.isNumeric(s)) {
              min = min == -1 || min > s ? s : min;
            }
            
            if (needEnd && $.isNumeric(e)) {
              max = max == -1 || max < e ? e : max;
            }
          });
          
          // get the start if needed
          if (needStart) {
            if (min == -1 && max == -1) {
              start = datelib.createUTC();
            } else if (min == -1) {
              start = new Date(max);
              start = datelib.createUTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDay());
            } else {
              start = new Date(min);
            }
          }
          
          // get the end if needed
          if (needEnd) {
            if (min == -1 && max == -1) {
              end = datelib.createUTC(null, null, null, 23, 59, 0);
            } else if (max == -1) {
              end = new Date(min);
              end = datelib.createUTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDay(), 23, 59, 0);
            } else {
              end = new Date(max);
            }
          }
        }
        
        // set the new values
        return $.extend(true, timeaxis, { start: start, end: end });
      } else {
        return timeaxis;
      }
    }
  };
  
  /*
   * Default constructor...
   */
  GanttChart = function() {
  };
    
  /*
   * Extended prototype
   */
  GanttChart.prototype = {
    el: null,
    masking: null,
    illustrator: null,
    
    defaultCfg: {
      
      theme: {
        loadingBackgroundColor: '#CCCCCC',
        loadingBackgroundPosition: 'center center',
        loadingBackgroundRepeat: 'no-repeat',

        errorBackgroundColor: '#A30B1D'
      },
      
      illustrator: {
        factory: function() { return new SvgIllustrator() },
        config: {}
      },
      
      data: {
        url: null,
        postProcessor: function(data) {
          if (!$.isArray(data.names) || !$.isArray(data.records)) {
            return null;
          } else {
            return data;
          }
        },
        mapper: {
          startname: 'start',
          endname: 'end',
          group: [],
          label: [],
          tooltip: []
        },
        names: [],
        records: [],
        timeaxis: {
          start: null,
          end: null,
          granularity: 'days'
        }
      }
    },
    
    init: function(selector, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
            
      this.container = selector instanceof jQuery ? selector : $(selector);
      this.container.css('overflow', 'auto');
      this.container.css('position', 'relative');

      this.view = $('<div></div>');
      this.view.addClass('ganttview');
      this.view.css('position', 'absolute');
      this.view.css('overflow', 'hidden');
      this.view.appendTo(this.container);

      this.indicator = $('<div></div>');
      this.indicator.addClass('ganttloading');
      this.indicator.css('backgroundRepeat', this.opts.theme.loadingBackgroundRepeat);
      this.indicator.css('backgroundPosition', this.opts.theme.loadingBackgroundPosition);
      this.indicator.css('backgroundColor', this.opts.theme.loadingBackgroundColor);
      this.indicator.css('position', 'absolute');
      svglib.setBackgroundImage(this.indicator, loadingImage);
      this.indicator.appendTo(this.container);
      
      this.error = $('<div></div>');
      this.error.addClass('gantterror');
      this.error.css('backgroundColor', this.opts.theme.errorBackgroundColor);
      this.error.css('position', 'absolute');
      this.error.appendTo(this.container);

      var _ref = this;
      $(this.view).on('load', function() {
        _ref.mask();
      }).on('renderStart', function() {
        _ref.mask();
      }).on('renderEnd', function() {
        _ref.unmask();
      }).on('error', function(event, data) {
        _ref.showError(data);
      }).on('changeTimeaxis', function(event, data) {
        _ref.changeTimeaxis(data.start, data.end, data.granularity, data.force);
      })
      
      // initialize the illustrator
      this.illustrator = this.opts.illustrator.factory();
      this.illustrator.init(this.view, this.opts.illustrator.config);
      
      this.load();
    },
    
    mask: function() {
      if (this.masking != 'loading') {
        this.masking = 'loading';   
        
        this.container.css('overflow', 'hidden');
        this.view.hide();
        this.error.hide();
        this.indicator.show();
      }
    },
    
    unmask: function() {
      if (this.masking != null) {
        this.container.css('overflow', 'auto');
        this.view.show();
        this.indicator.hide();
        this.error.hide();
        
        this.masking = null;        
      }
    },

    resize: function(width, height) {
      this.container.css('width', width);
      this.container.css('height', height);
    
      var innerWidth = this.container.width();
      var innerHeight = this.container.height();
      this.indicator.css('width', innerWidth);
      this.indicator.css('height', innerHeight);
      this.error.css('width', innerWidth);
      this.error.css('height', innerHeight);
      
      // fire the resize event
      this.view.trigger('resize', { width: innerWidth, height: innerHeight });
    },

    changeTimeaxis: function(start, end, granularity, force) {
      if (force || (typeof(granularity) != 'undefined' && this.opts.timeaxis.granularity != granularity)
                || (typeof(start) != 'undefined' && this.opts.timeaxis.start != start)
                || (typeof(end) != 'undefined' && this.opts.timeaxis.end != end)) {

        this.opts.timeaxis.start = typeof(start) != 'undefined' ? start : this.opts.timeaxis.start;
        this.opts.timeaxis.end = typeof(end) != 'undefined' ? end : this.opts.timeaxis.end;
        this.opts.timeaxis.granularity = typeof(granularity) != 'undefined' ? granularity : this.opts.timeaxis.granularity;
        
        this.render();
      }
    },
    
    load: function() {
      this.view.trigger('load');
      
      if (typeof(this.opts.data.url) == 'undefined' || this.opts.data.url == null) {
        this.render();
      } else {
        var _ref = this;
        $.getJSON(this.opts.data.url).done(function(data) {
          var postProcessedData = $.isFunction(_ref.opts.data.postProcessor) ? _ref.opts.data.postProcessor(data) : data;
          if (postProcessedData == null) {
            _ref.view.trigger('error', { error: null, message: 'Postprocessing of data failed', nr: '1001'});
          } else {
            _ref.render(postProcessedData);
          }
        }).fail(function(error) {
          _ref.view.trigger('error', { error: error, message: 'Unable to load data', nr: '1000'});
        });
      }
    },
    
    render: function(loaded) {
      
      // rendering will be started
      this.view.trigger('renderStart');
      
      // combine the loaded data and the data
      var data = $.extend(true, {}, this.opts.data, loaded);
      
      // make sure we have a valid time-axis
      var map;
      try {
        map = utilities.generateMap(data.mapper, data.names);
        utilities.initTimeaxis(data.timeaxis, map, data.records);
      } catch (error) {
        this.view.trigger('error', { error: error, message: 'Failed to initialize rendering', nr: '1002'});
        return;
      }
      
      // use a time-out to make sure that the mask is shown
      var _ref = this;
      window.setTimeout(function () {
        
        try {
          _ref.illustrator.draw(data.timeaxis, data.records, map);
        
          // we are done with the rendering so trigger the event
          _ref.view.trigger('renderEnd');
        } catch (error) {
          _ref.view.trigger('error', { error: error, message: 'Failed to draw', nr: '1003'});
        }
      }, 50);
    },
    
    showError: function(data) {
      console.error(data);
      
      if (this.masking != 'error') {
        this.masking = 'error';      
        
        this.container.css('overflow', 'hidden');
        this.view.hide();
        this.indicator.hide();
        this.error.show();
      }
    }
  };
  
  /*
   * Add the plug-in functionality for jQuery
   */
  $.fn.ganttChart = function () {
    var charts = [];

    // get the arguments
    var args = Array.prototype.slice.call(arguments);

    // get the arguments
    var config = args.length == 1 && typeof(args[0]) == 'object' ? args[0] : null;

    // create a chart for each element
    this.each(function () {
      var chart = new GanttChart();
      chart.init($(this), config);
      
      charts.push(chart);
    });   
        
    // make the resize function available
    this.resize = function(width, height) {
      $.each(charts, function() {
        this.resize(width, height);
      });
    };

    // make the changeGranularity function available   
    this.changeTimeaxis = function(start, end, granularity, force) {
      $.each(charts, function() {
        this.changeTimeaxis(start, end, granularity, force);
      });
    };

    return this;
  };
  
  return GanttChart;
});