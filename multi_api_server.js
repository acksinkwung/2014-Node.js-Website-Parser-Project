var cheerio = require("cheerio");
var express = require("express");
var mysql = require('mysql');
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

function MySQLOperation(data, callback) {
	
	var connection = mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: '',
	});
	connection.query('DROP DATABASE IF EXISTS  nodejs;');
	connection.query('CREATE DATABASE nodejs charset=utf8;');
	connection.query('USE nodejs;');
	connection.query('DROP TABLE IF EXISTS job;');
	connection.query('CREATE TABLE job (name VARCHAR(100),company VARCHAR(100),location VARCHAR(100),type VARCHAR(10));');
	connection.query('ALTER DATABASE nodejs character set utf8 collate utf8_general_ci;');
	connection.query('ALTER TABLE job charset=utf8;');
	
	var objects = JSON.parse(data);
	for (var i in objects) {
		var values = "'" + objects[i].name + "','" + objects[i].company + "','" + objects[i].location + "','" + objects[i].type + "'";
		connection.query("INSERT INTO job (name,company,location,type) VALUES (" + values + ");");
	}

	connection.query('SELECT * FROM job;', function(err, results, fields) {
	    if(err) {
	    	throw err;
	 	}
	 	var objects = JSON.stringify(results);
	 	connection.end();   
	 	callback(objects);
	});

}

var url = "http://jobs.inside.com.tw/jobs/page/"
app.get("/:n", function(request, response) {
	OpenDataInput(url + parseInt(request.params.n), function(data) {
		if (data) {
			OpenDataProcess(data, function(data) {
				MySQLOperation(data, function(data) {
					OpenDataOutput(response, data);
				});
			});
	 	}  
	});
});
http.createServer(app).listen(1337);