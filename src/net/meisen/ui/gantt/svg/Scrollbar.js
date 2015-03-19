define(['jquery', 'net/meisen/general/Utility'], function ($, Utility) {

  var utilities = {
    createArrow: function(size, direction, click, theme) {
      var arrow = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      arrow.attr('class', 'gantt-scrollbar-arrow');
      
      el = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      el.attr({ 'width': size, 'height': size, 'x': 0, y: 0, 'rx': 0, 'ry': 0 });
      el.css({ 'fill': theme.buttonColor, 'stroke': theme.buttonColorBorder, 'stroke-width': 1 });
      el.appendTo(arrow);
      
      el = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
      if (direction == 'left') {
        el.attr({ 'd': 'M 8 4 L 8 10 5 7' });
      } else if (direction == 'right') {
        el.attr({ 'd': 'M 6 4 L 6 10 9 7' });
      } else if (direction == 'top') {
        el.attr({ 'd': 'M 4 8 L 10 8 7 5' });
      } else if (direction == 'bottom') {
        el.attr({ 'd': 'M 4 6 L 10 6 7 9' });
      }
      el.css({ 'fill': theme.arrowColor });
      el.appendTo(arrow);
      
      arrow.click(function() {
        if ($.isFunction(click)) {
          click({ direction: direction });
        }
      });
      
      return arrow
    }, 
    
    createScroll: function(scrollbar) {
      var _ref = this;
      
      return function(event) {
        
        var status = {
          anchor: scrollbar.type == 'horizontal' ? event.pageX : event.pageY,
          scrollbar: scrollbar
        };
                
        var moveHandler = function(event) {
          var isHorizontal = scrollbar.type == 'horizontal';
          var pos = isHorizontal ? event.pageX : event.pageY;
          var diff = pos - status.anchor;
          
          if (diff == 0) {
            return;
          } else {
            var direction = diff < 0 ? (isHorizontal ? 'left' : 'top') : (isHorizontal ? 'right' : 'bottom');
            diff = status.scrollbar.pixelToCoord(Math.abs(diff));
            status.scrollbar.move(direction, diff);
          }
          status.anchor = pos;
        };
        var disableHandler = function(event) {
          $(window).unbind('mousemove', moveHandler);
          $(window).unbind('mouseup', disableHandler);
        };
        
        $(window).bind('mousemove', moveHandler);
        $(window).bind('mouseup', disableHandler);
      };
    }
  };

  /*
   * Default constructor...
   */
  Scrollbar = function(type) {
    this.type = typeof(type) == 'undefined' || type == null ? 'horizontal' : type;
  };
  
  /*
   * Extended prototype
   */
  Scrollbar.prototype = {
    bar: null,
    scrollarea: null,
    marker: null,
    leftArrow: null,
    rightArrow: null,
    
    size: { height: 0, width: 0 },
    
    extent: 0,
    view: {
      position: 0,
      size: 0, 
      total: 0
    },
    
    defaultCfg: {
      theme: {
        arrowSize: 14,
        scrollareaColor: '#EEEEEE',
        markerColor: '#BFC8D1',
        buttonColorBorder: '#666666',
        arrowColor: '#666666',
        buttonColor: '#EBE7E8'
      },
      hideOnNoScroll: true,
      propagateScrollOnNoMove: false,
      step: 1
    },
    
    init: function(canvas, cfg) {
      var _ref = this;
            
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      // create a group for the scrollbar
      this.bar = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      this.bar.attr('class', 'gantt-scrollbar-container');
      
      // create the scrollbar
      var extentAttribute = this.type == 'horizontal' ? 'height' : 'width';
      this.scrollarea = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.scrollarea.attr({ y: 0, 'rx': 0, 'ry': 0 });
      this.scrollarea.attr(extentAttribute, this.getFixedExtent());
      this.scrollarea.css({ 'fill': this.opts.theme.scrollareaColor, 'stroke': this.opts.theme.scrollareaColor, 'stroke-width': 1 });
      this.scrollarea.appendTo(this.bar);
      this.scrollarea.click(function(event) {
        var offset = _ref.bar.offset();
        var pos = _ref.type == 'horizontal' ? event.pageX - offset.left : event.pageY - offset.top;       
        var coord = _ref.pixelToCoord(pos - (_ref.getFixedExtent() + 1));

        var direction;
        if (this.type == 'horizontal') {
          direction = coord < _ref.view.position ? 'left' : 'right';
        } else {
          direction = coord < _ref.view.position ? 'top' : 'bottom';
        }
        
        _ref.move(direction);
      });
      
      // create the scroll-marker
      this.marker = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.marker.attr({ 'y': 0, 'rx': 0, 'ry': 0 });
      this.marker.attr(extentAttribute, this.getFixedExtent());
      this.marker.css({ 'fill': this.opts.theme.markerColor, 'stroke': this.opts.theme.markerColor, 'stroke-width': 1, 'cursor': 'default' });
      this.marker.appendTo(this.bar);
      this.marker.mousedown(utilities.createScroll(this));
      
      // create the left arrow
      this.leftArrow = utilities.createArrow(this.getFixedExtent(), this.type == 'horizontal' ? 'left' : 'top', function() {
        _ref.move('left', _ref.opts.step);
      }, this.opts.theme);
      this.leftArrow.appendTo(this.bar);
      
      // create the right arrow
      this.rightArrow = utilities.createArrow(this.getFixedExtent(), this.type == 'horizontal' ? 'right' : 'bottom', function() {
        _ref.move('right', _ref.opts.step);
      }, this.opts.theme);
      this.rightArrow.appendTo(this.bar);

      // append the scrollbar
      this.bar.appendTo(canvas);
    },
    
    setPosition: function(x, y) {
      
      /*
       * Nicer sharper look, see:
       * http://stackoverflow.com/questions/18019453/svg-rectangle-blurred-in-all-browsers
       */
      x = Math.floor(x) + 0.5;
      y = Math.floor(y) + 0.5;
      
      this.bar.attr({ 'transform': 'translate(' + x + ', ' + y + ')' });
    },
    
    move: function(direction, steps) {      
      steps = typeof(steps) == 'undefined' || steps == null ? this.view.size - 1 : steps;
      
      var newPosition = this.view.position + ((direction == 'left' || direction == 'top' ? -1 : 1) * steps);
      newPosition = Math.max(0, newPosition);
      newPosition = Math.min(newPosition, this.view.total - this.view.size);
      
      this.setView(newPosition, null, null, false);
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
      var changed = this.view.position != position || this.view.size != size;
      if (!force && !changed && this.view.total == total) {
        return;
      } else {
        this.view = { position: position, size: size, total: total };
      }
      
      if (!this.opts.hideOnNoScroll || this.isScrollable()) {
        this.bar.css('visibility', 'visible');
      } else {
        this.bar.css('visibility', 'hidden');
      }
      
      var offset = this.getFixedExtent() + 1;
      
      var scrollareaExtent = this.getScrollareaExtent();
      scrollareaExtent = isNaN(scrollareaExtent) ? 0 : scrollareaExtent;
      
      var markerExtent = this.coordToPixel(size);
      var markerPos = offset + this.coordToPixel(position);
      if (this.type == 'horizontal') {
        this.marker.attr({ 'width': markerExtent, 'x': markerPos });
      } else {
        this.marker.attr({ 'height': markerExtent, 'y': markerPos });
      }
      
      // trigger the event if there was a change
      if (changed) {
        this.bar.trigger('viewchange', { position: position, size: size, total: total });
        
        // trigger a size change if needed
        var _ref = this;
        setTimeout(function() { 
          var bbox = _ref.bar.get(0).getBBox();
          var size = { 'height': bbox.height, 'width': bbox.width };
          if (_ref.size.height != size.height || _ref.size.width != size.width) {
            _ref.size = size;
            _ref.bar.trigger('sizechanged', _ref);
          }
        }, 0); 
      }
    },
    
    isScrollable: function() {
      return this.view.size != this.view.total
    },
    
    pixelToCoord: function(pixel) {
      return pixel * (this.view.total / this.getScrollareaExtent());
    },
    
    coordToPixel: function(coord) {
      return this.view.total == 0 ? 0 : (coord / this.view.total) * this.getScrollareaExtent();
    },
    
    setExtent: function(extent, force) {
      extent = typeof(extent) == 'undefined' || extent == null ? this.extent : extent;
      force = typeof(force) == 'undefined' || force == null ? false : force;
      
      // check if we have a change or if it was forced to update
      if (!force && this.extent == extent) {
        return;
      } else {
        this.extent = extent;
      }
      
      // calculate the new values
      var offset = this.getFixedExtent() + 1;
      var scrollareaExtent = this.getScrollareaExtent();
      
      if (this.type == 'horizontal') {
        this.scrollarea.attr({ 'width': scrollareaExtent, 'x': offset });
        this.rightArrow.attr({ 'transform': 'translate(' + (offset + scrollareaExtent + 1) + ', 0)' });
      } else {
        this.scrollarea.attr({ 'height': scrollareaExtent, 'y': offset });
        this.rightArrow.attr({ 'transform': 'translate(0, ' + (offset + scrollareaExtent + 1) + ')' });
      }
      
      // force a redraw of the marker
      this.setView(null, null, null, true);
    },
    
    getFixedExtent: function() {
      return this.opts.theme.arrowSize;
    },
    
    getView: function() {
      return this.view;
    },
    
    getExtent: function() {
      return this.extent;
    },
    
    getScrollareaExtent: function() {
      var offset = this.getFixedExtent() + 1;
      return Math.max(0, this.extent - 2 * offset);
    },
    
    bindToWheel: function(selector) {
      var el = selector instanceof jQuery ? selector : $(el);
      
      var eventName = Utility.getSupportedEvent([ 'mousewheel', 'wheel' ]);
      if (eventName == null) {
        return;
      }
      
      var _ref = this;
      el.on(eventName, function(e) {
        var oEvent = e.originalEvent;
        var delta  = oEvent.deltaY || (-1 * oEvent.wheelDelta);
        
        var direction = delta > 0 ? 'bottom' : 'top';
        var oldPos = _ref.view.position;
        _ref.move(direction, Math.abs(delta / 120));
        
        // if there was no scroll propagate it
        return _ref.opts.propagateScrollOnNoMove && oldPos == _ref.view.position;
      });
    },
    
    on: function(event, handler) {
      this.bar.on(event, handler);
    },
    
    off: function(event, handler) {
      this.bar.off(event, handler);
    },
    
    getSize: function() {
      return this.size;
    }
  };
    
  return Scrollbar;
});