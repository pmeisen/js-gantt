define(['jquery', 'net/meisen/ui/svglibrary/SvgLibrary'], function ($, svgLibrary) {
  
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
      
      if (tagName == 'g') {
        el.children().each(function() { util.doScale($(this), x, y); });
        el.attr({ 'data-scaleX': x, 'data-scaleY': y });
      } else if (tagName == 'line') {
        
        // get the older modifications
        var modX = el.attr('data-modX');
        modX = typeof(modX) == 'undefined' ? 1 : modX;
        var modY = el.attr('data-modY');
        modY = typeof(modY) == 'undefined' ? 1 : modY;
        if (x == modX && y == modY) {
          return;
        }
        
        // get the values
        var x1 = el.attr('x1');
        x1 = typeof(x1) == 'undefined' ? 0 : x1;
        var x2 = el.attr('x2');
        x2 = typeof(x2) == 'undefined' ? 0 : x2;
        var y1 = el.attr('y1');
        y1 = typeof(y1) == 'undefined' ? 0 : y1;
        var y2 = el.attr('y2');
        y2 = typeof(y2) == 'undefined' ? 0 : y2;
        
        // get possible ignores
        var ignore = el.attr('data-ignorescale');
        var ignoreX = typeof(ignore) == 'undefined' ? false : ignore.indexOf('x') > -1;
        var ignoreY = typeof(ignore) == 'undefined' ? false : ignore.indexOf('y') > -1;
                
        if (ignoreX && ignoreY) {
          // nothing to do
        } else if (ignoreX) {
          el.attr( { 'data-modY': y, 'y1': (y1 / modY) * y, 'y2': (y2 / modY) * y });
        } else if (ignoreY) {
          el.attr( { 'data-modX': x, 'x1': (x1 / modX) * x, 'x2': (x2 / modX) * x });
        } else {
          el.attr( { 'data-modX': x, 'data-modY': y, 'x1': (x1 / modX) * x, 'x2': (x2 / modX) * x, 'y1': (y1 / modY) * y, 'y2': (y2 / modY) * y });
        }
      } else {
        
        // get possible ignores
        var ignore = el.attr('data-ignorescale');
        var ignoreX = typeof(ignore) == 'undefined' ? false : ignore.indexOf('x') > -1;
        var ignoreY = typeof(ignore) == 'undefined' ? false : ignore.indexOf('y') > -1;
        
        if (ignoreX && ignoreY) {
          // nothing to do
        } else if (ignoreX) {
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
          _ref.mouse.pageX = e.pageX;
          _ref.mouse.pageY = e.pageY;
          _ref.mouse.clientX = e.clientX;
          _ref.mouse.clientY = e.clientY;
          
          _ref.showMarker();
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
       * Create the positionMarker if none is available so far.
       */
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
      
      if (this.opts.showIntervalMarker) {
        
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
        var interval = null;
        var el = null;
        if ($.isNumeric(idx)) {
          interval = this.intervals[idx];
          el = child;
        }
      }
      
      if (this.opts.showIntervalMarker) {
        
        /*
         * Handle the intervalMarker. Create it if necessary and hide it if none
         * is selected by mouse-over.
         */
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
          
          var offset = this.opts.theme.intervalMarkerWidth == null ? Math.max(0.2 * this.opts.theme.intervalHeight) : this.opts.theme.intervalMarkerWidth;
          var color = interval.get(IntervalView.gColor);
          bbox = el.get(0).getBBox();
          this.intervalMarker.attr({ 'x': bbox.x - offset, 'y': bbox.y - offset, 'width': bbox.width + 2 * offset, 'height': bbox.height + 2 * offset });
          this.intervalMarker.css({ 'visibility': 'visible', 'fill': color });
          util.validateScale(this.background);
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
        var width = Math.max(0.1, x2 - x1);
        
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
          this.grid.appendTo(this.view);
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
        
        representor.on('mousemove', function(e){
          console.log(e);
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