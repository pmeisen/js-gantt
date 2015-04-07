// define the baseUrl
requirejs.config({

  // define the baseUrl defined by the processenabler
  baseUrl: 'scripts',
  
  // shim date.js it's not AMD conform
  shim: {
    'date': {
      exports: 'Date'
    }
  }
});

// now start the entry-point
require(['jquery', 'net/meisen/general/date/DateLibrary', 'net/meisen/ui/gantt/GanttChart'], function($, datelib) {
  var chartFixedData1 = $("#chartFixedData1").ganttChart({
      data: {
        names: ['start', 'end', 'value', 'number'],
        records: [
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 2, 0, 0), '2 Hours', 120 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 4, 0, 0), '4 Hours', 240 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 6, 0, 0), '6 Hours', 360 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 8, 0, 0), '8 Hours', 480 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 10, 0, 0), '10 Hours', 600 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 12, 0, 0), '12 Hours', 720 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 23, 59, 0), 'All Day', 1439 ]
        ],
        mapper: {
          startname: 'start',
          endname: 'end',
          tooltip: ['number', 'start']
        },
        timeaxis: {
          end: datelib.modifyUTC(datelib.createUTC(null, null, null, 23, 59, 0), 1, 'd'),
          granularity: 'mi'
        }
      },
      illustrator: {
        config: {
          axis: {
            tickInterval: 120
          },
          view: {
            showGrid: false,
            showPositionMarker: false,
            theme: {
              intervalColor: '#f7a35c',
              intervalHeight: 40,
              intervalBorderSize: 1
            }
          }
        }
      }
    });
  chartFixedData1.resize(1200, 300);
  
  var chartFixedData2 = $("#chartFixedData2").ganttChart({
      data: {
        names: ['start', 'end', 'value', 'number'],
        records: [
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 2, 0, 0), '2 Hours', 120 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 4, 0, 0), '4 Hours', 240 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 6, 0, 0), '6 Hours', 360 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 8, 0, 0), '8 Hours', 480 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 10, 0, 0), '10 Hours', 600 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 12, 0, 0), '12 Hours', 720 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 23, 59, 0), 'All Day', 1439 ]
        ],
        mapper: {
          startname: 'start',
          endname: 'end',
          tooltip: ['number', 'start', 'end']
        },
        timeaxis: {
          end: datelib.modifyUTC(datelib.createUTC(null, null, null, 23, 59, 0), 1, 'd'),
          granularity: 'mi'
        }
      },
      illustrator: {
        config: {
          axis: {
            tickInterval: 120
          },
          view: {
            showGrid: false,
            showPositionMarker: false,
            tooltip: function(interval, map) {
              return 'Some marks: ?ßgGÁ\nSome marks: ?ßgGÁ\n{1|number|#.00}\n{2|date|HH:mm:ss} - {3|date|HH:mm:ss}\n' + interval.get('_raw')[2];
            },
            theme: {
              intervalColor: '#f7a35c',
              intervalHeight: 40,
              intervalBorderSize: 1
            }
          }
        }
      }
    });
  chartFixedData2.resize(1200, 300);
  
  var chartFixedData3 = $("#chartFixedData3").ganttChart({
      data: {
        names: ['start', 'end', 'value', 'number'],
        records: [
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 2, 0, 0), '2 Hours', 120 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 4, 0, 0), '4 Hours', 240 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 6, 0, 0), '6 Hours', 360 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 8, 0, 0), '8 Hours', 480 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 10, 0, 0), '10 Hours', 600 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 12, 0, 0), '12 Hours', 720 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 23, 59, 0), 'All Day', 1439 ]
        ],
        mapper: {
          startname: 'start',
          endname: 'end',
          tooltip: ['number', 'start', 'end']
        },
        timeaxis: {
          end: datelib.modifyUTC(datelib.createUTC(null, null, null, 23, 59, 0), 1, 'd'),
          granularity: 'mi'
        }
      },
      illustrator: {
        config: {
          axis: {
            tickInterval: 120
          },
          view: {
            showGrid: false,
            showPositionMarker: false,
            tooltip: '<span style="color: \'#FF00FF\'">{1}</span>\n<span style="fill: #FF0000">Start:</span> {2|date|HH:mm:ss}, <span style="fill: #FF0000">End:</span> {3|date|HH:mm:ss}',
            theme: {
              intervalColor: '#f7a35c',
              intervalHeight: 40,
              intervalBorderSize: 1,
              tooltipSize: 25
            }
          }
        }
      }
    });
  chartFixedData3.resize(1200, 300);

  var chartLoadedData = $("#chartLoadedData").ganttChart({
      data: {
        url: 'http://localhost:10000/data?type=file&file=server/sample.csv&separator=;&limit=10000',
        postProcessor: function(data) {
          for (var i = 0; i < data.data.length; i++) {
            var record = data.data[i];
            record[1] = datelib.parseISO8601(record[1]);
            record[2] = datelib.parseISO8601(record[2]);
          }
          
          return { names: data.names, records: data.data };
        },
        mapper: {
          startname: 'start',
          endname: 'end',
          group: ['callergender', 'recipientgender'],
          label: ['callergender', 'start', 'caller'],
          tooltip: ['caller', 'recipient', 'start', 'end']
        },
        timeaxis: {
          start: datelib.createUTC(2013, 9, 1),
          end: datelib.createUTC(2014, 12, 31, 23, 59, 00),
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
            tooltip: '{1} called {2}\non the {3|date|dd.MM.yyyy} ({3|date|HH:mm} - {4|date|HH:mm})',
            coloring: {
              groupMapping: {
                '["Female","Female"]': '#7cb5ec',
                '["Male","Female"]': '#434348',
                '["Female","Male"]': '#f7a35c',
                '["Male","Male"]': '#90ed7d'
              }
            },
            theme: {
              backgroundColor: '#EEEEEE',
              intervalColor: '#444444',
              intervalHeight: 10,
              intervalBorderSize: 0
            }
          }
        }
      }
    });
  chartLoadedData.resize(800, 300);
  
  var chartFailData = $("#chartFailData").ganttChart({
      data: {
        url: 'http://localhost:10000/data?type=fail',
      }
    });
  chartFailData.resize(800, 300);
  
  var chartEmptyData = $("#chartEmptyData").ganttChart({
      data: {
        url: 'http://localhost:10000/data?type=file&file=server/sample.csv&separator=;&limit=0',
        postProcessor: function(data) {
          return { names: data.names, records: data.data };
        }
      }
    });
  chartEmptyData.resize(800, 300);
  
  
  /*
  $('<div style="padding: 0.4em; margin: 1em; border: solid 1px #000;">set granularity to days</div>').prependTo(document.body).click(function() {
    chart.changeGranularity('days');
  });
  $('<div style="padding: 0.4em; margin: 1em; border: solid 1px #000;">set granularity to hours</div>').prependTo(document.body).click(function() {
    chart.changeGranularity('hours');
  });
  $('<div style="padding: 0.4em; margin: 1em; border: solid 1px #000;">set granularity to minutes</div>').prependTo(document.body).click(function() {
    chart.changeGranularity('minutes');
  });
  */
});