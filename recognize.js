var watson = require('watson-developer-cloud');
var fs = require('fs');
var uuid = require('node-uuid');

var text_to_speech = watson.text_to_speech({
	username: 'MY_IBM_WATSON_KEY',
	password: 'HEH_LELZ',
	version: 'v1',
	url: 'https://stream.watsonplatform.net/text-to-speech/api'
});

module.exports = function(text, callback) {
	var params = {
	  text: text,
	  voice: 'en-US_MichaelVoice', // Optional voice 
	  accept: 'audio/wav'
	};
	var uid = uuid.v4();
	text_to_speech.synthesize(params).pipe(fs.createWriteStream('uploads/' + uid + ".wav"));
	callback(null, uid);

}