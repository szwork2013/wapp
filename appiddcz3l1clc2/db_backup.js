var schedule = require('node-schedule');
var moment = require('moment');
var util = require('util');
var fs = require('fs');

var path = require('path');
var exec = require('child_process').exec

var backup_path = 'D:\\db_backup\\'
var dbname = 'wapp'

if(!fs.existsSync(backup_path)){
	fs.mkdirSync(backup_path);
}


var commond = function(){
	var filename = moment().format('YYYY-MM-DD');

	child = exec(util.format('mongodump -h 127.0.0.1  -d %s -o %s', dbname, backup_path+filename),
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	    var r = fs.chmodSync(backup_path+filename, 777)
	    console.log('backup success at '+moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
	});
}


var rule = new schedule.RecurrenceRule();
	rule.dayOfWeek = [1];
	rule.hour = 1;
	rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
   commond()
});
commond()