var configDev = require('./Config.json');
var configRelease = require('./ConfigRelease.json');


if(process.execArgv.indexOf('--dev') !== -1 || process.execArgv.indexOf('-D') !== -1 || process.execArgv.indexOf('-d') !== -1){
	module.exports = configDev;
}
else{
	module.exports = configRelease;
}