//新闻模型
var newsModel = require('../dl/appNewsModel.js');
var communityModel = require('../dl/communityModel.js');
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
		obj.getAllCommunity(function(err, comList){

				if(err) return cb(err)

				doc.forEach(function(obj){
					comList.forEach(function(comObj){

						if(comObj._id.toString() == obj.code2){
							tempary.push({
								_id:obj._id,
								title:obj.title,
								//content:obj.content,
								picture:obj.picture.split(',') || '',
								url:obj.url,
								type:obj.type,
								code1:obj.code1,
								code2:obj.code2,
								code3:obj.code3,
								sort:obj.sort,
								writeTime:moment(obj.writeTime).format('YYYY-MM-DD')
							})
						}
					})
				})

				tempary = tempary.sort(function(a,b){
						if(a.sort > b.sort) return -1
						return 1
				})

				return cb(err,tempary)
		})

		
	})
}





obj.getNewsById = function(id,uid,cb){ //某一类型公告的详细内容

	newsModel.find({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(doc.length == 0) return cb(null, null);

		var tempary = []

		obj.getAllCommunity(function(err, comList){
			if(err) return cb(err)

			doc.forEach(function(obj){
				var tempurl = obj.url;
				comList.forEach(function(comObj){
						if(comObj._id.toString() == obj.code2){
							tempary.push({
								_id:obj._id,
								title:obj.title,
								content:obj.content,
								picture:obj.picture.split(','),
								url:tempurl,
								type:obj.type,
								code1:obj.code1,
								code2:obj.code2,
								code3:obj.code3,
								writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
							})
						}
				})
			})

			return cb(err,tempary[0])

		})

		
		
	})
}


obj.getNewsByType = function(appId,type,cb){ //某一类型公告的详细内容

	newsModel.find({
		appId:appId,
		isShow:1,
		type:type
	},function(err,doc){
		if(err) return cb(err)
		if(doc.length == 0) return cb('未找到推荐说明文章');

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
				code3:obj.code3,
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
		})



		return cb(err,tempary[0])
	})
}


obj.getAllCommunity = function(cb){

	communityModel.findAll({isShow:1},0,1000,function(err, list){
		if(err) return cb(err)
		if(!list || list.length == 0) return cb(null, list)
		list = list.sort(function(a,b){
			return a.sortNum - b.sortNum > 0 ? -1 : 1
		})
		cb(err, list)
	})


}


module.exports = obj;