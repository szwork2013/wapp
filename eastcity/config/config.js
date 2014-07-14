var configDev = require('./Config.json');
var configRelease = require('./ConfigRelease.json');

//console.log(process.execArgv)
if(process.execArgv.indexOf('--dev') !== -1 || process.execArgv.indexOf('-D') !== -1 || process.execArgv.indexOf('-d') !== -1){
	console.log('server run in dev env')
	module.exports = configDev;
	global.config = configDev;
}
else{
	module.exports = configRelease;
	global.config = configRelease;
}