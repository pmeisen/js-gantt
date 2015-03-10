define(['jquery'], function ($) {

  var utilities = {
    createArrow: function(size, direction, click) {
      var arrow = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      
      el = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      el.attr({ 'width': size, 'height': size, 'x': 0, y: 0, 'rx': 0, 'ry': 0 });
      el.css({ 'fill': '#ebe7e8', 'stroke': '#bbbbbb', 'stroke-width': 1 });
      el.appendTo(arrow);
      
      el = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
      if (direction == 'left') {
        el.attr({ 'd': 'M 8 4 L 8 10 5 7' });
      } else {
        el.attr({ 'd': 'M 6 4 L 6 10 9 7' });
      }
      el.css({ 'fill': '#666666' });
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
          anchor: event.pageX,
          scrollbar: scrollbar
        };
                
        var moveHandler = function(event) {
          var diff = event.pageX - status.anchor;
          if (diff == 0) {
            return;
          } else {
            var view = status.scrollbar.getView();
            var direction = diff < 0 ? 'left' : 'right';
            diff = Math.abs(diff) * (view.total / status.scrollbar.getScrollareaWidth());

            status.scrollbar.move(direction, diff);
          }
          status.anchor = event.pageX;
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
  HorizontalScrollbar = function() {
  };
  
  /*
   * Extended prototype
   */
  HorizontalScrollbar.prototype = {
    bar: null,
    scrollarea: null,
    marker: null,
    leftArrow: null,
    rightArrow: null,
    
    width: 0,
    view: {
      position: 0,
      size: 0, 
      total: 0
    },
    
    defaultCfg: {
      theme: {
        arrowSize: 14
      }
    },
    
    init: function(canvas, cfg) {
      this.opts = $.extend(true, {}, this.defaultCfg, cfg);
      
      var el, current;
      var _ref = this;

      // create a group for the scrollbar
      this.bar = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      current = this.bar;
      
      // create the scrollbar
      this.scrollarea = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.scrollarea.attr({ 'height': this.opts.theme.arrowSize, y: 0, 'rx': 0, 'ry': 0 });
      this.scrollarea.css({ 'fill': '#eeeeee', 'stroke': '#eeeeee', 'stroke-width': 1 });
      this.scrollarea.appendTo(current);
      
      // create the scroll-marker
      this.marker = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
      this.marker.attr({ 'height': this.opts.theme.arrowSize, 'y': 0, 'rx': 0, 'ry': 0 });
      this.marker.css({ 'fill': '#bfc8d1', 'stroke': '#bfc8d1', 'stroke-width': 1, 'cursor': 'default' });
      this.marker.appendTo(current);
      this.marker.mousedown(utilities.createScroll(this));
      
      // create the left arrow
      this.leftArrow = utilities.createArrow(this.opts.theme.arrowSize, 'left', function() {
        _ref.move('left');
      });
      this.leftArrow.appendTo(current);
      
      // create the right arrow
      this.rightArrow = utilities.createArrow(this.opts.theme.arrowSize, 'right', function() {
        _ref.move('right');
      });
      this.rightArrow.appendTo(current);

      // append the scrollbar
      current.appendTo(canvas);
    },
    
    setPosition: function(x, y) {
      this.bar.attr({ 'transform': 'translate(' + x + ', ' + y + ')' });
    },
    
    move: function(direction, size) {
      size = typeof(size) == 'undefined' || size == null ? this.view.size : size;

      var newPosition = this.view.position + ((direction == 'left' ? -1 : 1) * size);
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
      var changed = this.view.position != position || this.view.size != size || this.view.total != total;
      if (!force && !changed) {
        return;
      } else {
        this.view = { position: position, size: size, total: total };
      }
      
      var offset = this.opts.theme.arrowSize + 1;
      
      var scrollareaWidth = this.getScrollareaWidth();
      scrollareaWidth = isNaN(scrollareaWidth) ? 0 : scrollareaWidth;
      
      var markerWidth = total == 0 ? 0 : (size / total) * scrollareaWidth;
      var markerPos = total == 0 ? 0 : offset + (position / total) * scrollareaWidth;
      this.marker.attr({ 'width': markerWidth, 'x': markerPos });
      
      // trigger the event if there was a change
      if (changed) {
        this.bar.trigger('viewchange', { position: position, size: size });
      }
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
      
      // calculate the new values
      var offset = this.opts.theme.arrowSize + 1;
      var scrollareaWidth = this.getScrollareaWidth();
      
      this.scrollarea.attr({ 'width': scrollareaWidth, 'x': offset });
      this.rightArrow.attr({ 'transform': 'translate(' + (offset + scrollareaWidth + 1) + ', 0)' });
      
      // force a redraw of the marker
      this.setView(null, null, null, true);
    },
    
    getView: function() {
      return this.view;
    },
    
    getWidth: function() {
      return this.width;
    },
    
    getScrollareaWidth: function() {
      var offset = this.opts.theme.arrowSize + 1;
      return Math.max(0, this.width - 2 * offset);
    },
    
    on: function(event, handler) {
      this.bar.on(event, handler);
    },
    
    off: function(event, handler) {
      this.bar.off(event, handler);
    }
  };
    
  return HorizontalScrollbar;
});