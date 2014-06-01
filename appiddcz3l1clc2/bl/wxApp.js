var appModel = require('../dl/appModel.js'); //加载模型
var utils = require('../lib/utils.js');
var obj = {}


obj.getByEname = function(ename,cb){ //根据ename查找此app应用的信息
	var cb = cb || function(){}
	if(!ename) return cb('no ename');
	appModel.findOneByObj({appEname:ename},cb);
}


module.exports = obj;