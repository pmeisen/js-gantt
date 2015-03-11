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
  var chartFixedData = $("#chartFixedData").ganttChart({
      data: {
        names: ['start', 'end', 'value', 'number'],
        records: [
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 2, 0, 0), '2 Hours', 120 ],
          [ datelib.createUTC(null, null, null, 0, 0, 0), datelib.createUTC(null, null, null, 23, 59, 0), 'All Day', 1439 ]
        ],
        timeaxis: {
          end: datelib.modifyUTC(datelib.createUTC(null, null, null, 23, 59, 0), 1, 'd'),
          granularity: 'mi'
        }
      }
    });
  chartFixedData.resize(1500, 300);

  var chartLoadedData = $("#chartLoadedData").ganttChart({
      data: {
        url: 'http://localhost:10000/data?type=file&file=server/sample.csv&separator=;&limit=10000',
        postProcessor: function(data) {
          return { names: data.names, records: data.data };
        },
        mapper: {
          startname: 'start',
          endname: 'end',
          group: ['callergender', 'recipientgender'],
          label: ['callergender', 'start', 'caller'],
          tooltip: ['caller', 'recipient']
        },
        timeaxis: {
          start: new Date(Date.UTC(2015, 0, 1)),
          end: new Date(Date.UTC(2015, 11, 1, 23, 59, 00))
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