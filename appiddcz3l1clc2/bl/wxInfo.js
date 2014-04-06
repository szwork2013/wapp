var coModel = require('../dl/communityModel.js'); //加载小区模型
var serviceModel = require('../dl/appServiceModel.js'); //加载物业服务关系模型
var nearModel = require('../dl/appNearModel.js'); //加载周边配套模型
var newsModel = require('../dl/appNewsModel.js'); //新闻模型
var reCommendModel = require('../dl/reCommendModel.js'); //推荐信息模型
var recRecordModel = require('../dl/recRecordModel.js'); //推荐信息模型
var MessageModel = require('../dl/appMessageModel.js'); //推荐信息模型

var utils = require('../lib/utils.js');
var obj = {}

obj.getCo = function(appId,cb){ //获取小区
	coModel.findByObj({
		appId:appId
	},function(err,doc){
		return cb(err,cb)
	})

}

obj.getCoService = function(coId,cb){ //获取小区的物业服务
	serviceModel.findByObj({
		coId:coId
	},function(err,doc){
		return cb(err,cb)
	})
}

obj.getCoNear = function(coId,cb){ //获取小区的周边配套
	nearModel.findByObj({
		coId:coId
	},function(err,doc){
		return cb(err,cb)
	})
}

obj.getAppNews = function(appId,page,cb){ //获取此应用的新闻
	var pagesize = 20;
	var skip = (page || 0)*pagesize
	newsModel.findAll({
		appId:appId,
		coId:0,
		appNewsType:1,
		isShow:1,
	},skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}

obj.getCoNews = function(coId,page,cb){//获取某小区的新闻
	var pagesize = 20;
	var skip = (page || 0)*pagesize
	newsModel.findAll({
		coId:coId,
		appNewsType:1,
		isShow:1,
	},skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}

obj.getCoAct = function(coId,page,cb){ //获取某小区的活动
	var pagesize = 20;
	var skip = (page || 0)*pagesize
	newsModel.findAll({
		coId:coId,
		appNewsType:2,
		isShow:1,
	},skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}


obj.getCoProm = function(coId,page,cb){ //获取某小区的优惠信息
	var pagesize = 20;
	var skip = (page || 0)*pagesize
	newsModel.findAll({
		coId:coId,
		appNewsType:3,
		isShow:1,
	},skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}

obj.getReCommend = function(coId,cb){ //获得此楼盘的推荐信息
	reCommendModel.findByObj({
		coId:coId
	},function(err,cb){
		cb(err,cb);
	})
}

obj.sendReCommend = function(qobj,cb){ //发送推荐信息
	recRecordModel.insertOneByObj({
		appId:qobj.appId,
		coId:qobj.coId,
		userId:qobj.userId,
		recName:qobj.recName,
		recSex:qobj.recSex,
		recTel:qobj.recTel,
	},function(err,cb){
		return cb(err,cb);
	})
}


obj.sendMessage = function(qobj,cb){ //发送留言信息
	MessageModel.insertOneByObj({
		appId:qobj.appId,
		userId:qobj.userId,
		userId:qobj.userId,
		recName:qobj.recName,
		recSex:qobj.recSex,
		recTel:qobj.recTel,
	},function(err,cb){
		return cb(err,cb);
	})
}


module.exports = obj;