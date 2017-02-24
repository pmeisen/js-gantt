// define the baseUrl
requirejs.config({
    baseUrl: 'scripts',

    // see http://requirejs.org/docs/jquery.html
    map: {
        '*': { 'jquery': 'jquery-private' },
        'jquery-private': { 'jquery': 'jquery' }
    }
});

// make sure the different instances are loaded
require(['net/meisen/ui/gantt/GanttChart', 'jquery-private'
], function(GanttChart) {});

// actually retrieve the loaded instances
var instance = {
    GanttChart: require('net/meisen/ui/gantt/GanttChart')
};

// we are using the system within a browser
if (typeof window !== 'undefined') {
    for (var property in instance) {

        if (instance.hasOwnProperty(property)) {
            window[property] = instance[property];
        }
    }
}