//新闻模型
var newsModel = require('../dl/appNewsModel.js');
var moment = require('moment');
var utils = require('../lib/utils.js');
var obj = {}

obj.getNewsByTypePage = function(appId,type,page,size,cb){ //某一类型公告的列表，分页支持
	var size = size || 10;
	var skip = (page-1) * size
	newsModel.findAll({
		appId:appId,
		//type:type,
		isShow:1
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);

		var tempary = []

		doc.forEach(function(obj){
			tempary.push({
				_id:obj._id,
				title:obj.title,
				//content:obj.content,
				picture:obj.picture.split(',') || '',
				url:obj.url,
				type:obj.type,
				code1:obj.code1,
				code2:obj.code2,
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
		})

		return cb(err,tempary)
	})
}


obj.getNewsById = function(id,uid,cb){ //某一类型公告的详细内容

	newsModel.find({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(doc.length == 0) return cb(null, doc);

		var tempary = []

		doc.forEach(function(obj){
			var tempurl = obj.url;

			tempary.push({
				_id:obj._id,
				title:obj.title,
				content:obj.content,
				picture:obj.picture.split(','),
				url:tempurl,
				type:obj.type,
				code1:obj.code1,
				code2:obj.code2,
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
		})
		return cb(err,tempary[0])
	})
}



module.exports = obj;