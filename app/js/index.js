'use strict';

var async = require('async');
var exec = require('child_process').exec;
var child;

var sleepEvents = [];
var wakeEvents = [];

function getSleepEvents(callback) {
	exec('pmset -g log | grep "Entering Sleep"',
	  function (error, stdout, stderr) {
	  	if (stderr) { console.log('stderr' + stderr); }
		  if (error !== null) { console.log('exec error: ' + error); }

		  sleepEvents = parsePMSETOutput(stdout);
		  callback();
	});
}

function getWakeEvents(callback) {
	child = exec('pmset -g log | grep "Wake from Standby"', 
		function(error, stdout, stderr) {
			if (stderr) { console.log('stderr' + stderr); }
		  if (error !== null) { console.log('exec error: ' + error); }

		  wakeEvents = parsePMSETOutput(stdout);
		  callback();
	});
}

async.parallel([getSleepEvents, getWakeEvents], function() {
	// get rid of last event, which is always invalid:
	sleepEvents.pop();
	wakeEvents.pop();
	
	var lastSlept = sleepEvents[sleepEvents.length];
	var lastWake = wakeEvents[wakeEvents.length];

	
});

function parsePMSETOutput(stdout) {
	var lineBuffer;
	var timestampBuffer;
	return stdout.split('\n').map(function(line) {
		lineBuffer = line.split('\t');		// TODO: figure out how expensive it is to keep delcaring var for each line
		timestampBuffer = line.split(' ');
		return {
			timestamp: new Date(timestampBuffer.slice(0, 3).join(' ')),
			description: lineBuffer[1],
			timeToSleep: lineBuffer[2]
		};
	});
}