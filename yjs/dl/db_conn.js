var mongoose = require('mongoose');
var connstr = require('../config/config.js').mongodbConnStr;
var poolsize = require('../config/config.js').monoosePool;


mongoose.connect(connstr,{server:{poolSize:poolsize}});


module.exports = mongoose;
