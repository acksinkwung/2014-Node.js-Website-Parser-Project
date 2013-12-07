var cheerio = require("cheerio");
var express = require("express");
var http = require("http");
var app = express();
 
function OpenDataInput(url, callback) {
	http.get(url, function(res) {
    	var data = "";
    	res.on('data', function (chunk) {
      		data += chunk;
    	});
    	res.on("end", function() {
      		callback(data);
    	});
  	}).on("error", function() {
    	callback(null);
  	});
}

function OpenDataProcess(data, callback) {
	var ws_objects = [];
	objects = JSON.parse(data);
	for (var object in objects) {
	    var ws_object = {};
	    ws_object.District = objects[object].District;
	    ws_object.Name = objects[object].Name;
	    ws_object.Measure_of_Area = objects[object].Measure_of_Area;
	    ws_object.Description = objects[object].Description;	
	    ws_objects.push(ws_object);
	}
	callback(JSON.stringify(ws_objects));
}

function OpenDataOutput(data) {
	app.get("/", function(request, response) {
	    response.setHeader('Content-Length', Buffer.byteLength(data));
		response.setHeader('Content-Type', 'text/plain; charset="utf-8"');
	    response.write(data);
	    response.end();
	});
	http.createServer(app).listen(1337);
}

var url = "http://data.taipei.gov.tw/opendata/apply/json/QTdBMkZEODgtOUI4NS00RUM2LUE4QTAtMkY1Rjc5QjdFODJB"

OpenDataInput(url, function(data) {
	if (data) {
		OpenDataProcess(data, function(data) {
			OpenDataOutput(data);
		});
 	}  
});