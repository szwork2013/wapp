//游戏model
var gameModel = require('../dl/appGameModel.js');
 //新闻模型
var newsModel = require('../dl/appNewsModel.js');
//专刊模型
var specialModel = require('../dl/appSpecialModel.js');
//预约模型
var bookModel = require('../dl/appBookModel.js'); 
//评论模型
var commentModel = require('../dl/appCommentModel.js'); //加载评论模型

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

		return cb(err,doc)
	})
}


obj.getSpecialById = function(id,cb){ //某一类型专刊的详细内容

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
			if(obj.type == 1 && obj.url != ''){
				
				if(obj.url.indexOf('?') == -1){
					tempurl += '?'
				}
				else{
					tempurl += '&'
				}
				var qs = 'x_field_1='+id+'_'+uid
				tempurl += qs;
			}
			
			tempary.push({
				_id:obj._id,
				title:obj.title,
				content:obj.content,
				picture:obj.picture.split(','),
				url:tempurl,
				type:obj.type,
				code1:obj.code1,
				code2:obj.code2,
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD')
			})
		})
		return cb(err,tempary[0])
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


obj.getCommentByspecialid = function(spid,page,pagesize,cb){ //获取用户的评论或者收藏列表
	var size = size || 10;
	var skip = (page-1) * size
	commentModel.findAll({
		specialId:spid,
		type:1,
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(doc.length == 0) return cb(null, doc);
		var temparray = []
		var uids = []
		doc.forEach(function(o){
			temparray.push({
				_id:o._id,
				userId:o.userId,
				specialId:o.specialId,
				content:o.content,
				writeTime:moment(o.writeTime).format('YYYY-MM-DD HH:mm:ss')
			})
			uids.push(o._id)
		})

		newsModel.getUserByIds(uids,function(err,list){
			if(err) return cb(err)
			temparray.forEach(function(o){

				var len = list.length;
				for(var i=0;i<len;i++){
					if(list[i]._id == o.userId){
						o.appUserName = list[i].appUserName;
						break;
					}
				}
				o.appUserName = '未知用户'

			})

			return cb(null, temparray);

		})


		//return cb(err,doc)
	})
}

obj.countCommentByspecialid = function(spid,cb){ //获取评论总数
	var size = size || 10;
	var skip = (page-1) * size
	commentModel.countAll({
		specialId:spid,
		type:1,
	},function(err,count){
		if(err) return cb(null,0)
		return cb(null,count)
	})
}

obj.getIsFavorBySpid = function(spid,uid,cb){//记录判断我是否已经收藏了这篇专刊

	commentModel.countAll({
		specialId:spid,
		userId:uid,
		type:2,
	},function(err,count){
		return cb(err,count)
	})

}

obj.createCommentBySpid = function(appId, userId, spid, content, type, cb){
	commentModel.createOneOrUpdate({
		writeTime:new Date('1970-1-1')
	},{
		  appId:appId,
	      userId:userId,     //评论用户的Id
	      specialId:spid,
	      content:content,
	      type:type, 
	      writeTime:new Date()
	},function(err,doc){

		return cb(err,{
		  appId:appId,
	      userId:userId,
	      specialId:spid,
	      content:content,
	      type:type, 
	      writeTime:moment().format('YYYY-MM-DD HH:mm:ss')
		})
	})
}





module.exports = obj;