/*
 * Following status can be used (full list see org.apache.http.HttpStatus):
 *  - org.apache.http.HttpStatus.SC_UNAUTHORIZED
 *  - org.apache.http.HttpStatus.SC_OK
 *  - org.apache.http.HttpStatus.SC_METHOD_NOT_ALLOWED
 */
var status = Packages.org.apache.http.HttpStatus.SC_OK;

var pad = function(n){
  return n < 10 ? '0' + n : n
};

var readFile = function(file, encoding, separator, limit) {
  var records = [];
  var names = [];
  
  var reader = null;
  try {
    reader = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding))
    var line = null;
    var first = true;
    do {
      do {
        line = reader.readLine();
      } while (line != null && line.trim().isEmpty());
      
      // stop if we got enough or if no more lines are available
      if (line == null || (!first && limit <= records.length)) {
        break;
      }
      
      // parse the line
      var data = line.split(separator);
      var record = [];
      for (var i = 0; i < data.length; i++) {
        var value;
        
        var date = Packages.net.meisen.general.genmisc.types.Dates.isDate(data[i], Packages.net.meisen.general.genmisc.types.Dates.GENERAL_TIMEZONE);
        if (date != null) {
          value = date;
        } else {
          value = '' + data[i];
          
          if(value.match(/^\d+$/)){
            value = parseInt(value);
          } else if (value.match(/^\d+\.\d+$/)) {
            value = parseFloat(value);
          }
        }
        record.push(value);
      }
      
      if (first) {
        names = record;
        first = false;
      } else {
        records.push(record);
      }
    } while (line != null);
  } catch (e) {
    names = [];
    records = [];
  } finally {
    if (reader != null) {
      reader.close();
    }
  }
  
  return { names: names, data: records };
};

var transformToJson = function(object) {
  var json;
  
  if (object == null) {
    json = 'null';
  } else if (typeof object === 'boolean') {
    json = '' + object;
  } else if (typeof object === 'number') {
    json = '' + object;
  } else if (typeof object === 'string') {
    json = '"' + object + '"';
  } else if (typeof object === 'object' && (object instanceof Date)) {
    json = '"' + object.getUTCFullYear() + '-' + 
                 pad(object.getUTCMonth() + 1) + '-' + 
                 pad(object.getUTCDate())+'T' + 
                 pad(object.getUTCHours()) + ':' + 
                 pad(object.getUTCMinutes()) + ':' + 
                 pad(object.getUTCSeconds()) + 'Z' + '"';
  } else if (object instanceof java.util.Date) {
    json = transformToJson(new Date(object.getTime()));
  } else if (typeof object === 'object' && (object instanceof Array)) {
    var separator = '';
  
    json = '[';
    for(var key in object) {
      json += separator + transformToJson(object[key]);
      separator = ',';
    }
    json += ']';
  } else if (typeof object === 'object') {
    var separator = '';
  
    json = '{';
    for(var key in object) {
      json += separator + '"' + key + '":';
      json += transformToJson(object[key]);
      separator = ',';
    }
    json += '}';
  } else {
    json = object;
  }
  
  return json;
};

var parameters = Packages.net.meisen.general.server.http.listener.util.RequestHandlingUtilities.parseParameter(request);

// determine the data to be send
var type = parameters.get('type');

var result;
if ('file'.equals(type)) {
  var file = parameters.get('file');
  var encoding = parameters.get('encoding');
  var separator = parameters.get('separator');
  var limit = parameters.get('limit');
  encoding = encoding == null ? 'UTF8' : encoding;
  separator = separator == null ? ',' : separator;
  limit = limit == null ? 100 : limit;

  result = readFile(file, encoding, separator, limit);
} else if ('fail'.equals(type)) {
  status = Packages.org.apache.http.HttpStatus.SC_UNAUTHORIZED;
} else {
  var names = ['Start', 'End', 'Integer', 'String'];
  var data = [];
  
  data.push([ new Date(Date.UTC(1981, 0, 20, 8, 0, 0)), new Date(Date.UTC(1981,0, 20, 8, 7, 0)),  500, 'Test' ]);
  
  result = { names: names, data: data };
}

// create the answer
var entity = new Packages.org.apache.http.entity.StringEntity(transformToJson(result), Packages.org.apache.http.entity.ContentType.create("text/html", "UTF-8"));
entity.setContentEncoding('UTF-8');
response.setEntity(entity);

// set the status
response.setStatusCode(status);