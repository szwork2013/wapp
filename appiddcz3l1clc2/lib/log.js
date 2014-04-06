var log4js = require('log4js');
var path = require('path');
var config = require('../config/config.js');
var utils = require('./utils.js');

log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: path.join(__dirname,'..','logs/log_'+process.pid), maxLogSize:1024*50, "backups": 10,category: 'cheese' }
	  ]
});
var logger = log4js.getLogger('cheese');
logger.info("init log4js at "+(new Date()));

module.exports = logger;
