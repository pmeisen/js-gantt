define(['jquery',
    'net/meisen/general/date/DateLibrary',
    'net/meisen/ui/gantt/svg/SvgIllustrator',
    'net/meisen/ui/svglibrary/SvgLibrary',
    'net/meisen/ui/svglibrary/required-svg/LoadingCircles'], function ($,
                                                                       datelib,
                                                                       SvgIllustrator,
                                                                       svglib,
                                                                       loadingImage) {

    /*
     * Hidden utilities, only used within the GanttChart.
     */
    var utilities = {
        generateMap: function (mapper, names) {
            var group = this.validateArray(mapper.group);
            var label = this.validateArray(mapper.label);
            var tooltip = this.validateArray(mapper.tooltip);

            var mappedGroup = this.createArray(group.length, -1);
            var mappedLabel = this.createArray(label.length, -1);
            var mappedTooltip = this.createArray(tooltip.length, -1);

            // create the initial map
            var map = {
                start: -1,
                end: -1,
                group: mappedGroup,
                label: mappedLabel,
                tooltip: mappedTooltip,

                val: function(name, record) {
                    if (record == null || !$.isArray(record) || record.length == 0) {
                        return;
                    }

                    for (var i = 0; i < names.length; i++) {
                       if (names[i] == name) {
                           return record[i];
                       }
                    }
                },

                get: function (type, record) {

                    // get the array
                    var arr = null;
                    if (type == 'group') {
                        arr = this.group;
                    } else if (type == 'label') {
                        arr = this.label;
                    } else if (type == 'tooltip') {
                        arr = this.tooltip;
                    } else {
                        arr = null;
                    }

                    // make sure we have something
                    if (arr == null || arr.length == 0) {
                        return [];
                    } else {
                        var len = arr.length;
                        var vals = [];
                        for (var i = 0; i < len; i++) {
                            var val = record[arr[i]];
                            vals.push(val);
                        }
                        return vals;
                    }
                }
            };

            // get the arrays to look through
            var arrays = [
                [group, mappedGroup],
                [label, mappedLabel],
                [tooltip, mappedTooltip]
            ];

            // look-up the names and the defined maps
            $.each(names, function (idx, val) {
                if (val == mapper.startname) {
                    map.start = idx;
                } else if (val == mapper.endname) {
                    map.end = idx;
                }

                $.each(arrays, function (nr, pair) {
                    var arrayIdx = $.inArray(val, pair[0]);
                    if (arrayIdx != -1) {
                        pair[1][arrayIdx] = idx;
                    }
                });
            });

            // validate the result, no -1 present anymore
            var validateValue = function (value) {
                if (!$.isNumeric(value) || parseInt(value) !== value || value < 0) {
                    throw Error('Mapping failed (reason: value="' + value + '", map="' + JSON.stringify(map) + '", names="' + JSON.stringify(names) + '")');
                }
            };
            $.each(map, function (key, value) {

                if ($.isFunction(value)) {
                    // nothing to do
                } else if ($.isArray(value)) {
                    $.each(value, function (idx, val) {
                        validateValue(val);
                    });
                } else {
                    validateValue(value);
                }
            });

            return map;
        },

        createArray: function (length, value) {
            var res = [];

            for (var i = 0; i < length; i++) {
                res[i] = value;
            }

            return res;
        },

        validateArray: function (array) {
            var res;

            if (!$.isArray(array)) {
                res = [];
                res.push(array);
            } else {
                res = array;
            }

            return res;
        },

        initTimeaxis: function (timeaxis, map, records) {
            var start = timeaxis.start;
            var end = timeaxis.end;

            var needStart = start == null || typeof(start) == 'undefined';
            var needEnd = end == null || typeof(end) == 'undefined';

            if (needStart || needEnd) {

                // TODO! What if we have numbers
                // get the needed values
                if (records == null || typeof(records) == 'undefined' || !$.isArray(records) || records.length == 0 ||
                    map == null || typeof(map) == 'undefined' || map.start == -1 || map.end == -1) {
                    start = needStart ? datelib.createUTC() : start;
                    end = needEnd ? datelib.createUTC(null, null, null, 23, 59, 0) : end;
                } else {
                    var max = -1;
                    var min = -1;

                    $.each(records, function (idx, val) {
                        var s = val[map.start].getTime();
                        var e = val[map.end].getTime();

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
                            start = datelib.createUTC(start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate());
                        } else {
                            start = new Date(min);
                            start = datelib.createUTC(start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate());
                        }
                    }

                    // get the end if needed
                    if (needEnd) {
                        if (min == -1 && max == -1) {
                            end = datelib.createUTC(null, null, null, 23, 59, 0);
                        } else if (max == -1) {
                            end = new Date(min);
                            end = datelib.createUTC(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), 23, 59, 0);
                        } else {
                            end = new Date(max);
                            end = datelib.createUTC(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), 23, 59, 0);
                        }
                    }
                }

                // set the new values
                return $.extend(true, timeaxis, {start: start, end: end});
            } else {
                return timeaxis;
            }
        }
    };

    /*
     * Default constructor...
     */
    GanttChart = function () {
    };

    /*
     * Extended prototype
     */
    GanttChart.prototype = {
        defaultCfg: {

            theme: {
                loadingBackgroundColor: '#CCCCCC',
                loadingBackgroundPosition: 'center center',
                loadingBackgroundRepeat: 'no-repeat',

                errorBackgroundColor: '#A30B1D'
            },

            illustrator: {
                factory: function () {
                    return new SvgIllustrator()
                },
                config: {}
            },

            position: 'center',

            throwException: false,

            data: {
                url: null,
                postProcessor: function (data) {
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

        init: function (selector, cfg) {
            this.opts = $.extend(true, {}, this.defaultCfg, cfg);

            selector = selector instanceof $ ? selector : $(selector);
            selector.children('.ganttchart').remove();

            this.container = $('<div></div>');
            this.container.addClass('ganttchart');
            this.container.css('overflow', 'hidden');
            this.container.css('position', 'relative');

            // set the positioning
            if (this.opts.position == 'center' || this.opts.position == 'left') {
                this.container.css('margin-right', 'auto');
            }
            if (this.opts.position == 'center' || this.opts.position == 'right') {
                this.container.css('margin-left', 'auto');
            }
            this.container.appendTo(selector);

            this.view = $('<div></div>');
            this.view.addClass('ganttview');
            this.view.css('position', 'absolute');
            this.view.css('overflow', 'hidden');
            this.view.css('zIndex', 0);
            this.view.appendTo(this.container);

            this.indicator = $('<div></div>');
            this.indicator.addClass('ganttloading');
            this.indicator.css('backgroundRepeat', this.opts.theme.loadingBackgroundRepeat);
            this.indicator.css('backgroundPosition', this.opts.theme.loadingBackgroundPosition);
            this.indicator.css('backgroundColor', this.opts.theme.loadingBackgroundColor);
            this.indicator.css('position', 'absolute');
            this.indicator.css('zIndex', 1000);
            svglib.setBackgroundImage(this.indicator, loadingImage);
            this.indicator.appendTo(this.container);

            this.error = $('<div></div>');
            this.error.addClass('gantterror');
            this.error.css('backgroundColor', this.opts.theme.errorBackgroundColor);
            this.error.css('position', 'absolute');
            this.error.css('zIndex', '500');
            this.error.appendTo(this.container);

            var _ref = this;
            $(this.view).on('load', function () {
                _ref.mask();
            }).on('renderStart', function () {
                _ref.mask();
            }).on('renderEnd', function () {
                _ref.unmask();
            }).on('error', function (event, data) {
                _ref.showError(data);
            }).on('changeTimeaxis', function (event, data) {
                _ref.changeTimeaxis(data.start, data.end, data.granularity, data.force);
            });

            // initialize the illustrator
            this.illustrator = this.opts.illustrator.factory();
            this.illustrator.init(this.view, this.opts.illustrator.config);
            this.illustrator.on('finishedLayouting', function () {
                _ref.view.trigger('renderEnd');
            });

            this.load();
        },

        mask: function () {
            if (this.masking != 'loading') {
                this.masking = 'loading';

                this.error.hide();
                this.indicator.show();
            }
        },

        unmask: function () {
            if (this.masking != null) {
                this.indicator.hide();
                this.error.hide();

                this.masking = null;
            }
        },

        resize: function (width, height) {
            this.container.css('width', width);
            this.container.css('height', height);

            var innerWidth = this.container.width();
            var innerHeight = this.container.height();
            this.indicator.css('width', innerWidth);
            this.indicator.css('height', innerHeight);
            this.error.css('width', innerWidth);
            this.error.css('height', innerHeight);

            // fire the resize event
            this.view.trigger('sizechanged', {width: innerWidth, height: innerHeight});
        },

        changeTimeaxis: function (start, end, granularity, force) {
            if (force || (typeof(granularity) != 'undefined' && this.opts.timeaxis.granularity != granularity)
                || (typeof(start) != 'undefined' && this.opts.timeaxis.start != start)
                || (typeof(end) != 'undefined' && this.opts.timeaxis.end != end)) {

                this.opts.timeaxis.start = typeof(start) != 'undefined' ? start : this.opts.timeaxis.start;
                this.opts.timeaxis.end = typeof(end) != 'undefined' ? end : this.opts.timeaxis.end;
                this.opts.timeaxis.granularity = typeof(granularity) != 'undefined' ? granularity : this.opts.timeaxis.granularity;

                this.render();
            }
        },

        load: function () {
            this.view.trigger('load');

            if (typeof(this.opts.data.url) == 'undefined' || this.opts.data.url == null) {
                this.render();
            } else {
                var _ref = this;
                $.getJSON(this.opts.data.url).done(function (data) {
                    var postProcessedData = $.isFunction(_ref.opts.data.postProcessor) ? _ref.opts.data.postProcessor(data) : data;
                    if (postProcessedData == null) {
                        _ref.view.trigger('error', {error: null, message: 'Postprocessing of data failed', nr: '1001'});
                    } else {
                        _ref.render(postProcessedData);
                    }
                }).fail(function (error) {
                    _ref.view.trigger('error', {error: error, message: 'Unable to load data', nr: '1000'});
                });
            }
        },

        render: function (loaded) {

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
                this.view.trigger('error', {error: error, message: 'Failed to initialize rendering', nr: '1002'});
                return;
            }

            // use a time-out to make sure that the mask is shown
            var _ref = this;
            window.setTimeout(function () {

                try {
                    _ref.illustrator.draw(data.timeaxis, data.records, map);
                } catch (error) {
                    _ref.view.trigger('error', {error: error, message: 'Failed to draw', nr: '1003'});
                }
            }, 50);
        },

        showError: function (data) {
            if (this.opts.throwException === true) {
                throw data.error;
            } else if (console && $.isFunction(console.error)) {
                console.error(data);
            }

            if (this.masking != 'error') {
                this.masking = 'error';

                this.indicator.hide();
                this.error.show();
            }
        },

        createSampleEnd: function (n) {
            n = typeof n !== n instanceof Date ? n : new Date();
            return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 23, 59, 0));
        },

        createSampleData: function (n, amount) {

            // just some stuff to create some sample time-intervals
            n = typeof n !== n instanceof Date ? n : new Date();
            var createDate = function (h, m, s) {
                return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), h, m, s));
            };
            var createRecord = function (h1, m1, s1, h2, m2, s2, label) {
                return [
                    createDate(h1, m1, s1), createDate(h2, m2, s2), label
                ];
            };
            var rnd = function (min, max) {
                return Math.floor(min + Math.random() * (max - min));
            };

            var result = [];
            amount = typeof amount === 'number' ? amount : 5;
            for (var i = 0; i < amount; i++) {
                var sH = rnd(1, 20);
                var sM = rnd(1, 59);
                var sS = rnd(1, 59);
                var eH = rnd(sH + 1, 23);
                var eM = rnd(1, 59);
                var eS = rnd(1, 59);

                var start = sH * 60 * 60 + sM * 60 + sS;
                var end = eH * 60 * 60 + eM * 60 + eS;

                var duration = end - start;

                result.push(createRecord(sH, sM, sS, eH, eM, eS, duration + ' seconds'));
            }

            return result;
        }
    };

    /*
     * Add the plug-in functionality for jQuery
     */
    GanttChart.bind = function ($) {

        $.fn.ganttChart = function () {
            var charts = [];

            // get the arguments
            var args = Array.prototype.slice.call(arguments);

            // get the arguments
            var config = args.length == 1 && typeof(args[0]) == 'object' ? args[0] : null;

            // create a chart for each element, if we have a configuration defined
            this.each(function () {
                var el = $(this);
                var chart = el.data('ganttchart');

                if (config != null && (typeof(chart) == 'undefined' || chart == null)) {
                    chart = new GanttChart();
                    chart.init(el, config);
                    el.data('ganttchart', chart);
                    charts.push(chart);
                } else if (config == null && typeof(chart) != 'undefined' && chart != null) {
                    charts.push(chart);
                } else if (config == null && typeof(chart) != 'undefined' && chart != null) {
                    chart.init(el, config);
                    charts.push(chart);
                }
            });

            // make the resize function available
            this.resize = function (width, height) {
                $.each(charts, function () {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.resize(width, height);
                });
            };

            // make the changeGranularity function available
            this.changeTimeaxis = function (start, end, granularity, force) {
                $.each(charts, function () {
                    //noinspection JSPotentiallyInvalidUsageOfThis
                    this.changeTimeaxis(start, end, granularity, force);
                });
            };

            return this;
        };
    };

    // bind internally to the
    GanttChart.bind($);

    return GanttChart;
});