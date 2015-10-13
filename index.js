var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xml = require('node-bandwidth').xml;
var tn = require('./config.json').phoneNumber;
var numCalls = 0;
var callStart;
var callEnd;

/// Start the XML response
var response = new xml.Response();
// Create the sentence
var speakSentence = new xml.SpeakSentence({sentence: "Thank you for calling Tom's Tire Shop, please wait while we connect you.", voice: "paul", gender: "male", locale: "en_US"});
//Push all the XML to the response
response.push(speakSentence);
// Create the xml to send
var bxml = response.toXml();

app.use(express.static('static'));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//Add from number
//three sets of each number
app.get('/incomingCall', function(req, res) {
	if(req.query && req.query.eventType && req.query.eventType === 'answer' &&
		req.query.to === tn){
			numCalls += 1;
			io.emit('numCalls', numCalls);
			callStart = new Date();
			io.emit('caller', req.query.from);
			res.send(bxml);
	}
	else if(req.query && req.query.eventType && req.query.eventType === 'hangup'){
		callEnd = new Date();
		var duration = (callEnd - callStart) / 1000;
		io.emit('duration', duration);
	}
	else {
		res.send({status: 200});
	}
});

io.on('connection', function(socket){
	socket.emit('connected', 'Connected!');
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});