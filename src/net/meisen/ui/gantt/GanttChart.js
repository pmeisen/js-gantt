define(['jquery', 'date'], function ($, Date) {
  
  $.fn.ganttChart = function () {
    var args = Array.prototype.slice.call(arguments);

    if (args.length == 1 && typeof(args[0]) == "object") {
      build.call(this, args[0]);
    }

    // work around
    this.resize = function(width, height) {
      $('.ganttview').css({'width': width +'px', 'height': height +'px'});
    };

    this.changeGranularity = function(granularity, forceRedraw) {
      $('.ganttview').trigger('gantt-granularity-change', {g:granularity, f:forceRedraw});
    };

    return this;
  };

  function build(config) {
    var els = this;
    var defaults = {
      cellWidth: 21,
      cellHeight: 31,
      rowHeaderWidth: 100,
      chartWidth: 800,
      granularity: 'days',
      recursionDepth: Number.MAX_VALUE
    };

    var opts = $.extend(true, defaults, config);

    if (opts.data) {
      build();
    } else if (opts.dataUrl) {
      $.getJSON(opts.dataUrl, function (data) {
        opts.data = data;
        build();
      });
    }

    function build() {
      els.each(function () {
        var container = $(this);
        container.addClass('ganttview');

        var div = $('<div></div>');
        div
          .css({"width": opts.chartWidth +'px'})
          .appendTo(container)
        ;

        var indicator = $('<img id="gantt-loading-indicator" src="http://media.giphy.com/media/9xx7IW31zndzW/giphy.gif" width="20" height="20" />');
        container.append(indicator);

        $(div)
          .on('gantt-show-indicator', function() {
            indicator.show();
          })
          .on('gantt-hide-indicator', function() {
            indicator.hide();
          });

        setMinMax(opts.data);

        new Chart(div, opts).render();
      });
    }

    function setMinMax(data) {
      var minmax = {min: Number.MAX_VALUE, max: Number.MIN_VALUE};

      if (!(opts.start && opts.end)) {
        for (var element in data ) {
          var intervals = data[element].intervals;

          for (var interval in intervals) {
            var item = intervals[interval];

            if (item.start < minmax.min)
              minmax.min = item.start;

            if (item.end > minmax.max)
              minmax.max = item.end;
          }
        }

        opts.start = minmax.min;
        opts.end = minmax.max;
      }
    }
  }

  var Chart = function(div, opts) {
    var rowContainer;

    function renderData() {
      // clean up
      div.empty();

      // loading indicator
      div.trigger('gantt-show-indicator');

      setTimeout(function () {
        // data "rows"
        for (var r in opts.data) {
          var row = opts.data[r];

          rowContainer = $('<div class="row-container"></div>');
          var rowHeader = $('<div class="row-header"><span>' + row.id + ': ' + row.name + '</span></div>');
          rowHeader.width(opts.rowHeaderWidth);
          var dataContainer = $('<div class="row-data"></div>');

          // element of interval of current row
          for (var interval in row.intervals) {
            var item = row.intervals[interval];

            var lengthInMinutes;
            if (item.start instanceof Date && item.end instanceof Date)
              lengthInMinutes = minutesBetween(item.start, item.end);
            else
              lengthInMinutes = item.end - item.start;

            // make size available in builder functions
            item.size = lengthInMinutes;

            var offset = item.start - opts.start;
            var size = lengthInMinutes;

            if (item.start instanceof Date && opts.granularity == 'minutes')
              offset /= 60 * 1000;
            if (item.start instanceof Date && opts.granularity == 'hours') {
              offset /= 60 * 60 * 1000;
              size /= 60;
            }
            if (item.start instanceof Date && opts.granularity == 'days') {
              offset /= 24 * 60 * 60 * 1000;
              size /= 24 * 60;
            }


            var rows = dataContainer.find('.item-row');

            // recursive search of first row (top down) with space to spare
            var getRow = function (currentItem, step) {
              // fallback for first element (no row existing yet) and recursion end
              if (interval == 0 || step > rows.length || step > opts.recursionDepth || opts.recursionDepth == 0) {

                var itemRow = $('<div class="item-row"></div>');
                itemRow.appendTo(dataContainer);

                // return newly created row
                return itemRow;
              }

              var rowCandidate = rows.eq(step - 1);
              // data is appended with item-block (see below)
              var lastItemInRow = rowCandidate.find('.item-block').last().data();

              var overlap = isOverlapping(currentItem, lastItemInRow);

              if (overlap)
                return getRow(currentItem, ++step);
              else {
                return rowCandidate;
              }
            };

            // recursion start
            var itemRow = getRow(item, 1);

            var label = row.labelBuilder ? row.labelBuilder(item, opts) : interval;
            var title = row.titleBuilder ? row.titleBuilder(item, opts) : interval;

            // appending item-block to row
            $('<div class="item-block" title="' + title + '"><div class="item-text">' + label + '</div></div>')
              .css({
                'width': (opts.cellWidth * size) - 2 + 'px',
                'left': (opts.cellWidth * offset) + 1 + 'px'
              })
              .appendTo(itemRow)
              .data(item);
          }

          rowContainer.append(rowHeader);
          rowContainer.append(dataContainer);
        }

        renderHeader();

        div.append(rowContainer);

        // remove loading indicator
        div.trigger('gantt-hide-indicator');
      }, 50);
    }

    function renderHeader() {
      // render header
      var headerDiv = $('<div class="ganttview-hzheader"></div>');
      var monthsDiv = $('<div class="ganttview-hzheader-months"></div>');
      var daysDiv = $('<div class="ganttview-hzheader-days"></div>');
      var totalW = 0;

      if (!(opts.data[0].intervals[0].start instanceof Date)) {
        for (var i = opts.start; i <= opts.end; ++i) {
          var w = opts.cellWidth;
          totalW += w;

          daysDiv.append('<div class="ganttview-hzheader-day">' + i + '</div>');
        }

        // only for spacing (remove completly?)
        monthsDiv
          .append($("<div>", {
            "class": "ganttview-hzheader-month",
            "css": {"width": (totalW) + "px"}
          })
            .append("time unit")
        );
      } else {
        var currentTop = {};

        for (var i = opts.start.getTime(); i <= opts.end.getTime(); /* increment at end of loop */) {
          totalW += opts.cellWidth;

          var currentDate = new Date(i);

          var increment = 24 * 60 * 60 * 1000;

          var topTier = currentDate.getMonth();
          var bottomTier = currentDate.getDate();
          var lengthOfTopTier = new Date(currentDate.getYear(), topTier, 0).getDate();

          // adjustment for hours granularity
          if (opts.granularity == 'hours') {
            increment /= 24;

            topTier = currentDate.getDate();
            bottomTier = currentDate.getHours();
            lengthOfTopTier = 24;
          }

          // adjustment for minutes granularity
          if (opts.granularity == 'minutes') {
            increment /= 24 * 60;

            topTier = currentDate.getHours();
            bottomTier = currentDate.getMinutes();
            lengthOfTopTier = 60;
          }

          daysDiv.append('<div class="ganttview-hzheader-day">' + bottomTier + '</div>');

          if (topTier != currentTop) {
            currentTop = topTier;

            // length adjustment because start/end might not be the same as first/last of top tier
            if (opts.granularity == 'days') {
              if (opts.start.getYear() == currentDate.getYear() && opts.start.getMonth() == currentTop)
                lengthOfTopTier -= (opts.start.getDate() - 1);
              if (opts.end.getYear() == currentDate.getYear() && opts.end.getMonth() == currentTop)
                lengthOfTopTier -= (lengthOfTopTier - opts.end.getDate());

              // days are 1 based while minutes and hours start at 0
              --lengthOfTopTier;
            }
            if (opts.granularity == 'hours') {
              if (opts.start.getYear() == currentDate.getYear() && opts.start.getMonth() == currentDate.getMonth() && opts.start.getDate() == currentTop)
                lengthOfTopTier -= (opts.start.getHours());
              if (opts.end.getYear() == currentDate.getYear() && opts.end.getMonth() == currentDate.getMonth() && opts.end.getDate() == currentTop)
                lengthOfTopTier -= (lengthOfTopTier - opts.end.getHours());
            }
            if (opts.granularity == 'minutes') {
              if (opts.start.getYear() == currentDate.getYear() && opts.start.getMonth() == currentDate.getMonth() && opts.start.getDate() == currentDate.getDate() && opts.start.getHours() == currentTop)
                lengthOfTopTier -= (opts.start.getHours());
              if (opts.end.getYear() == currentDate.getYear() && opts.end.getMonth() == currentDate.getMonth() && opts.end.getDate() == currentDate.getDate() && opts.end.getHours() == currentTop)
                lengthOfTopTier -= (lengthOfTopTier - opts.end.getMinutes());
            }

            var borderAdjustment = i == opts.start.getTime() ? 0 : 1;

            monthsDiv
              .append($("<div>", {
                "class": "ganttview-hzheader-month",
                "css": {"width": (opts.cellWidth * lengthOfTopTier - borderAdjustment) + "px"}
              })
                .append(currentTop)
            );
          }

          // increment
          i += increment;
        }
      }

      headerDiv.css({'left': opts.rowHeaderWidth +'px'});

      daysDiv.css("width", totalW + "px");
      headerDiv.append(monthsDiv).append(daysDiv);
      div.prepend(headerDiv);

      // calc and set row width
      rowContainer.find('.row-data').width(div.find('.ganttview-hzheader-days').width());

      div.find('.row-container').css('width', totalW + opts.rowHeaderWidth);

      var percent = (100 / totalW * opts.cellWidth).toFixed(2);
      /*div.find('.item-row').css({
       'background': 'repeating-linear-gradient(90deg, #f0f0f0, rgba(0,0,0,0) 1%, rgba(0,0,0,0) '+ (percent-1) +'%, #f0f0f0 '+ (percent) +'%)',
       'background-repeat': 'repeat-x'
       });*/
    }

    // granularity change handler
    $('.ganttview').on('gantt-granularity-change', function(event, data) {
      if (data.f || opts.granularity != data.g) {
        opts.granularity = data.g;

        renderData();
      }
    });

    return {
      render: renderData
    };
  };

  /**
   * Convenient function to detect overlaps.
   
   * @param item contains start: {number}|{date}, size: {number}
   * @return true if items overlap or touch else false
   */
  var isOverlapping = function(item1, item2) {
    var compValue = item1.start - item2.start;

    if (compValue == 0) {
      return true;
    }

    var first = compValue < 0 ? item1 : item2;
    var next = compValue > 0 ? item1 : item2;

    var scalingFactor = 1;
    if (first.start instanceof Date) {
      // scale minutes to millis
      scalingFactor = (60 * 1000);
    }

    // overlap if next start < first end
    return +next.start < +first.start + +first.size * scalingFactor;
  };

  var minutesBetween = function(start, end) {
    if (!start || !end)
      return 0;

    start = Date.parse(start);
    end = Date.parse(end);

    if (start.getYear() == 1901 || end.getYear() == 8099)
      return 0;

    return (end.getTime() - start.getTime()) / (60 * 1000) + 1;
  };
});