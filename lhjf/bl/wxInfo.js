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
//评论模型
var userModel = require('../dl/userModel.js'); 
//活动日志模型
var activeLogModel = require('../dl/activeLogModel.js'); 

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
	var skip = (page-1) * size;

	var qobj = {
		appId:appId,
		isShow:1,
		code1:''
	}

	/*
	if(type){//如果有类型，则传入类型和code1
		qobj.type = type;
		qobj.code1 = '';
	}
	*/

	specialModel.findAll(qobj,skip, size,function(err,doc){
		if(err) return cb(err)
		if(doc.length==0) return cb(null, doc);
		
		var tempary = []

		doc.forEach(function(obj){
			tempary.push({
				_id:obj._id,
				title:obj.title,
				//content:obj.content,
				picture:obj.picture.split(',') || '',
				type:obj.type,
				code1:obj.code1,
				code2:obj.code2,
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
		})


		return cb(err,tempary)
	})
}


obj.getSpecialById = function(id,cb){ //某一类型专刊的详细内容

	specialModel.findOneByObj({
		_id:id,
		isShow:1
	},function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);	
		var tempary = []
		var obj = doc

		tempary = {
			_id:obj._id,
			title:obj.title,
			content:obj.content,
			picture:obj.picture.split(',') || '',
			type:obj.type,
			code1:obj.code1,
			code2:obj.code2,
			writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
		}

		return cb(err,tempary)
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

			/*
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
			*/
			
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
			if(uids.indexOf(o.userId) == -1){
					uids.push(o.userId)
			}
			
		})
		//console.log(uids)
		userModel.getUserByIds(uids,function(err,list){
			if(err) return cb(err)
			//console.log(list)
			temparray.forEach(function(o){

				var len = list.length;
				for(var i=0;i<len;i++){
					
					if(list[i].value.toString() == o.userId){
						
						o.appUserName = list[i].text;
						//console.log(o.appUserName)
						return;
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


obj.removeCommentBySpid = function(appId, userId, spid, content, type, cb){
	commentModel.destroy({
		appId:appId,
		userId:userId,
		specialId:spid,
		type:type
	},function(err,doc){
		return cb(err,doc)
	})
}

obj.getSpecialTop = function(appId, type, cb){
	specialModel.findAll({
		appId:appId,
		//type:type,
		code1:'1',
	},0,5,function(err,doc){
		if(err || doc.length == 0){
			return cb(err,doc)
		}


		var tempary = []

		doc.forEach(function(obj){
			tempary.push({
				_id:obj._id,
				title:obj.title,
				//content:obj.content,
				picture:obj.picture.split(',') || '',
				writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
		})

		return cb(err,tempary)

	})
}



//活动的bl
obj.saveActive = function(obj,cb){
	activeLogModel.findOneByObj({
		userid:obj.userid,
		appId:obj.appId,
		activeId:obj.activeId,
	},function(err,doc){
		if(err) return cb(err);
		if(doc) return cb('你已经报名了');
		activeLogModel.insertOneByObj(obj,cb)
	})
}


obj.findMeActiveByActiveId = function(appId,userid,activeId,cb){
	activeLogModel.findOneByObj({
		userid:userid,
		appId:appId,
		activeId:activeId,
	},cb)
}

obj.findMyActive = function(appId,userid,activeId,cb){
	activeLogModel.findAll({
		userid:userid,
		appId:appId,
	},0,1000,cb)
}

obj.countActiveByActiveId = function(appId,activeId,cb){
	activeLogModel.countAll({
		activeId:activeId,
		appId:appId,
	},cb)
}


module.exports = obj;