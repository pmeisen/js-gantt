define(['jquery', 'net/meisen/ui/svglibrary/SvgLibrary', 'net/meisen/general/date/DateLibrary'], function ($, svgLibrary, dateLibrary) {
  
  var util = {
    
    /**
     * Generate unique IDs for use as pseudo-private/protected names.
     * 
     * Thanks to: https://gist.github.com/gordonbrander/2230317
     */
    randomId: function() {
      /*
       * Math.random should be unique because of its seeding algorithm.
       * Convert it to base 36 (numbers + letters), and grab the first 9 characters
       * after the decimal.
       */
      return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    createShadow: function(id, opacity, width) {
      var shadow = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
      shadow.attr({ 'id': id, 'transform': 'translate(1,1)' });
      shadow.css({ 'stroke-width': width, 'opacity': opacity, 'fill': 'none', 'stroke': '#000000' });
      
      return shadow;
    },
    
    getLineHeight: function(fontSize) {
      return 1.2 * fontSize;
    },
    
    createToolTipPath: function(canvasEl, el, mouse, text, theme) {
      curveRadius = typeof(theme) == 'undefined' ? 3 : theme.tooltipRadius;
      arrowSize = typeof(theme) == 'undefined' ? 6 : theme.tooltipArrow;
      margin = typeof(theme) == 'undefined' ? 0 : theme.tooltipMargin;
      
      // get the position of the element
      var canvasBbox = canvasEl.get(0).getBBox();
      var bbox = el.get(0).getBBox();
           
      // make sure we have a valid instance
      if (text instanceof jQuery == false) {
        return null;
      }

      /*
       * Calculate the size of the box. Typically this should be very easy,
       * just get the BBox of the box like done above:
       *   canvasEl.append(text);
       *   var textBbox = text.get(0).getBBox();
       *
       *   var textWidth = Math.max(1.5 * arrowSize, textBbox.width);
       *   var textHeight = Math.max(1.5 * arrowSize, textBbox.height);
       *
       *   text.remove();
       * Nevertheless, thanks to Internet Explorer (<= 11), and the missing
       * support of dominant-baseline as well as the miss-calculation of the 
       * text height, we have to do it differently.
       */
      
      // append the text to determine the size and remove it
      canvasEl.append(text);
      var textBbox = text.get(0).getBBox();
      text.remove();
      
      // determine the size of the text
      var textWidth = Math.max(1.5 * arrowSize, textBbox.width);
      var textHeight = Math.max(1.5 * arrowSize, text.children('tspan').size() * util.getLineHeight(theme.tooltipSize));
      var offsetYText = 0.4 * textHeight;

      // calculate the full size of the tool-tip
      var totalMargin = 2 * margin;
      var toolTipWidth = textWidth + 2 * curveRadius;
      var toolTipHeight = textHeight + 2 * curveRadius;
      var arrowToolTipWidth = toolTipWidth + arrowSize;
      var arrowToolTipHeight = toolTipHeight + arrowSize;
      var totalToolTipWidth = arrowToolTipWidth + totalMargin;
      var totalToolTipHeight = arrowToolTipHeight + totalMargin;
      var arrowDist = arrowSize + curveRadius + margin;
      
      var canvasOffset = canvasEl.offset();
      var posArrowY = mouse.pageY - canvasOffset.top;
      var posArrowX = mouse.pageX - canvasOffset.left;

      var boundTopX = arrowDist;
      var boundTopY = arrowDist;
      var boundBottomX = canvasBbox.width - arrowDist - 5;
      var boundBottomY = canvasBbox.height - arrowDist - 5;
      
      // Check if there is room to the right
      var pos, posTopX, posTopY, posArrow;
      
      // Check if there is room to the top
      if (bbox.y > totalToolTipHeight && posArrowX > boundTopX && posArrowX < boundBottomX) {
        pos = 'top';
        posArrow = posArrowX;
        posTopX = posArrow - 0.5 * toolTipWidth;
        posTopY = bbox.y - arrowToolTipHeight - 3;
        
        // make sure it's not out of boundaries
        posTopX = Math.min(canvasBbox.width - toolTipWidth - margin, Math.max(margin, posTopX));
        posArrow = Math.max(boundTopX, Math.min(boundBottomX, posArrow));
      } 
      // Check if there is room to the bottom
      else if (canvasBbox.height - (bbox.y + bbox.height) > totalToolTipHeight && posArrowX > boundTopX && posArrowX < boundBottomX) {
        pos = 'bottom';
        posArrow = posArrowX;
        posTopX = posArrow - 0.5 * toolTipWidth;
        posTopY = bbox.y + bbox.height + arrowSize + 3;
        
        // make sure it's not out of boundaries
        posTopX = Math.min(canvasBbox.width - toolTipWidth - margin, Math.max(margin, posTopX));
        posArrow = Math.max(boundTopX, Math.min(boundBottomX, posArrow));
      }
      // check if there is room to the right
      else if (canvasBbox.width - (bbox.x + bbox.width) > totalToolTipWidth && posArrowY > boundTopY && posArrowY < boundBottomY) {
        pos = 'right';
        posArrow = posArrowY;
        
        posTopX = bbox.x + bbox.width + arrowSize + 3;
        posTopY = posArrow - 0.5 * toolTipHeight;
        
        // make sure it's not out of boundaries
        posTopY = Math.min(canvasBbox.height - toolTipHeight - margin, Math.max(margin, posTopY));
        posArrow = Math.max(boundTopY, Math.min(boundBottomY, posArrow));
      } 
      // Check if there is room to the left
      else if (bbox.x > totalToolTipWidth && posArrowY > boundTopY && posArrowY < boundBottomY) {
        pos = 'left';
        posArrow = posArrowY;
        posTopX = bbox.x - arrowToolTipWidth - 3;
        posTopY = posArrow - 0.5 * toolTipHeight;
        
        // make sure it's not out of boundaries
        posTopY = Math.min(canvasBbox.height - toolTipHeight - margin, Math.max(margin, posTopY));
        posArrow = Math.max(boundTopY, Math.min(boundBottomY, posArrow));
      }
      // there isn't enough room, so just use the right
      else {
        return null;
      }
      
      // calculate the different positions needed
      var leftX1 = posTopX;
      var leftX2 = leftX1 + curveRadius;
      var rightX1 = leftX2 + textWidth;
      var rightX2 = rightX1 + curveRadius;
      
      var topY1 = posTopY;
      var topY2 = topY1 + curveRadius;
      var bottomY1 = topY2 + textHeight;
      var bottomY2 = bottomY1 + curveRadius;
      
      var posArrowStart = posArrow - arrowSize;
      var posArrowEnd = posArrow + arrowSize;
      
      var path = '';
      path += 'M ' + leftX2 + ' ' + topY1;
      path += pos == 'bottom' ? 'L ' + posArrowStart + ' ' + topY1 + ' ' + posArrow + ' ' + (topY1 - arrowSize) + ' ' + posArrowEnd + ' ' + topY1 : '';
      path += 'L ' + rightX1 + ' ' + topY1;
      path += 'C ' + rightX2 + ' ' + topY1 + ' ' + rightX2 + ' ' + topY1 + ' ' + rightX2 + ' ' + topY2;
      path += pos == 'left' ? 'L ' + rightX2 + ' ' + posArrowStart + ' ' + (rightX2 + arrowSize) + ' ' + posArrow + ' ' + rightX2 + ' ' + posArrowEnd : '';
      path += 'L ' + rightX2 + ' ' + bottomY1;
      path += 'C ' + rightX2 + ' ' + bottomY2 + ' ' + rightX2 + ' ' + bottomY2 + ' ' + rightX1 + ' ' + bottomY2;
      path += pos == 'top' ? 'L ' + posArrowEnd + ' ' + bottomY2 + ' ' + posArrow + ' ' + (bottomY2 + arrowSize) + ' ' + posArrowStart + ' ' + bottomY2 : '';
      path += 'L ' + leftX2 + ' ' + bottomY2;
      path += 'C ' + leftX1 + ' ' + bottomY2 + ' ' + leftX1 + ' ' + bottomY2 + ' ' + leftX1 + ' ' + bottomY1;
      path += pos == 'right' ? 'L ' + leftX1 + ' ' + posArrowEnd + ' ' + (leftX1 - arrowSize) + ' ' + posArrow + ' ' + leftX1 + ' ' + posArrowStart : '';
      path += 'L ' + leftX1 + ' ' + topY2;
      path += 'C ' + leftX1 + ' ' + topY1 + ' ' + leftX1 + ' ' + topY1 + ' ' + leftX2 + ' ' + topY1;
      
      return {
        path: path,
        x: leftX2,
        y: topY2,
        textX: leftX2,
        textY: topY2 + offsetYText,
        textWidth: textWidth,
        textHeight: textHeight
      };
    },
    
    validateScale: function(el) {
      var scaleX = el.attr('data-scaleX');
      var scaleY = el.attr('data-scaleY');
      
      if (typeof(scaleX) == 'undefined' && typeof(scaleY) == 'undefined') {
        return;
      } else {
        scaleX = typeof(scaleX) == 'undefined' ? 1 : scaleX;
        scaleY = typeof(scaleY) == 'undefined' ? 1 : scaleY;
        
        el.children().each(function() {
          var childEl = $(this);
          var tagName = childEl.prop('tagName');
          var modX = childEl.attr('data-modX');
          var modY = childEl.attr('data-modY');
          
          if (tagName == 'line' && (modX != scaleX || modY != scaleY)) {
            util.doScale(childEl, scaleX, scaleY);
          }
        });
      }
    },
    
    doScale: function(el, x, y) {
      var tagName = el.prop('tagName');
      
      // get possible ignores
      var ignore = el.attr('data-ignorescale');
      var ignoreX = typeof(ignore) == 'undefined' ? false : ignore.indexOf('x') > -1;
      var ignoreY = typeof(ignore) == 'undefined' ? false : ignore.indexOf('y') > -1;
      
      if (ignoreX && ignoreY) {
        return;
      } else if (tagName == 'g') {
        el.children().each(function() {
          if (ignoreX) {
            x = 1;
          } else if (ignoreY) {
            y = 1;
          }
          
          util.doScale($(this), x, y);
          el.attr({ 'data-scaleX': x, 'data-scaleY': y });
        });
      } else if (tagName == 'line' || tagName == 'rect') {
        
        // get the older modifications
        var modX = el.attr('data-modX');
        modX = typeof(modX) == 'undefined' ? 1 : modX;
        var modY = el.attr('data-modY');
        modY = typeof(modY) == 'undefined' ? 1 : modY;
        if (x == modX && y == modY) {
          return;
        }
        
        if (tagName == 'line') {
          
          // get the values
          var x1 = el.attr('x1');
          x1 = typeof(x1) == 'undefined' ? 0 : x1;
          var x2 = el.attr('x2');
          x2 = typeof(x2) == 'undefined' ? 0 : x2;
          var y1 = el.attr('y1');
          y1 = typeof(y1) == 'undefined' ? 0 : y1;
          var y2 = el.attr('y2');
          y2 = typeof(y2) == 'undefined' ? 0 : y2;
          
          if (ignoreX) {
            el.attr( { 'data-modY': y, 'y1': (y1 / modY) * y, 'y2': (y2 / modY) * y });
          } else if (ignoreY) {
            el.attr( { 'data-modX': x, 'x1': (x1 / modX) * x, 'x2': (x2 / modX) * x });
          } else {
            el.attr( { 'data-modX': x, 'data-modY': y, 'x1': (x1 / modX) * x, 'x2': (x2 / modX) * x, 'y1': (y1 / modY) * y, 'y2': (y2 / modY) * y });
          }
        } else if (tagName == 'rect') {
        
          // get the values
          var xPos = el.attr('x');
          xPos = typeof(xPos) == 'undefined' ? 0 : xPos;
          var yPos = el.attr('y');
          yPos = typeof(yPos) == 'undefined' ? 0 : yPos;
          var width = el.attr('width');
          width = typeof(width) == 'undefined' ? 0 : width;
          var height = el.attr('height');
          height = typeof(height) == 'undefined' ? 0 : height;
          
          if (ignoreX) {
            el.attr( { 'data-modY': y, 'y': (yPos / modY) * y, 'height': (height / modY) * height });
          } else if (ignoreY) {
            el.attr( { 'data-modX': x, 'x': (xPos / modX) * x, 'width': (width / modX) * width });
          } else {
            el.attr( { 'data-modX': x, 'data-modY': y, 'x': (xPos / modX) * x, 'width': (width / modX) * x, 'y': (yPos / modY) * y, 'height': (height / modY) * y });
          }
        }
      } else {
                
        if (ignoreX) {
          svgLibrary.modifyTransform(el, 'scale', 1 + ',' + y);
        } else if (ignoreY) {
          svgLibrary.modifyTransform(el, 'scale', x + ',' + 1);
        } else {
          svgLibrary.modifyTransform(el, 'scale', x + ',' + y);
        }
      }
    }
  };
  
  /**
   * Default constructor
   */
  IntervalView = function() {
    this.intervalCollection = null;
    this.resolver = null;
    
    this.view = null;
    this.clipArea = null;
    this.background = null;
    this.grid = null;
    
    this.width = 0;
    this.height = 0;
    
    this.mouse = {
      clientX: null,
      clientY: null,
      pageX: null,
      pageY: null
    }
  };
  
  IntervalView.guidAttr = '_guid';
  IntervalView.gPositionAttr = '_pos';
  IntervalView.gColor = '_color';
  IntervalView.gRawAttr = '_raw';
  
  /**
   * Extended prototype
   */
  IntervalView.prototype = {
    defaultCfg: {
      showGrid: true,
      showBorder: true,
      showBackground: true,
      showPositionMarker: true,
      showIntervalMarker: true,
      showPositionToolTip: true,
      showIntervalToolTip: true,
      
      coloring: {
        groupMapping: null,
        colorizer: function(interval, map, defaultColor) {

          // make sure there is something to do
          if (this.groupMapping == null || !$.isPlainObject(this.groupMapping)) {
            return defaultColor;
          }
          
          // get the value
          var raw = interval.get(IntervalView.gRawAttr);
          var group = map.get('group', raw);
          
          // if nothing is defined just return the default
          if (group == null) {
            return defaultColor;
          }
          
          // create the representative
          var strGroup = JSON.stringify(group);
          if (this.groupMapping.hasOwnProperty(strGroup)) {
            return this.groupMapping[strGroup];
          } else {
            return defaultColor;
          }
        }
      },

      tooltip: null,
      
      formatter: {
        tooltip: function(interval, map, textFormat, theme) {

          // get the values defined for the tool-tip
          var raw = interval.get(IntervalView.gRawAttr);
          var entries = map.get('tooltip', raw);
          
          // make sure a tool-tip is defined, return null if none should be shown
          var entriesSize = entries.length;
          if ($.type(entries) != 'array' != entriesSize == 0) {
            return null;
          }
          
          // make sure we have a valid format, otherwise null is returned
          var formattedText = null;
          if (textFormat == null) {
            formattedText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
            for (var i = 0; i < entriesSize; i++) {
              var tspan = $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
              tspan.text(entries[i]);
              
              tspan.attr('x', '0');
              tspan.attr('dy', i * util.getLineHeight(theme.tooltipSize));
              
              formattedText.append(tspan);
            }
          } else if ($.type(textFormat) == 'string') {
            formattedText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
            
            var spanReplace = function(text) {
              var textParser = $('<div>' + text + '</div>');
              
              var tspan = $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
              
              var content = textParser.contents();
              content.each(function() {                
                var inner = $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
                inner.text($(this).text());
                
                // clone the attributes
                if (this.nodeType == 1) {
                  inner.attr('style', $(this).attr('style'));
                }
                
                tspan.append(inner);
              });
                            
              return tspan;
            };
            
            var lines = textFormat.split('\n');
            var linesSize = lines.length;
            for (var i = 0; i < linesSize; i++) {
                            
              // format and replace span in the lines
              var text = lines[i].trim();
              var textParser = $('<div>' + text + '</div>');
              
              // check if we have spans defined
              var tspan = null;
              if (textParser.find('span').length > 0) {
                tspan = spanReplace(text);
              } else {
                tspan = $(document.createElementNS('http://www.w3.org/2000/svg', 'tspan'));
                tspan.text(text);
              }

              // position it
              tspan.attr('x', '0');
              tspan.attr('dy', i * util.getLineHeight(theme.tooltipSize));
              
              formattedText.append(tspan);
            }
          } else if (textFormat instanceof jQuery) {
            
            
            formattedText = textFormat.clone();
          } else if ($.isFunction(textFormat)){
            formattedText = this.tooltip(interval, map, textFormat(interval, map), theme);
          } else {
            
            // unsupported type
            formattedText = null;
          }
          
          return formattedText;
        }
      },
      
      theme: {
        backgroundColor: '#FFFFFF',
        
        laneHeight: null,
        intervalPosition: 'middle',
        intervalHeight: 10,
        intervalColor: '#7CB5EC',
        intervalBorderColor: '#00FF00',
        intervalBorderSize: 1,
        
        gridColor: '#D8D8D8',
        gridSize: 1,
        
        positionMarkerColor: '#D8D8D8',
        positionMarkerSize: 1,
        
        intervalMarkerOpacity: '0.3',
        intervalMarkerWidth: null,
        
        borderColor: '#D8D8D8',
        borderSize: 1,
        
        tooltipMargin: 2,
        tooltipArrow: 6,
        tooltipRadius: 3,
        tooltipSize: 11,
        
        intervalMarginInPx: null
      }
    },
    
    init: function(canvas, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      // create the clipping area for this
      var svg;
      if (canvas.prop('tagName').toLowerCase() == 'svg') {
        svg = canvas;
      } else {
        svg = canvas.parents('svg');
      }
      
      // find the defs or create one
      var defs = svg.children('defs');
      if (defs.size() == 0) {
        defs = $(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
        defs.prependTo(svg);
      }
      
      // add the clipping for this
      var clipPathId = util.randomId();
      var clipPath = $(document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'));
      clipPath = $(document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'));
      clipPath.attr('id', clipPathId);
      clipPath.appendTo(defs);
      this.clipArea = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.clipArea.attr({ 'x': 0, 'y': 0 });
      this.clipArea.appendTo(clipPath);
      
      // create the view
      this.view = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.view.attr('class', 'gantt-view-container');
      this.view.attr('clip-path', 'url(#' + clipPathId + ')');
      this.view.appendTo(canvas);

      // create the background of the view
      this.background = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.background.attr('class', 'gantt-view-background');
      this.background.appendTo(this.view);
            
      // create a rectangle for the background
      if (this.opts.showBackground && this.opts.theme.backgroundColor != null) {
        var bgRect = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        bgRect.attr({ 'x': 0, 'y': 0, 'height': 1, 'width': 1 });
        bgRect.css({ 'fill': this.opts.theme.backgroundColor });
        bgRect.appendTo(this.background);
      }
      
      // create the data container
      this.data = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.data.attr('class', 'gantt-view-data');
      this.data.appendTo(this.view);
      
      // create the foreground of the view
      this.foreground = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.foreground.attr('class', 'gantt-view-foreground');
      this.foreground.appendTo(this.view);
      
      // create a border if needed
      if (this.opts.showBorder) {
        var topLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        topLine.attr({ 'x1': 0, 'y1': 0, 'x2': 1, 'y2': 0 });
        topLine.css({ 'stroke': this.opts.theme.borderColor, 'stroke-width': this.opts.theme.borderSize });
        topLine.appendTo(this.foreground);
        
        var bottomLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        bottomLine.attr({ 'x1': 0, 'y1': 1, 'x2': 1, 'y2': 1 });
        bottomLine.css({ 'stroke': this.opts.theme.borderColor, 'stroke-width': this.opts.theme.borderSize });
        bottomLine.appendTo(this.foreground);
        
        var leftLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        leftLine.attr({ 'x1': 0, 'y1': 0, 'x2': 0, 'y2': 1 });
        leftLine.css({ 'stroke': this.opts.theme.borderColor, 'stroke-width': this.opts.theme.borderSize });
        leftLine.appendTo(this.foreground);
        
        var rightLine = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
        rightLine.attr({ 'x1': 1, 'y1': 0, 'x2': 1, 'y2': 1 });
        rightLine.css({ 'stroke': this.opts.theme.borderColor, 'stroke-width': this.opts.theme.borderSize });
        rightLine.appendTo(this.foreground);
      }
      
      // create the container for the mouse-move stuff
      if (this.opts.showPositionMarker || this.opts.showIntervalMarker || this.opts.showPositionToolTip || this.opts.showIntervalToolTip) {
        this.mousemoveMask = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        this.mousemoveMask.attr('class', 'gantt-view-mousemovemask');
        this.mousemoveMask.appendTo(canvas);
                
        // create invisible mask for mouse-over
        var _ref = this;
        var moveArea = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        moveArea.attr({ 'x': 0, 'y': 0, 'height': 1, 'width': 1 });
        moveArea.css({ 'fill-opacity': 0.0 });
        moveArea.on('mousemove', function(e) {

          var changed = _ref.mouse.pageX != e.pageX || _ref.mouse.pageY != e.pageY || _ref.mouse.clientX != e.clientX || _ref.mouse.clientY != e.clientY;
          if (changed) {
            _ref.mouse.pageX = e.pageX;
            _ref.mouse.pageY = e.pageY;
            _ref.mouse.clientX = e.clientX;
            _ref.mouse.clientY = e.clientY;
            
            _ref.showMarker();
          }
        });
        moveArea.on('mouseout', function(e) {
          _ref.mouse.pageX = null;
          _ref.mouse.pageY = null;
          _ref.mouse.clientX = null;
          _ref.mouse.clientY = null;
          
          _ref.hideMarker();
        });
        moveArea.appendTo(this.mousemoveMask);
      }
    },
    
    setData: function(intervalCollection, map) {
      this.intervalCollection = intervalCollection;
      this.map = map;
    },
    
    hideMarker: function() {
      if (this.positionMarker != null) {
        this.positionMarker.css('visibility', 'hidden');
      }
      if (this.intervalMarker != null) {
        this.intervalMarker.css('visibility', 'hidden');
      }
      if (this.tooltip != null) {
        this.tooltip.css('visibility', 'hidden');
      }
    },
    
    showMarker: function() {
      
      /*
       * Check some pre-conditions, i.e.:
       *  - check if anything has to be shown, i.e. if one of the 
       *    show... is configured
       *  - there is no mouse-mask available
       *  - make sure the mouse is within the view at all
       */
      // make sure the mouse is within the view at all, otherwise just return
      if (!this.opts.showPositionMarker && !this.opts.showIntervalMarker && !this.opts.showPositionToolTip && !this.opts.showIntervalToolTip) {
        return;
      } else if (typeof(this.mousemoveMask) =='undefined' || this.mousemoveMask == null) {
        return;
      } else if (this.mouse.clientX == null) {
        return;
      }
      
      /*
       * Check if an interval is selected by the current mouse-position.
       */
      var interval = null;
      var el = null;
      if (this.opts.showIntervalMarker || this.opts.showIntervalToolTip) {
        
        /*
         * Determine the currently element selected on the canvas, because of 
         * the order this will be an interval, if one is available.
         */
        this.mousemoveMask.hide();
        var child = $(document.elementFromPoint(this.mouse.clientX, this.mouse.clientY));
        this.mousemoveMask.show();
        
        /*
         * Check if we really selected an interval and determine the data of
         * the DOM element.
         */
        var idx = child.attr('data-idx');
        if ($.isNumeric(idx)) {
          interval = this.intervals[idx];
          el = child;
        }
      }

      this.showPositionMarker();
      this.showIntervalMarker(el, interval);
      this.showToolTip(el, interval);
    },
    
    showPositionMarker: function() {
      
      if (this.opts.showPositionMarker) {
        if (this.positionMarker == null) {
          this.positionMarker = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
          this.positionMarker.attr({ 'data-ignorescale': 'x', 'x1': 0, 'x2': 0, 'y1': 0, 'y2': 1 });
          this.positionMarker.css({ 'stroke': this.opts.theme.positionMarkerColor, 'stroke-width': this.opts.theme.positionMarkerSize });
          this.positionMarker.appendTo(this.background);
          
          // make sure the scaling is right
          util.validateScale(this.background);
        }
        
        // position the marker and show it
        var relPos = this.mouse.pageX - this.mousemoveMask.offset().left;
        this.positionMarker.attr({ 'x1': relPos, 'x2': relPos });
        this.positionMarker.css('visibility', 'visible');
      }
    },
    
    showIntervalMarker: function(el, interval) {
      
      if (this.opts.showIntervalMarker) {
        if (el == null) {
          if (this.intervalMarker != null) {
            this.intervalMarker.css('visibility', 'hidden');
          }
        } else {
          
          // create the intervalMarker if none is available so far
          if (this.intervalMarker == null) {
            this.intervalMarker = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
            this.intervalMarker.attr({ 'data-ignorescale': 'xy' });
            this.intervalMarker.css({ 'stroke-width': 0, 'fill': this.opts.theme.backgroundColor, 'opacity': this.opts.theme.intervalMarkerOpacity });
            this.intervalMarker.appendTo(this.background);
          }
          
          var offset = this.opts.theme.intervalMarkerWidth == null ? Math.max(0.15 * this.opts.theme.intervalHeight) : this.opts.theme.intervalMarkerWidth;
          var color = interval.get(IntervalView.gColor);
          bbox = el.get(0).getBBox();          
          this.intervalMarker.attr({ 'x': bbox.x - offset, 'y': bbox.y - offset, 'width': bbox.width + 2 * offset, 'height': bbox.height + 2 * offset });
          this.intervalMarker.css({ 'visibility': 'visible', 'fill': color });
        }
      }
    },
    
    showToolTip: function(el, interval) {
      
      if (this.opts.showIntervalToolTip) {
        
        if (el == null) {
          if (this.tooltip != null) {
            this.tooltip.css('visibility', 'hidden');
          }
        } else {
        
          // create the tooltip if none is available so far
          var border, shadowInner, shadow, shadowOuter;
          if (this.tooltip == null) {
            
            // the tool-tip is a group so create one
            this.tooltip = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
            this.tooltip.attr({ 'class': 'gantt-view-tooltip', 'data-ignorescale': 'xy' });
            this.tooltip.appendTo(this.foreground);
                        
            // create the shadow
            shadowOuter = util.createShadow('gantt-view-tooltip-shadow-outer', 0.05, 5);
            shadowOuter.appendTo(this.tooltip);
            shadow = util.createShadow('gantt-view-tooltip-shadow', 0.1, 3);
            shadow.appendTo(this.tooltip);
            shadowInner = util.createShadow('gantt-view-tooltip-shadow-inner', 0.2, 1);
            shadowInner.appendTo(this.tooltip);
            
            // create the border for the tool-tip
            border = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
            border.attr({ 'id': 'gantt-view-tooltip-border' });
            border.css({ 'stroke-width': 1, 'opacity': 0.9, 'fill': '#EEEEEE' });
            border.appendTo(this.tooltip);
          } else {
            border = this.tooltip.children('#gantt-view-tooltip-border');
            shadowInner = this.tooltip.children('#gantt-view-tooltip-shadow-inner');
            shadow = this.tooltip.children('#gantt-view-tooltip-shadow');
            shadowOuter = this.tooltip.children('#gantt-view-tooltip-shadow-outer');
          }

          var text = this.opts.formatter.tooltip(interval, this.map, this.opts.tooltip, this.opts.theme);
          if (text == null || typeof(text) == 'undefined' || !text.is('text')) {
            this.tooltip.css('visibility', 'hidden');
          } else {
            
            // set some properties
            text.css({ 'fontSize': this.opts.theme.tooltipSize + 'px', 'fill': '#FF00FF', 'color': '#FF00FF', 'cursor': 'default' });
              
            // get the path
            var path = util.createToolTipPath(this.mousemoveMask, el, this.mouse, text, this.opts.theme);
            if (path == null) {
              this.tooltip.css('visibility', 'hidden');
            } else {
              text.attr('transform', 'translate(' + path.x + ',0)'); 

              // format the tool-tip for the current interval
              shadowInner.attr({ 'd': path.path });
              shadow.attr({ 'd': path.path });
              shadowOuter.attr({ 'd': path.path });
              border.attr({ 'd': path.path });
              border.css({ 'stroke': interval.get(IntervalView.gColor) });          
              
              // add the text
              this.tooltip.children('text').remove();
              text.attr({ x: path.textX, y: path.textY });
              this.tooltip.append(text);
              
              // show it
              this.tooltip.css('visibility', 'visible');
            }
          }
        }
      }
    },
    
    setPosition: function(x, y) {
      
      /*
       * Nicer sharper look, see:
       * http://stackoverflow.com/questions/18019453/svg-rectangle-blurred-in-all-browsers
       */
      x = Math.floor(x) + 0.5;
      y = Math.floor(y) + 0.5;
      
      var translate = x + ', ' + y;
      
      svgLibrary.modifyTransform(this.view, 'translate', translate);
      svgLibrary.modifyTransform(this.mousemoveMask, 'translate', translate);
    },
    
    setSize: function(width, height, force) {
      width = typeof(width) == 'undefined' || width == null ? this.width : width;
      height = typeof(height) == 'undefined' || height == null ? this.height : height;
      force = typeof(force) == 'undefined' || force == null ? false : force;
      
      // check if we have a change or if it was forced to update
      var changed = this.width != width || this.height != height;
      if (!force && !changed) {
        return;
      } else {
        this.width = width;
        this.height = height;
      }
      this.clipArea.attr({ 'width': width, 'height': height });
      
      // modify the different groups
      var groups = [ this.background, this.foreground, this.mousemoveMask, this.grid ];
      $.each(groups, function(idx, val) {
        if (val != null) {
          util.doScale(val, width, height);
        }
      });
      
      // just trigger the final drawing as finished
      if (changed) {
        this.setView(null, null, null, null, true);
        this.view.trigger('sizechanged', this);
      }
    },
    
    setView: function(start, end, top, bottom, force) {        
      force = typeof(force) == 'undefined' || force == null ? false : force;
      start = typeof(start) == 'undefined' || start == null ? this.start : start;
      end = typeof(end) == 'undefined' || end == null ? this.end : end;
      top = typeof(top) == 'undefined' || top == null ? this.top : top;
      bottom = typeof(bottom) == 'undefined' || bottom == null ? this.bottom : bottom;
            
      // make sure the values are correct
      var changed = this.start != start || this.end != end || this.top != top || this.bottom != bottom;      
      if (!force && !changed) {
        return;
      } else {
        this.start = start;
        this.end = end;
        this.top = top;
        this.bottom = bottom;
      }
      
      // check validity and data availability
      var isValid = start != null && end != null && top != null && bottom != null && this.resolver != null && this.intervalCollection != null;
      var hasData = this.intervalCollection != null && this.intervalCollection.size() > 0;
      if (!isValid || !hasData) {
        return;
      }

      // determine the relevant data
      this.intervals = this.intervalCollection.overlap(start, end);
      this.intervals.sort(function(int1, int2) {
        return int1.compare(int2);
      });
      
      // hide any selection so far
      this.hideMarker();
      
      // calculate height, laneHeight, margin and offset
      var height = this.opts.theme.intervalBorderSize * 2 + this.opts.theme.intervalHeight;
      var swimlaneHeight = Math.max(height, this.opts.theme.laneHeight == null ? 1.5 * height : this.opts.theme.laneHeight);
      var swimlanesCount = this.height / swimlaneHeight;
      var intervalMarginInPx = this.opts.theme.intervalMarginInPx == null ? 0.5 * swimlaneHeight : this.opts.theme.intervalMarginInPx;
      var offset = -1 * top * swimlaneHeight;
      if (this.opts.theme.intervalPosition == 'top') {
        offset += 0;
      } else if (this.opts.theme.intervalPosition == 'bottom') {
        offset += swimlaneHeight - height;
      } else {
        offset += 0.5 * (swimlaneHeight - height); 
      }
      
      // draw the lines
      if (this.opts.showGrid) {
        this.drawSwimlanes((Math.floor(top) - top) * swimlaneHeight, swimlanesCount, swimlaneHeight);
      }

      // iterate over intervals and create a 'new' or 'reuse' one
      var swimlanesTotal = 0;
      var intervalsLen = this.intervals.length;
      var swimlanesXPoses = [];
      var processId = util.randomId();
      for (var i = 0; i < intervalsLen; i++) {
        var interval = this.intervals[i];

        // determine the x-position and width
        var x1 = this.resolver.getRelativePixelPos(interval.start);
        var x2 = this.resolver.getRelativePixelPos(interval.end);
        var width = x2 - x1;
        if (width < 1.0) {
          width = 1.0;
          x2 = x1 + width; 
        }
        
        /*
         * Check if we currently have a swimlane.
         */
        var swimlane = interval.get(IntervalView.gPositionAttr);
        if (typeof(swimlane) == 'undefined' || swimlane == null) {    
          swimlane = this.determineSwimlane(swimlanesXPoses, interval, x1, intervalMarginInPx);
        }
        swimlanesTotal = Math.max(swimlane + 1, swimlanesTotal);

        // mark the swimlane as blocked
        swimlanesXPoses[swimlane] = x2;

        // layout the representor, if visible
        if (swimlane >= Math.floor(top) && swimlane < Math.ceil(bottom)) {
          var borderedX = x1 + this.opts.theme.intervalBorderSize;
          var borderedWidth = Math.max(0.1, width - 2 * this.opts.theme.intervalBorderSize);
          this.layoutRepresentor(i, borderedX, swimlane * swimlaneHeight + offset, borderedWidth, processId);
        }
      }

      // remove all the unneeded lines
      this.data.children('[data-processId][data-processId!=' + processId + ']').remove();
      
      // select again whatever is covered now
      this.showMarker();
      
      // fire the view-change event
      this.view.trigger('viewchange', { start: start, end: end, top: top, bottom: bottom, swimlanesView: swimlanesCount, swimlanesTotal: swimlanesTotal });
    },
    
    drawSwimlanes: function(offset, swimlanesCount, swimlaneHeight) {
      
      // only draw new lines if changed
      if (this.swimlanesCount != swimlanesCount || this.swimlanesHeight != swimlaneHeight) {
        if (this.grid == null) {
          this.grid = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
          this.grid.attr('class', 'gantt-view-grid');
          this.background.children(':first').after(this.grid);
        }
        
        // remove the grid, because it was changed
        this.grid.empty();
        
        for (var i = 0; i < swimlanesCount + 1; i++) {
          var line = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
          var y = swimlaneHeight * i;
          
          line.attr({ 'x1': 0, 'y1': y, 'x2': 1, 'y2': y, 'data-ignorescale': 'y' });
          line.css({ 'stroke': this.opts.theme.gridColor, 'stroke-width': this.opts.theme.gridSize });
          
          line.appendTo(this.grid);
        }
        util.validateScale(this.grid);
      }
      
      // position the grid according to the defined offset
      svgLibrary.modifyTransform(this.grid, 'translate', '0, ' + offset);
    },
    
    layoutRepresentor: function(idx, x, y, width, processId) {
      var interval = this.intervals[idx];
      
      // check if we have a guid
      var guid = interval.get(IntervalView.guidAttr);
      
      // get the representor for the guid
      var representor = null;
      if (typeof(guid) == 'undefined' || guid == null) {
        guid = util.randomId();
        interval.set(IntervalView.guidAttr, guid);
      } else {
        representor = this.data.children('#' + guid);
      }
      
      // generate a new representor if we didn't find one or none was there
      if (representor == null || representor.size() == 0) {
        
        // get the color and keep it if we got it
        var color = interval.get(IntervalView.gColor);
        if (typeof(color) == 'undefined' || color == null) {
          color = this.opts.coloring.colorizer(interval, this.map, this.opts.theme.intervalColor);
          interval.set(IntervalView.gColor, color);
        }
        
        representor = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        representor.attr({ 'id': guid, 'height': this.opts.theme.intervalHeight });
        representor.css({ 
          'stroke': this.opts.theme.intervalBorderColor, 'stroke-width': this.opts.theme.intervalBorderSize,
          'fill': color
        });
                
        representor.appendTo(this.data);
      }
      representor.attr({ 'data-processId': processId, 'data-idx': idx });

      // position the representor
      representor.attr({ 'x': x, 'y': y, 'width': width });
    },
    
    determineSwimlane: function(swimlanesXPoses, interval, xPos, intervalMarginInPx) {
      var swimlanesLen = swimlanesXPoses.length;
        
      // check the swimlanes
      var swimlane = null;
      for (var k = 0; k < swimlanesLen; k++) {
        
        // get the next available position in the lane
        var x = swimlanesXPoses[k];
        x = typeof(x) != 'number' || x == 0 ? 0 : x + intervalMarginInPx;

        // check if the position is valid
        if (x < xPos) {
          swimlane = k;
          break;
        }
      }
      
      // create a new swimlane if none is available
      if (swimlane == null) {
        swimlane = swimlanesLen;
      }
      
      // set the selected position for the interval
      interval.set(IntervalView.gPositionAttr, swimlane);
      
      return swimlane;
    },
    
    setResolver: function(resolver) {
      this.resolver = resolver;
    },
    
    getSize: function() {
      return { 'width': this.width, 'height': this.height };
    },
    
    on: function(event, handler) {
      this.view.on(event, handler);
    },
    
    off: function(event, handler) {
      this.view.off(event, handler);
    },
  };
    
  return IntervalView;
});