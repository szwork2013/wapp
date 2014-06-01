var configDev = require('./Config.json');
var configRelease = require('./ConfigRelease.json');


if(process.execArgv.indexOf('--dev') !== -1 || process.execArgv.indexOf('-D') !== -1 || process.execArgv.indexOf('-d') !== -1){
	module.exports = configDev;
	global.config = configDev;
}
else{
	module.exports = configRelease;
	global.config = configRelease;
}