var phantom = require('phantom');
var fs = require('fs');

// we keep the instance to close it at the end of the pipe
var phInstance = null;
var svg = null;

phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })

    // load an empty page
    .then(page => {
        return page.open('about:blank').then(status => {
            if (status === 'success') {
                return page;
            } else {
                throw new Error('Unable to load blank page.');
            }
        })
    })

    // inject some scripts
    .then(page => {
        return page.includeJs('https://rawgit.com/pmeisen/js-gantt/master/dist/js-gantt.min.js').then(() => {
            return page;
        });
    })

    // add the SVG with the specified options
    .then(page => {
        return page.evaluate(function () {
            var chartEl = document.createElement('div');
            chartEl.id = 'chart';
            document.body.appendChild(chartEl);

            var chart = new GanttChart();
            chart.init(chartEl, {
                data: {
                    url: 'https://rawgit.com/pmeisen/js-gantt/master/resources/sample-data-array.json',
                    postProcessor: function (data) {
                        var f = 'dd.MM.yyyy HH:mm:ss';
                        for (var i = 0; i < data.length; i++) {
                            var record = data[i];
                            record[1] = GanttChart.DateUtil.parseString(record[1], f);
                            record[2] = GanttChart.DateUtil.parseString(record[2], f);
                        }

                        return {
                            names: ['caller', 'start', 'end',
                                'duration', 'recipient', 'origin',
                                'destination', 'ratepermin', 'costs',
                                'origincontinent', 'destinationcontinent',
                                'callergender', 'recipientgender'],
                            records: data
                        };
                    },
                    mapper: {
                        startname: 'start',
                        endname: 'end',
                        group: ['callergender', 'recipientgender'],
                        label: ['callergender', 'start', 'caller'],
                        tooltip: ['caller', 'recipient', 'start', 'end']
                    },
                    timeaxis: {
                        start: GanttChart.DateUtil.createUTC(2014, 6, 11),
                        end: GanttChart.DateUtil.createUTC(2014, 6, 11, 23, 59, 0),
                        granularity: 'mi'
                    }
                },
                illustrator: {
                    config: {
                        axis: {
                            viewSize: 1440,
                            tickInterval: 360
                        },
                        view: {
                            showBorder: false,
                            tooltip: '{1} called {2}\nbetween {3|date|HH:mm} - {4|date|HH:mm})',
                            coloring: {
                                groupMapping: {
                                    '["Female","Female"]': '#7cb5ec',
                                    '["Male","Female"]': '#434348',
                                    '["Female","Male"]': '#f7a35c',
                                    '["Male","Male"]': '#90ed7d'
                                }
                            },
                            theme: {
                                intervalColor: '#444444',
                                intervalHeight: 10,
                                intervalBorderSize: 0
                            }
                        },
                        scrollbars: {
                            vertical: {
                                hideOnNoScroll: true
                            },
                            horizontal: {
                                hideOnNoScroll: true
                            }
                        }
                    }
                }
            });
            chart.resize(600, 300);
        }).then(() => {
            return page;
        });
    })

    // wait a little depending on the options that should be changed
    .then(page => {
        return new Promise(f => setTimeout(f, 2000)).then(() => page);
    })

    // read the page after the full content is loaded
    .then(page => {
        return page.evaluate(function () {
            return document.getElementsByClassName('ganttview')[0].innerHTML;
        }).then(chart => {
            svg = chart;
            return page;
        });
    })

    // clean up when we are done
    .then(() => {
        phInstance.exit();
    })

    // write the file
    .then(() => {
        try {
            fs.mkdirSync("./output");
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }

        fs.writeFileSync("./output/sample.svg", svg);
    })

    // in any case of an error log it
    .catch(error => {
        console.log(error);
        phInstance.exit();
    });