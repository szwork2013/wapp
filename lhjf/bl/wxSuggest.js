var suggestModel = require('../dl/suggestModel.js'); //加载小区模型
var guidModel = require('../dl/guidModel.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.getSuggestBySuggestId = function(userId,suggestId,cb){ //查询流水号的服务请求
	suggestModel.findOneByObj({
		_id:suggestId,
		userId:userId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})

}

obj.getSuggestByUerId = function(userId,appId,cb){ //获取用户提的服务请求，意见建议，留言信息
	suggestModel.findByObj({
		appId:appId,
		userId:userId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})

}


obj.getSuggestByUerId = function(userId,appId,cb){ //获取用户提的服务请求，意见建议，留言信息
	suggestModel.findByObj({
		appId:appId,
		userId:userId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})

}

obj.sendSuggest = function(qobj,cb){ //发送意见建议或者服务请求或留言内容

	suggestModel.insertOneByObj({
		appId:qobj.appId,
		userId:qobj.userId,
		openId:qobj.openId,
		suggestGuid:qobj.suggestGuid,
		suggestContent:qobj.suggestContent,
		suggestType:qobj.suggestType,
		suggestCode1:qobj.suggestCode1,
		suggestCode2:qobj.suggestCode2,
		suggestCode3:qobj.suggestCode3,
		suggestCode4:qobj.suggestCode4,
	},function(err,doc){
		return cb(err,doc)
	})


}



module.exports = obj;