var schedule = require('node-schedule');
var moment = require('moment');
var util = require('util');
var fs = require('fs');

var path = require('path');
var exec = require('child_process').exec

var backup_path = 'D:\\db_backup\\'
var dbname = 'admin'

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
	    fs.chmodSync(backup_path+filename, 777)
	});



	var files = fs.readdirSync(backup_path)

	files.forEach(function(name){
		try{
			var filetime = moment(name).unix()*1000
			var now = Date.now()-0
			if(now - filetime >1000*3600*24*7){ //删除7天前的记录
				console.log(name)
				fs.unlinkSync(backup_path+name);
			}
		}
		catch(e){
			console.log(e)
		}
	})

}


var rule = new schedule.RecurrenceRule();
	rule.dayOfWeek = [new schedule.Range(0, 6)];
	rule.hour = 17;
	rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
   commond()
});


commond()