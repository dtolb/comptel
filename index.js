var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var xml = require('node-bandwidth').xml;
var tns = require('./config.json');
var cdr = {
	tn1: {
		numCalls: 0
	},
	tn2: {
		numCalls: 0
	},
	tn3: {
		numCalls: 0
	}
};

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

//three sets of each number
app.get('/incomingCall', function(req, res) {
	if(req.query && req.query.eventType && req.query.eventType === 'answer') {
		res.send(bxml);
		if(req.query.to === tns.tn1) {
			cdr.tn1.numCalls += 1;
			io.emit('numCalls1', cdr.tn1.numCalls);
			cdr.tn1.callStart = new Date();
			io.emit('caller1', req.query.from);
		}
		if(req.query.to === tns.tn2) {
			cdr.tn2.numCalls += 1;
			io.emit('numCalls2', cdr.tn2.numCalls);
			cdr.tn2.callStart = new Date();
			io.emit('caller2', req.query.from);
		}
		if(req.query.to === tns.tn3) {
			cdr.tn3.numCalls += 1;
			io.emit('numCalls3', cdr.tn3.numCalls);
			cdr.tn3.callStart = new Date();
			io.emit('caller3', req.query.from);
		}
	}
	else if(req.query && req.query.eventType && req.query.eventType === 'hangup'){
		if(req.query.to === tns.tn1) {
			cdr.tn1.callEnd = new Date();
			cdr.tn1.duration = (cdr.tn1.callEnd - cdr.tn1.callStart) / 1000;
			io.emit('duration1', cdr.tn1.duration);

		}
		else if(req.query.to === tns.tn2) {
			cdr.tn2.callEnd = new Date();
			cdr.tn2.duration = (cdr.tn2.callEnd - cdr.tn2.callStart) / 1000;
			io.emit('duration2', cdr.tn2.duration);
		}
		else if(req.query.to === tns.tn3) {
			cdr.tn3.callEnd = new Date();
			cdr.tn3.duration = (cdr.tn3.callEnd - cdr.tn3.callStart) / 1000;
			io.emit('duration3', cdr.tn3.duration);
		}
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