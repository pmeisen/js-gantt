define(['jquery', 'net/meisen/general/date/DateLibrary'], function ($, datelib) {
  
  var utilities = {
    drawTicks: function(ticks, gap, numberOfGaps, theme) {
      
      // remove all ticks
      ticks.empty();
      
      // create the ticks
      for (var i = 0; i <= numberOfGaps + 1; i++) {
        var x = i * gap;
        
        var g = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        g.attr('class', 'gantt-timeaxis-text');
        g.css({ '-webkit-touch-callout' : 'none', 
                '-webkit-user-select' : 'none', 
                '-khtml-user-select' : 'none', 
                '-moz-user-select' : 'none', 
                '-ms-user-select' : 'none', 
                'user-select' : 'none' });
        
        var tick = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        tick.attr({ 'x1': x, 'y1': 0, 'x2': x, 'y2': 10 });
        tick.css({ 'stroke': theme.tickColor, 'stroke-width': theme.tickWidth });
        tick.appendTo(g);
        
        var label = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        label.attr({ 'x': x, 'y': 20 });
        label.css({ 'color': theme.labelColor, 'cursor': 'default', 'fontSize': theme.labelSize, 'fill': theme.labelColor });
        
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
    this.width = 0;
    this.gap = 0;
    this.relativeMove = 0;
    this.size = { 
      height: 0, 
      width: 0 
    };
    this.settings = {
      type: null,
      rawstart: null,
      rawend: null,
      last: null,
      level: null
    };
    this.view = {
      position: 0,
      size: 0, 
      total: 0
    };
  };
  
  /*
   * Extended prototype
   */
  TimeAxis.prototype = {
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
          
          return datelib.formatUTC(value, format);
        } else {
          return value;
        }
      },
      theme: {
        tickColor: '#C0D0E0',
        tickWidth: 1,
        labelColor: '#606060',
        labelSize: '11px'
      }
    },
    
    init: function(canvas, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      this.axis = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.axis.attr('class', 'gantt-timeaxis-container');

      // create a separating line
      this.sepLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
      this.sepLine.attr({ 'x1': 0, 'y1': 0, 'y2': 0 });
      this.sepLine.css({ 'stroke': '#C0D0E0', 'stroke-width': 1 });
      this.sepLine.appendTo(this.axis);
      
      // create the group of the ticks
      this.ticks = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.ticks.attr('class', 'gantt-timeaxis-ticks');
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
      
      // determine the tickInterval and the number of gaps
      var numberOfGaps;
      var tickInterval;
      if (typeof(this.opts.tickInterval) == 'undefined' || this.opts.tickInterval == null) {
        tickInterval = 1;
        while ((numberOfGaps = Math.max(1, Math.ceil((size) / tickInterval))) > 20) {
          tickInterval++;
        }
      } else {
        tickInterval = this.opts.tickInterval;
        numberOfGaps = Math.max(1, Math.ceil((size) / tickInterval));
      }

      // determine the ratio of one pos value to the pixels
      var totalWidth = this.getTotalWidth();
      var ratio = total == 0 ? 0 : totalWidth / (total - 1);
      
      // use the ratio to calculate the size of the gap and the relativeMove
      this.gap = tickInterval * ratio;
      this.relativeMove = this.gap == 0 ? 0 : -1 * ((position * ratio) % this.gap);
      
      // move the axis based on the current position
      this.ticks.attr({ 'transform': 'translate(' + this.relativeMove + ', 0)' });

      // redraw the ticks if needed
      if (redrawTicks) {
        utilities.drawTicks(this.ticks, this.gap, numberOfGaps, this.opts.theme);
      }
      
      // add the number of the labels
      var start = Math.round(position / tickInterval) * tickInterval;
      var i = 0;
      var _ref = this;
      this.ticks.find('g').each(function(idx, el) {
        var tickGroup = $(el);

        // check if the first one is currently used
        if (idx == 0 && _ref.relativeMove <= -0.5 * _ref.gap) {
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
            
      // trigger the event if there was a change
      if (changed) {
        var data = _ref.getViewPositions();
        data.rawstart = this.getRawValue(data.start);
        data.rawend = this.getRawValue(data.end);
        
        data.axis = this;

        // get the rawValues
        this.axis.trigger('viewchange', data);
      }
      
      // make sure the labels are fixed
      this.ticks.trigger('labelchange');
    },
    
    getTotalWidth: function() {
      return this.view.size == 0 ? this.width : this.width * (this.view.total - 1) / (this.view.size - 1);
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

      var bbox = this.axis.get(0).getBBox();
      var size = { 'height': bbox.height, 'width': bbox.width };
      if (this.size.height != size.height || this.size.width != size.width) {
        this.size = size;
        this.axis.trigger('sizechanged', this);
      }
    },
    
    getViewPositions: function() {
      var sPos = this.view.position;
      var ePos = Math.max(0, sPos + this.view.size - 1);
      
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
      
      /*
       * Nicer sharper look, see:
       * http://stackoverflow.com/questions/18019453/svg-rectangle-blurred-in-all-browsers
       */
      x = Math.floor(x) + 0.5;
      y = Math.floor(y) + 0.5;
      this.axis.attr({ 'transform': 'translate(' + x + ', ' + y + ')' });
    },
    
    getRawValue: function(pos) {
      pos = typeof(pos) == 'undefined' || pos == null ? 0 : pos;
      
      if (this.settings.type == 'number') {
        return pos + this.settings.rawstart;
      } else if (this.settings.type == 'date') {
        return datelib.modifyUTC(this.settings.rawstart, pos, this.settings.level, true);
      } else {
        return pos;
      }
    },
            
    getPos: function(rawValue) {
      var pos;
      if (this.settings.type == 'number') {        
        pos = rawValue - this.settings.rawstart;
      } else if (this.settings.type == 'date') {        
        pos = datelib.distanceUTC(this.settings.rawstart, rawValue, this.settings.level, true);
      } else {
        return null;
      }
      
      return pos;
    },
    
    getPixelPos: function(rawValue) {
      var pos = this.getPos(rawValue);
      return this.getPixelPosOfPos(pos);
    },
    
    getPixelPosOfPos: function(pos) {
      var totalWidth = this.getTotalWidth();
      var ratio = this.view.total == 0 ? 0 : totalWidth / (this.view.total - 1);

      return pos * ratio + this.relativeMove;
    },
    
    getRelativePixelPosOfPos: function(pos) {
      var pxAxisStartPos = this.getPixelPosOfPos(this.view.position);
      var pxPos = this.getPixelPosOfPos(pos);
      
      return pxPos - pxAxisStartPos;
    },
    
    getRelativePixelPos: function(rawValue) {
      var pos = this.getPos(rawValue);      
      return this.getRelativePixelPosOfPos(pos);
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
    },
    
    getSize: function() {
      return this.size;
    }
  };
    
  return TimeAxis;
});