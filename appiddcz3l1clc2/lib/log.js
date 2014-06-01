var log4js = require('log4js');
var path = require('path');
var config = require('../config/config.js');
var utils = require('./utils.js');
var fs = require('fs');

var logPath = path.join(__dirname,'..','logs');
if(!fs.existsSync(logPath)){
	fs.mkdirSync(logPath);
	console.log('success create log folder: %s',logPath)
}


log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: path.join(__dirname,'..','logs/log_'+process.pid), maxLogSize:1024*50, "backups": 10,category: 'cheese' }
	  ]
});
var logger = log4js.getLogger('cheese');
logger.info("init log4js at "+(new Date()));

global.logger = logger;
module.exports = logger;
