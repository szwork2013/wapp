var coModel = require('../dl/communityModel.js'); //加载小区模型
var serviceModel = require('../dl/appServiceModel.js'); //加载物业服务关系模型
var nearModel = require('../dl/appNearModel.js'); //加载周边配套模型
var newsModel = require('../dl/appNewsModel.js'); //新闻模型
var reCommendModel = require('../dl/reCommendModel.js'); //推荐信息模型
var recRecordModel = require('../dl/recRecordModel.js'); //推荐信息模型


var utils = require('../lib/utils.js');
var obj = {}

obj.getCo = function(appId,cb){ //获取小区
	coModel.findByObj({
		appId:appId
	},function(err,doc){
		if(err) return cb(err);
		if(!doc || doc.length == 0){
			return cb(null, doc);
		}
		var tempArray = []
		doc.forEach(function(coObj){
			  tempArray.push({
			  _id:coObj._id,
			  appId:coObj.appId,
		      coName:coObj.coName,    			  //小区名称
		      coCity:coObj.coCity,                 //小区所在城市
		      coLoc:coObj.coLoc,   //小区所在经纬度
		      coAddr:coObj.coAddr,                     //小区所在地理位置
		      coDesc:coObj.coDesc,          			  //小区描述
		      coPictrue:coObj.coPictrue.split(','),        //小区介绍图片地址
		      coLogo:coObj.coLogo,           //小区Logo
		      coUrl:coObj.coUrl,              //楼盘的官网地址
		      coTelphone:coObj.coTelphone,                  //楼盘售楼电话
		      isShow:coObj.isShow,                        //1表示启用，0表示不启用
			  writeTime:coObj.writeTime,    //写入时间
			})
		})
		return cb(err,tempArray)
	})

}

obj.getOneCoById = function(coId,cb){ //获取指定小区
	coModel.findOneByObj({
		_id:coId
	},function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);
		var coObj = doc;
		
		return cb(err,{
			  _id:coObj._id,
			  appId:coObj.appId,
		      coName:coObj.coName,    			  //小区名称
		      coCity:coObj.coCity,                 //小区所在城市
		      coLoc:coObj.coLoc,   //小区所在经纬度
		      coAddr:coObj.coAddr,                     //小区所在地理位置
		      coDesc:coObj.coDesc,          			  //小区描述
		      coPictrue:coObj.coPictrue.split(','),        //小区介绍图片地址
		      coLogo:coObj.coLogo,           //小区Logo
		      coUrl:coObj.coUrl,              //楼盘的官网地址
		      coTelphone:coObj.coTelphone,                  //楼盘售楼电话
		      isShow:coObj.isShow,                        //1表示启用，0表示不启用
			  writeTime:coObj.writeTime,    //写入时间
			})
	})

}

obj.getCoService = function(coId,cb){ //获取小区的物业服务
	serviceModel.findByObj({
		coId:coId
	},function(err,doc){
		return cb(err,doc)
	})
}

obj.getCoNear = function(coId,cb){ //获取小区的周边配套
	nearModel.findByObj({
		coId:coId
	},function(err,doc){
		return cb(err,doc)
	})
}

obj.getAppNews = function(appId,page,cb){ //获取此应用的新闻
	var pagesize = 100;
	var page = page - 1;
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

obj.getNewsDetail = function(newsId,cb){ //获取新闻详细内容

	newsModel.findOneByObj({
		_id:newsId
	},function(err,doc){
		return cb(err,doc)
	})
}



obj.getCoNews = function(coId,page,cb){//获取某小区的新闻
	var pagesize = 100;
	var page = page - 1;
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
	var pagesize = 100;
	var page = page - 1;
	var skip = (page || 0)*pagesize;

	var qobj = {
		appNewsType:2,
		isShow:1,
	}
	if(coId){
		qobj.coId = coId;
	}

	newsModel.findAll(qobj,skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}


obj.getCoProm = function(coId,page,cb){ //获取某小区的优惠信息
	var pagesize = 100;
	var page = page - 1;
	var skip = (page || 0)*pagesize

	var qobj = {
		appNewsType:3,
		isShow:1,
	}
	if(coId){
		qobj.coId = coId;
	}

	newsModel.findAll(qobj,skip,pagesize,function(err,doc){
		return cb(err,doc)
	})
}

obj.sendReCommend = function(qobj,cb){ //发送推荐信息

	recRecordModel.insertOneByObj({
		appId:qobj.appId,
		coId:qobj.coId,
		userId:qobj.userId,
		openId:qobj.openId,
		recName:qobj.recName,
		recSex:qobj.recSex,
		recTel:qobj.recTel,
	},function(err,doc){
		return cb(err,doc);
	})
}




module.exports = obj;