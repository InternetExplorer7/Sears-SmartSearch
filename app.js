/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var fs = require('fs');
var request = require('request');
var bodyParser = require('body-parser')
var recognize = require('./recognize');
var wit = require('./wit');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
// create a new express server
var app = express();
var server = require('http').createServer(app)

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use("/uploads", express.static(__dirname + "/uploads"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())

app.post('/translate.json', function (req, res){
    wit(req.body.text, function (err, transcript) {
      console.log( "Transcript: " + transcript);
        res.send(transcript);
    });
});

app.post('/sears.json', function (req, res){
  console.log("Getting to sears");
  request({
    url: "http://api.developer.sears.com/v2.1/products/search/Sears/json/keyword/" + req.body.item + "?apikey=NOTAPIKEY",
    json:true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    }
  })
});

app.post('/speech.json', function (req, res) {
  recognize(req.body.item, function (err, audioloc) {
    console.log(audioloc);
    res.send(audioloc);
  });
});

// start server on the specified port and binding host
server.listen(appEnv.port, appEnv.bind, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
