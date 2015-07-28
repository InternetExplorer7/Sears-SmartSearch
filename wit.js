 var wit = require('node-wit');
  var fs = require('fs');
  var ACCESS_TOKEN = "MYTOKEN";

  module.exports = function(file, callback){
  wit.captureTextIntent(ACCESS_TOKEN, file, function (err, res) {
    callback(null, res);
    if (err) console.log("Error: ", err);
      console.log(JSON.stringify(res, null, " "));
    });
}