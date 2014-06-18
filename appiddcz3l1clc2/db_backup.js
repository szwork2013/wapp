var schedule = require('node-schedule');
var moment = require('moment')
var fs = require('fs');
var file = require('file');
var path = require('path');
var exec = require('child_process').exec

var backup_path = 'd:\\wapp\\db_backup\\'
var dbname = 'wapp'

if(!fs.existsSync(backup_path)){
	file.mkdirsSync(backup_path);
}


var commond = function(){
	var filename = moment().format('YYYY/MM/DD');

	child = exec(sprintf('mongodump -h 127.0.0.1  -d %s -o %s', dbname, backup_path+filename),
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	});



	var files = fs.readdirSync(backup_path)
	files.forEach(function(name){
		try{
			var filetime = moment(name).millisecond() 
			var now = Date.now()
			if(now - filetime >1000*3600*24*7){ //删除7天前的记录
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