//游戏model
var gameModel = require('../dl/appGameModel.js');
 //新闻模型
var newsModel = require('../dl/appNewsModel.js');
//专刊模型
var specialModel = require('../dl/appSpecialModel.js');
//预约模型
var bookModel = require('../dl/appBookModel.js'); 

var utils = require('../lib/utils.js');
var obj = {}

obj.getGameList = function(appId,cb){ //获取游戏列表
	gameModel.findByObj({
		appId:appId,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc || doc.length == 0){
			return cb(null, doc);
		}
		return cb(err,doc)
	})
}

obj.getOneGameById = function(id,cb){ //获取指定游戏内容
	gameModel.findOneByObj({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);		
		return cb(err,doc)
	})
}


obj.getSpecialByTypePage = function(appId,type,page,size,cb){ //某一类型专刊的列表，分页支持
	var size = size || 10;
	var skip = (page-1) * size
	specialModel.findAll({
		appId:appId,
		type:type,
		isShow:1
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);
		var tempary = []
		doc.forEach(function(v) {
			if(v.)
		})

		return cb(err,doc)
	})
}


obj.getSpecialById = function(id,cb){ //某一类型专刊的详细内容
	var size = 10;
	var skip = (page-1) * size
	specialModel.findOneByObj({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);		
		return cb(err,doc)
	})
}


obj.getNewsByTypePage = function(appId,type,page,size,cb){ //某一类型公告的列表，分页支持
	var size = size || 10;
	var skip = (page-1) * size
	newsModel.findAll({
		appId:appId,
		type:type,
		isShow:1
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);		
		return cb(err,doc)
	})
}


obj.getNewsById = function(id,cb){ //某一类型公告的详细内容
	var size = 10;
	var skip = (page-1) * size
	newsModel.findOneByObj({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);		
		return cb(err,doc)
	})
}




obj.getBookList = function(appId,cb){ //获取预约列表
	bookModel.findByObj({
		appId:appId,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc || doc.length == 0){
			return cb(null, doc);
		}
		return cb(err,doc)
	})
}







module.exports = obj;