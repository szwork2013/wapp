var suggestModel = require('../dl/suggestModel.js'); //加载小区模型
var guidModel = require('../dl/guidModel.js');
var utils = require('../lib/utils.js');
var obj = {}

obj.getSuggestByUerId = function(userId,appId,cb){ //获取小区
	suggestModel.findByObj({
		appId:appId,
		userId:userId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})

}

obj.sendSuggest = function(qobj,cb){ //发送意见建议或者服务请求

	suggestModel.insertOneByObj({
		appId:qobj.appId,
		userId:qobj.userId,
		suggestGuid:qobj.suggestGuid,
		suggestContent:qobj.suggestContent,
		suggestType:qobj.suggestType,
	},function(err,doc){
		return cb(err,doc)
	})


}



module.exports = obj;