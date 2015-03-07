var appModel = require('../dl/appModel.js'); //加载模型
var utils = require('../lib/utils.js');
var obj = {}


obj.getByEname = function(ename,cb){ //根据ename查找此app应用的信息
	var cb = cb || function(){}
	if(!ename) return cb('no ename');
	appModel.findOneByObj({appEname:ename},cb);
}

obj.getById = function(id, cb){
	return appModel.findOneByObj({
		'_id':id.toString()
	},cb)
}

//返回所有app应用商到内存
obj.getAllApp = function(cb){
	var cb = cb || function(){}
	appModel.findAll({},0,1000,cb);
}

obj.getAppObjByEname = function(ename){

	var hasFound = false
	global.appGlobalList.forEach(function(appObj){
        if(appObj.appEname == ename){
            hasFound = appObj
        }
    })
    return hasFound;
}


module.exports = obj;