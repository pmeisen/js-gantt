# js-gantt
[![npm version](http://img.shields.io/npm/v/js-gantt.svg?style=flat)](https://npmjs.org/package/js-gantt "View this project on npm")
[![Build Status](https://travis-ci.org/pmeisen/js-gantt.svg?branch=master)](https://travis-ci.org/pmeisen/js-gantt)

Library to create easy to configure and use simple Gantt-Charts. The created Gantt-Charts can be used to visualize multiple time-intervals. 
The rich configuration allows among other things:
- customizable axes labeling,
- modifiable sizing for all visual components (i.e., intervals, swim-lanes, chart, axes)
- rule-based coloring,
- tooltip configuration, and
- many many more.

## How to Install

The library can be used with `bower`, `requireJs` or as individual `JavaScript Import`. The following paragraphs 
explain how to use the library in the different scenarios.

### Using js-gantt with `bower`

```
bower install --save js-gantt
```

The library will be added to your `bower-components`. By default the `js-gantt.js` is selected as single main file, which is the
not minified version of the library (the minified/uglified version is `js-gantt.min.hs`). Examples on how to use the library can 
be found [here](#usage-examples).

### Using js-gantt with `requireJs`

If you are building larger web-applications and you want to enjoy the advantage of [requireJs](http://requirejs.org/), you
need to include the sources (and not the optimized libraries). To do so, you may download the tarball or a zip-archive from 
GitHub and place it into your `scripts` folder. You can also utilize `npm` or `bower` to download the sources automatically 
and override the `main` configuration (see [here](#advanced-bower-and-requirejs)). You can then require the needed library as following:

```javascript
require(['net/meisen/ui/gantt/GanttChart'], function (SvgLibrary) {
    var gantt = new GanttChart();
});
```

### Using js-gantt with `JavaScript Import`

If you simple want to use the library within your web-site, you can easily do so by downloading it, deploying it on your
server and adding `<script>...</script>` tags:

```html
<script src="/js/js-gantt.min.js"></script>
```

The library is bound to the `window` instance and thus is directly available for any other script:

```html
<div id="chart" style="margin: 20px auto"></div>

<script src="/js/js-gantt.min.js"></script>
<script type="text/javascript">
    var chart =  new GanttChart();
    var el = document.getElementById('chart');
    chart.init(el, {
        data: {
            names: ['start', 'end', 'label'],
            records: chart.createSampleData(n, 6),
            mapper: {
                startname: 'start',
                endname: 'end',
                tooltip: ['label']
            },
            timeaxis: {
                end: chart.createSampleEnd(n),
                granularity: 'mi'
            }
        }
    });
    chart.resize(500, 250);
</script>
```

If you'd like to have this library available through a CDN, please **Star** the project.

## Usage Examples

Here are some [jsFiddle](https://jsfiddle.net/) examples utilizing the library. All examples are purely based
on this library, no additional dependencies needed.

### A First Example: Showing some sample data

<p align="center">
  <img src="https://raw.githubusercontent.com/pmeisen/js-gantt/master/resources/simple-example.png" alt="Simple Example" width="400">
</p>

https://jsfiddle.net/pmeisen/pfg7t1uw/

This example demonstrates how easy it is to use the library and config some different aspects like:

- data:
    - loading of data
    - mapping
    - time-axis
- illustrator:
    - scrollbars
    - axis
    - theme (interval size)

### Coloring: 



## Configuration

The Gantt Chart library provides a rich set of configuration parameters. This paragraph tries to address most of the configurations
possible. To get an easy start, it is recommend to look at the [Usage Examples](#usage-examples) and adapt the different configuration
parameters as needed and described here.

A full configuration (with the default settings) is as follows:

```javascript
var config = {
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
    },
    theme: {
        loadingBackgroundColor: '#CCCCCC',
        loadingBackgroundPosition: 'center center',
        loadingBackgroundRepeat: 'no-repeat',
        errorBackgroundColor: '#A30B1D'
    },
    illustrator: {
        factory: function () {
            // the default configuration is based on this usage
            return new SvgIllustrator();
        },
        config: {
            theme: {
                fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                fontSize: '12px'
            },
            general: {
                margin: 2
            },
            view: {
                showGrid: true,
                showBorder: true,
                showBackground: true,
                showPositionMarker: true,
                showIntervalMarker: true,
                showPositionToolTip: true,
                showIntervalToolTip: true,
                coloring: {
                    groupMapping: null,
                    colorizer: function (interval, map, defaultColor) {
                        // there is a default implemented, please have 
                        // a look at the source-code (IntervalView.js)
                        // for furhter insights
                    }
                },
                tooltip: null,
                formatter: {
                    tooltip: function (interval, map, textFormat, theme) {
                        // there is a default implemented, please have 
                        // a look at the source-code (IntervalView.js)
                        // for furhter insights
                    }
                },
                theme: {
                    backgroundColor: '#FFFFFF',
                    laneHeight: null,
                    intervalPosition: 'middle',
                    intervalHeight: 20,
                    intervalColor: '#7CB5EC',
                    intervalBorderColor: '#99C9F7',
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
                    tooltipTextColor: '#000000',
                    intervalMarginInPx: null
                }
            },
            axis: {
                viewSize: null,
                padding: 100
            },
            scrollbars: {
                vertical: {
                    theme: {
                        arrowSize: 14,
                        scrollareaColor: '#EEEEEE',
                        markerColor: '#BFC8D1',
                        buttonColorBorder: '#666666',
                        arrowColor: '#666666',
                        buttonColor: '#EBE7E8'
                    },
                    hideOnNoScroll: false,
                    propagateScrollOnNoMove: false,
                    step: null
                },
                horizontal: {
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
                    step: null
                }
            }
        }
    },
    position: 'center',
    throwException: false
};
```



## Advanced: Bower and RequireJs

If you utilize the library with `requireJs`, you may want to use the `sources` instead of the minified or combined version 
distributed in the `dist`-folder. The library is developed using `requireJs` and ensures an easy usage with any 
`Asynchronous Module Definition` (see [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)).

If you have a look at the project's `gruntfile.js`, you will notice, that the libraries supporting `AMD` (e.g., `js-misc`, 
`js-svglibrary`) are also added to this project using their sources. The following lines in the `gruntfile.js` ensures that 
usage:

```json
{
    "bower": {
        "dep": {
            "options": {
                "includeDev": true,
                "checkExistence": true,
                "paths": "bower-components",
                "overrides": {
                    "js-misc": {"ignore": true},
                    "js-svglibrary": {"ignore": true}
                }
            },
            "dest": "scripts"
        }
    },
    
    "copy": {
        "dep": {
            "files": [
                {"expand": true, "flatten": false, "cwd": "bower-components/js-gantt/src", "src": "**/*", "dest": "scripts"}
            ]
        }
    }
}
```