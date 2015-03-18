define(['jquery'], function ($) {
  
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
    }
  };
  
  /**
   * Default constructor
   */
  IntervalView = function() {
    this.intervalCollection = null;
    this.resolver = null;
    
    this.width = 0;
    this.height = 0;
  };
  
  /**
   * Extended prototype
   */
  IntervalView.prototype = {
    defaultCfg: {
      theme: {
        backgroundColor: '#FFFFFF',
        
        laneHeight: null,
        intervalPosition: 'middle',
        intervalHeight: 10,
        intervalColor: '#FF00FF',
        intervalBorderColor: '#00FF00',
        intervalBorderSize: 1,
        
        intervalMarginInPx: null
      }
    },
    
    guidAttr: '_guid',
    gPositionAttr: '_gpos',
    
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
      this.view.attr('clip-path', 'url(#' + clipPathId + ')');
      this.view.appendTo(canvas);

      this.area = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.area.css({ 'fill': this.opts.theme.backgroundColor });
      this.area.appendTo(this.view);
    },
    
    setData: function(intervalCollection, map) {
      this.intervalCollection = intervalCollection;
      this.map = map;
    },
    
    setPosition: function(x, y) {
      this.view.attr({ 'transform': 'translate(' + x + ', ' + y + ')' });
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
      
      this.area.attr({ 'width': width, 'height': height });
      this.clipArea.attr({ 'width': width, 'height': height });
      
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
      var intervals = this.intervalCollection.overlap(start, end);
      intervals.sort(function(int1, int2) {
        return int1.compare(int2);
      });
      
      // calculate height, laneHeight, margin and offset
      var height = this.opts.theme.intervalBorderSize * 2 + this.opts.theme.intervalHeight;
      var laneHeight = Math.max(height, this.opts.theme.laneHeight == null ? 1.5 * height : this.opts.theme.laneHeight);
      var intervalMarginInPx = this.opts.theme.intervalMarginInPx == null ? 0.5 * laneHeight : this.opts.theme.intervalMarginInPx;
      var offset = -1 * top * laneHeight;
      if (this.opts.theme.intervalPosition == 'top') {
        offset += 0;
      } else if (this.opts.theme.intervalPosition == 'bottom') {
        offset += laneHeight - height;
      } else {
        offset += 0.5 * (laneHeight - height); 
      }

      // iterate over intervals and create a 'new' or 'reuse' one
      var swimlanesView = this.height / laneHeight;
      var swimlanesTotal = 0;
      var intervalsLen = intervals.length;
      var swimlanesXPoses = [];
      var processId = util.randomId();
      for (var i = 0; i < intervalsLen; i++) {
        var interval = intervals[i];

        // determine the x-position and width
        var x1 = this.resolver.getRelativePixelPos(interval.start);
        var x2 = this.resolver.getRelativePixelPos(interval.end);
        var width = Math.max(0.1, x2 - x1);
        
        /*
         * Check if we currently have a swimlane.
         */
        var swimlane = interval.get(this.gPositionAttr);
        if (typeof(swimlane) == 'undefined' || swimlane == null) {    
          swimlane = this.determineSwimlane(swimlanesXPoses, interval, x1, intervalMarginInPx);
        }
        swimlanesTotal = Math.max(swimlane + 1, swimlanesTotal);

        // mark the swimlane as blocked
        swimlanesXPoses[swimlane] = x2;

        // layout the representor, if visible
        if (swimlane >= Math.floor(top) && swimlane <= Math.ceil(bottom)) {
          var borderedX = x1 + this.opts.theme.intervalBorderSize;
          var borderedWidth = Math.max(0.1, width - 2 * this.opts.theme.intervalBorderSize);
          this.layoutRepresentor(interval, borderedX, swimlane * laneHeight + offset, borderedWidth, processId);
        }
      }

      // remove all the unneeded lines
      this.view.children('[data-processId][data-processId!=' + processId + ']').remove();
      
      // fire the view-change event
      this.view.trigger('viewchange', { start: start, end: end, top: top, bottom: bottom, swimlanesView: swimlanesView, swimlanesTotal: swimlanesTotal });
    },
    
    layoutRepresentor: function(interval, x, y, width, processId) {
      
      // check if we have a guid
      var guid = interval.get(this.guidAttr);
      
      // get the representor for the guid
      var representor = null;
      if (typeof(guid) == 'undefined' || guid == null) {
        guid = util.randomId();
        interval.set(this.guidAttr, guid);
      } else {
        representor = this.view.children('#' + guid);
      }
      
      // generate a new representor if we didn't find one or none was there
      if (representor == null || representor.size() == 0) {
        representor = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
        representor.attr({ 'id': guid, 'height': this.opts.theme.intervalHeight });
        representor.css({ 
          'stroke': this.opts.theme.intervalBorderColor, 'stroke-width': this.opts.theme.intervalBorderSize,
          'fill': this.opts.theme.intervalColor
        });
                
        representor.appendTo(this.view);
      }
      representor.attr({ 'data-processId': processId });

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
      interval.set(this.gPositionAttr, swimlane);
      
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