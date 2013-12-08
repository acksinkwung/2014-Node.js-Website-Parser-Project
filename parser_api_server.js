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
	var objects = [];
	$ = cheerio.load(data);
	$('li.job').each(function(i, elem) {
		
		var items = $(this).text().split("\n");
		
		var object = new Object();
		
  		object.name = items[3];
  		object.company = items[4];
  		object.location = items[5];
  		object.type = items[8];

		objects.push(object);
	});
	callback(JSON.stringify(objects));
}
 
function OpenDataOutput(response, data) {
	response.setHeader('Content-Length', Buffer.byteLength(data));
	response.setHeader('Content-Type', 'text/plain; charset="utf-8"');
	response.write(data);
	response.end();
}
var url = "http://jobs.inside.com.tw/"
app.get("/", function(request, response) {
	OpenDataInput(url, function(data) {
		if (data) {
			OpenDataProcess(data, function(data) {
				OpenDataOutput(response, data);
			});
	 	}  
	});
});
http.createServer(app).listen(1337);
