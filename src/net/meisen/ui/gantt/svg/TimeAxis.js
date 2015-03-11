define(['jquery', 'net/meisen/general/date/DateLibrary'], function ($, datelib) {
  
  var utilities = {
    drawTicks: function(ticks, gap, numberOfGaps) {
      
      // remove all ticks
      ticks.empty();
      
      // create the ticks
      for (var i = 0; i <= numberOfGaps + 1; i++) {
        var x = i * gap;
        
        var g = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        g.css({ '-webkit-touch-callout' : 'none', 
                '-webkit-user-select' : 'none', 
                '-khtml-user-select' : 'none', 
                '-moz-user-select' : 'none', 
                '-ms-user-select' : 'none', 
                'user-select' : 'none' });
        
        var tick = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        tick.attr({ 'x1': x, 'y1': 0, 'x2': x, 'y2': 10 });
        tick.css({ 'stroke': '#C0D0E0', 'stroke-width': 1 });
        tick.appendTo(g);
        
        var label = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        label.attr({ 'x': x, 'y': 20 });
        label.css({ 'color': '#606060', 'cursor': 'default', 'fontSize': '11px', 'fill': '#606060' });
        
        var text = $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
        text.attr({ 'x': x, 'text-anchor': 'middle' });
        text.appendTo(label);
        label.appendTo(g);
        
        g.appendTo(ticks);
      }
    }
  };
  
  /*
   * Default constructor...
   */
  TimeAxis = function() {
  };
  
  /*
   * Extended prototype
   */
  TimeAxis.prototype = {
    axis: null,
    sepLine: null,
    ticks: null,
    width: 0,
    relativeMove: 0,
    gap: 0,
    settings: {
      type: null,
      rawstart: null,
      rawend: null,
      last: null,
      level: null
    },
    view: {
      position: 0,
      size: 0, 
      total: 0
    },
    defaultCfg: {
      tickInterval: null,
      formatter: function(value, type, level) {
        if (type == 'number') {
          return value;
        } else if (type == 'date') {
          
          var format;
          switch (level) {
            case 'y':
              format = 'yyyy';
              break;
            case 'm':
              format = 'MM.yyyy';
              break;
            case 'd':
              format = 'dd.MM.yyyy';
              break;
            case 'h':
              format = 'dd.MM.yyyy HH';
              break;
            case 'mi':
              format = 'dd.MM.yyyy HH:mm';
              break;
            case 's':
              format = 'dd.MM.yyyy HH:mm:ss';
              break;
          };
          
          return datelib.format(value, format);
        } else {
          return value;
        }
      },
      theme: {
      }
    },
    
    init: function(canvas, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.axis = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));

      // create a separating line
      this.sepLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
      this.sepLine.attr({ 'x1': 0, 'y1': 0, 'y2': 0 });
      this.sepLine.css({ 'stroke': '#C0D0E0', 'stroke-width': 1 });
      this.sepLine.appendTo(this.axis);
      
      // create the group of the ticks
      this.ticks = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.ticks.appendTo(this.axis);
      
      var _ref = this;
      this.ticks.on('labelchange', function() {
        setTimeout(function() { _ref.recalibrateLabels(); }, 0); 
      });

      this.axis.appendTo(canvas);
    },
         
    setWidth: function(width, force) {
      width = typeof(width) == 'undefined' || width == null ? this.width : width;
      force = typeof(force) == 'undefined' || force == null ? false : force;
      
      // check if we have a change or if it was forced to update
      if (!force && this.width == width) {
        return;
      } else {
        this.width = width;
      }
            
      this.sepLine.attr({ 'x2': width });
      
      // force a redraw of the marker
      this.setAxis(null, null, null, true);
    },
    
    setView: function(position, size, total, force) {
      position = typeof(position) == 'undefined' || position == null ? this.view.position : position;
      size = typeof(size) == 'undefined' || size == null ? this.view.size : size;
      total = typeof(total) == 'undefined' || total == null ? this.view.total : total;
      force = typeof(force) == 'undefined' || force == null ? false : force;
      
      total = Math.max(0, total);
      position = Math.max(0, position);
      size = Math.max(0, size);
      
      // validate some values
      if (size > total) {
        size = total;
      }
      if (position + size > total) {
        position = total - size;
      }
      
      // check if we have a change or if it was forced to update
      var redrawTicks = force || this.view.size != size || this.view.total != total;
      var changed = redrawTicks || this.view.position != position;      
      if (!force && !changed) {
        return;
      } else {
        this.view = { position: position, size: size, total: total };
      }
      
      // determine the tickInterval
      var tickInterval;
      if (typeof(this.opts.tickInterval) == 'undefined' || this.opts.tickInterval == null) {
        tickInterval = 1;
        while (Math.ceil((size - 1) / tickInterval) > 20) {
          tickInterval++;
        }
      } else {
        tickInterval = this.opts.tickInterval;
      }

      // redraw the ticks
      var numberOfGaps = Math.max(1, Math.ceil((size - 1) / tickInterval));
      this.gap = this.width / numberOfGaps;
      if (redrawTicks) {
        utilities.drawTicks(this.ticks, this.gap, numberOfGaps);
      }

      // determine the movement of the whole axis
      var totalWidth = size == 0 ? this.width : this.width * (total - 1) / (size - 1);
      var totalMove = total == 0 ? 0 : (position / (total - 1)) * totalWidth;
      this.relativeMove = -1 * (totalMove % this.gap);
      this.ticks.attr({ 'transform': 'translate(' + this.relativeMove + ', 0)' });

      // add the number of the labels
      var start = Math.round(position / tickInterval) * tickInterval;
      var i = 0;
      var _ref = this;
      this.ticks.find('g').each(function(idx, el) {
        var tickGroup = $(el);
        
        // check if the first one is currently used
        if (idx == 0 && _ref.relativeMove < -0.5 * _ref.gap) {
          tickGroup.removeAttr('data-index');
        } else {
          var pos = start + i * tickInterval;

          if (pos < 0 || pos > _ref.settings.last) {
            tickGroup.removeAttr('data-index');
          } else {
            tickGroup.attr('data-index', pos);
          }
          i++;
        }
      });
      
      // make sure the labels are fixed
      this.ticks.trigger('labelchange');
      
      // trigger the event if there was a change
      if (changed) {
        var pos = _ref.getViewPositions();
        pos.rawStart = this.getRawValue(pos.start);
        pos.rawEnd = this.getRawValue(pos.end);
        
        // get the rawValues
        this.axis.trigger('viewchange', pos);
      }
    },
    
    recalibrateLabels: function() {
      var _ref = this;
      
      this.ticks.children('g').each(function(idx, el) {
        var tickGroup = $(el);
        var text = tickGroup.children('text');
        
        // get the number
        var number = tickGroup.attr('data-index');
        number = typeof(number) == 'undefined' || number == null ? -1 : parseInt(number);
        
        var textNumber = tickGroup.attr('data-format');
        textNumber = typeof(textNumber) == 'undefined' || textNumber == null ? -1 : parseInt(textNumber);
        
        // do the formatting if needed
        if (number != -1 && number != textNumber) {
          _ref.formatLabel(number, text);
          tickGroup.attr('data-format', number);
        }
        
        // determine if the value is out of scope
        var viewPos = _ref.getViewPositions();
        if (number == -1 || viewPos.start > number || viewPos.end < number) {
          tickGroup.css('visibility', 'hidden');
        } else {
          tickGroup.css('visibility', 'visible');
        }
      });
    },
    
    getViewPositions: function() {
      var sPos = Math.round(this.view.position);
      var ePos = sPos + this.view.size - 1;
      
      return { start: sPos, end: ePos };
    },
    
    formatLabel: function(number, label) {
      var formattedText = this.opts.formatter(this.getRawValue(number), this.settings.type, this.settings.level);
      var tspans = label.children('tspan');
      tspans.text(formattedText);
      
      // determine if the element has to be shown
      bbox = label.get(0).getBBox();

      // let's try to split the text if no space is available
      if (bbox.width > this.gap) {
        
        // split the text in the middle
        var middle = Math.floor(formattedText.length * 0.5);
        var pos = -1;
        for (var i = 0; i < middle; i++) {
          if (formattedText[middle - i] == ' ') {
            pos = middle - i;
            break;
          } else if (formattedText[middle + i] == ' ') {
            pos = middle + i;
            break;
          }
        }
        
        if (pos != -1) {
          var tspanMain = tspans.eq(0);
          var tspanSub = tspans.eq(1);
          tspanSub = tspanSub.size() == 0 ? $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan')).appendTo(label) : tspanSub;
          
          // set the new text
          tspanMain.text(formattedText.substring(0, pos));
          tspanSub.text(formattedText.substring(pos + 1));
          
          // do some formatting
          var bboxMain = tspanMain.get(0).getBBox();
          tspanSub.attr({ 'text-anchor': 'middle', 'x': tspanMain.attr('x'), 'dy': 13 });
        }
      } else if (tspans.size() > 1) {
        tspans.slice(1).remove();
      }
    },
    
    getLastViewPosition: function() {
      return this.settings.last;
    },
    
    getAmountOfEntries: function() {
      return this.settings.last + 1;
    },
    
    setPosition: function(x, y) {
      this.axis.attr({ 'transform': 'translate(' + x + ', ' + y + ')' });
    },
    
    getRawValue: function(pos) {
      pos = typeof(pos) == 'undefined' || pos == null ? 0 : pos;
      
      if (this.settings.type == 'number') {
        return pos + this.settings.rawstart;
      } else if (this.settings.type == 'date') {
        return datelib.modifyUTC(this.settings.rawstart, pos, this.settings.level);
      } else {
        return pos;
      }
    },
    
    setAxis: function(start, end, level, force) {
      var recalc = false;
      
      // check the start
      var rawstart;
      if (typeof(start) == 'undefined' || start == null) {
        rawstart = this.settings.rawstart;
      } else {
        rawstart = start;
        recalc = true;
      }
      
      // check the end
      var rawend;
      if (typeof(end) == 'undefined' || end == null) {
        rawend = this.settings.rawend;
      } else {
        rawend = end;
        recalc = true;
      }

      // check level and force
      level = typeof(level) == 'undefined' || level == null ? this.settings.level : datelib.normalizeLevel(level);
      force = typeof(force) == 'undefined' || force == null ? false : force;
      
      // determine the type
      var type;
      if (rawstart instanceof Date && rawend instanceof Date) {
        type = 'date';
      } else if ($.isNumeric(rawstart) && $.isNumeric(rawend)) {
        type = 'number';
      } else {
        type = null;
      }
      
      // finally get the last
      var last;
      if (recalc) {
        if (type == 'date') {
          last = datelib.distanceUTC(rawstart, rawend, level);
        } else if (type == 'number') {
          last = rawend - rawstart;
        } else {
          last = null;
        }
      } else {
        last = this.settings.last;
      }
      
      // check if we have a change or if it was forced to update
      var changed = recalc || this.settings.type != type || this.settings.last != last || this.settings.level != level;
      if (!force && !changed) {
        return;
      } else {
        this.settings = { type: type, rawstart: rawstart, rawend: rawend, last: last, level: level };
      }
            
      // trigger the event if there was a change
      this.setView(null, null, null, true);
    },
    
    on: function(event, handler) {
      this.axis.on(event, handler);
    },
    
    off: function(event, handler) {
      this.axis.off(event, handler);
    }
  };
    
  return TimeAxis;
});