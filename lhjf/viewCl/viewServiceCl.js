var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var utils = require('../lib/utils.js');
var invesDl = require('../dl/investigateModel.js');
var invesLogDl = require('../dl/investigateLogModel.js');


var moment = require('moment');
var obj = {}




//活动页面，可能是金数据投票列表页
obj.activelist = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getNewsByTypePage(appId, 1, 1, 100, function(err,list){
		if(err){
			logger.error('obj.activelist error, appId %s, err %s', appId, err);
			return res.send(500,'乐活空间公告加载失败')
		}

		res.render('active_list.ejs',{
			'title':'活动',
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}


//乐活空间公告，不用登录
obj.newsall = function(req,res){ 
	//var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	//var openId = req.wxuobj.openId;

	infoBl.getNewsByTypePage(appId, 2, 1, 100, function(err,list){
		if(err){
			logger.error('obj.newsall error, appId %s, err %s', appId, err);
			return res.send(500,'物语空间活动加载失败')
		}
		//return res.json(list)

		res.render('active_list.ejs',{
			'title':'公告',
			'userObj':{'_id':'0'},
			'binderObj':{},
			'list':list
		})
		return;
	})
}



//物语空间活动
obj.announce = function(req,res){ 
	//var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	//var openId = req.wxuobj.openId;

	infoBl.getNewsByTypePage(appId, 3, 1, 100, function(err,list){
		if(err){
			logger.error('obj.announce error, appId %s, err %s', appId, err);
			return res.send(500,'物语空间公告加载失败')
		}
		//return res.json(list)

		res.render('active_list.ejs',{
			'title':'物语空间公告',
			'userObj':{'_id':'0'},
			'binderObj':{},
			'list':list
		})
		return;
	})
}




obj.newsDetail = function(req,res){ //共用新闻详细页
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var newsId = req.query.newsId;

	if(!newsId || newsId.length != 24){
		return res.send(500,'新闻id有误')
	}

	infoBl.getNewsById(newsId, userId, function(err,doc){
		if(err){
			logger.error('obj.newsDetail error, newsId %s, err %s', newsId, err);
			return res.send(500,'详细页面加载失败')
		}
		if(doc.type == 1 && doc.url != ''){
			res.redirect(doc.url)
			return;
		}

		var defaultActiveCount =  parseInt(doc.code1) || 0;
		
		//查找参加活动人数
		infoBl.countActiveByActiveId(appId,newsId,function(err,count){
			if(err){
				return res.send(500,'详细页面加载失败')
			}

			var activeCount = defaultActiveCount + count;

			//查找用户是否有已经报名过了
			infoBl.findMeActiveByActiveId(appId,userId,newsId,function(err,actdoc){
				if(err){
					return res.send(500,'详细页面加载失败')
				}
				//console.log(actdoc)
				res.render('news_detail.ejs',{
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'activeCount':activeCount,
					'joinInfo':actdoc,
					'doc':doc
				})
				return;
			})

		})
		
	})

}


 //共用新闻详细页,不用登录
obj.newsDetail2 = function(req,res){ //共用新闻详细页
	//var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	//var openId = req.wxuobj.openId;
	var newsId = req.query.newsId;

	if(!newsId || newsId.length != 24){
		return res.send(500,'新闻id有误')
	}

	infoBl.getNewsById(newsId, '0', function(err,doc){
		if(err){
			logger.error('obj.newsDetail error, newsId %s, err %s', newsId, err);
			return res.send(500,'详细页面加载失败')
		}
		if(doc.type == 1 && doc.url != ''){
			res.redirect(doc.url)
			return;
		}

		//return res.json(doc)

		res.render('news_detail.ejs',{
			'userObj':{'_id':'0'},
			'binderObj':{},
			'activeCount':0,
			'joinInfo':false,
			'doc':doc
		})
		return;
	})

}



//一键呼叫，预约服务，不用登录
obj.call = function(req,res){ 
	//var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	//var openId = req.wxuobj.openId;

	infoBl.getBookList(appId, function(err,list){
		if(err){
			logger.error('obj.call error, appId %s, err %s', appId, err);
			return res.send(500,'一键呼叫加载失败');
		}

		res.render('service_call.ejs',{
			'userObj':{},
			'binderObj':{},
			'list':list
		})
		return;
	})

}



//专刊列表封面
obj.specialindex = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;


	infoBl.getSpecialByTypePage(appId,false,1,5,function(err,list){
		if(err){
			console.log(err)
			return res.send(500,'专刊封面页面失败');
		}
		var topDoc = list[0];
		var list2 = list.slice(1);

		res.render('special_index.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'topdoc':topDoc,
			'list':list2
		})

	})

	return;

}



//专刊列表,根据type显示不同的专刊内容
obj.speciallist = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getSpecialByTypePage(appId,false,1,5,function(err,list){
		if(err){
			console.log(err)
			return res.send(500,'专刊封面页面失败');
		}
		var topDoc = list[0];
		var list2 = list.slice(1);

		res.render('special_list.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'topdoc':topDoc,
			'list':list2
		})

	})

	return;

}



//专刊详细
obj.specialdetail = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var spid = req.query.spid;

	if(!spid || spid.length != 24){
		return res.send(500,'spid有误')
	}
	
	infoBl.getSpecialById(spid, function(err,doc){
		if(err){
			logger.error('obj.specialdetail error, appId %s, err %s', appId, err);
			return res.send(500,'专刊详细页面加载失败')
		}
		infoBl.getIsFavorBySpid(spid,userId,function(err,favorCount){
			
			if(err){
				logger.error('obj.specialdetail infoBl.getIsFavorBySpid, appId %s, err %s', appId, err);
				return res.send(500,'专刊详细页面加载失败')
			} 

			infoBl.countCommentByspecialid(spid,function(err,count){

				res.render('special_detail.ejs',{
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'doc':doc,
					'commentCount':count,
					'favorCount':favorCount
				})
				return;
			})
		})
		
	})//end infoBl.getSpecialById

}



//查找一个调查的记录，并显示出去
obj.investigatePage = function(req, res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;


	//查找第一个调查
	invesDl.findOneByObj({
		'isShow':1,
		'startTime':{'$lte':new Date()},
		'endTime':{'$gte':new Date()},
	}, function(err, invesDoc){
		if(err) return res.send(500,'调查页面加载失败');
		if(!invesDoc) return res.render('investigate.ejs',{
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'invesDoc':{},
				})

		try{
			var tempQuestionDoc = invesDoc.questionJson
		}
		catch(e){
			return res.send(500,'调查页面加载失败');
		}

		//查找是否参与过
		invesLogDl.findByObj({
				'userId':userId,
				'investigateId':invesDoc._id.toString(),
			}, function(err, logDoc){
				if(err) return res.send({error:1,data:err}) 
				//已经参与过了
				var hasLog = false
				if(logDoc.length > 0){
					hasLog = true
				}


			return res.render('investigate.ejs',{
						'userObj':req.wxuobj,
						'binderObj':req.wxBinder,
						'invesDoc':{
							'_id':invesDoc._id,
							'title':invesDoc.title,
							'desc':invesDoc.desc,
							'startTime':invesDoc.startTime,
							'endTime':invesDoc.endTime,
							'totalNumber':invesDoc.totalNumber,
							'questionJson':tempQuestionDoc,
							'imgUrl':invesDoc.imgUrl,
							'isShow':invesDoc.isShow,
						},
						hasLog:hasLog
					})
		})

	})

}


//查找一个调查的记录，并显示出去
//ajax接口
obj.investigatePost = function(req, res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var invesId = req.body.invesId;
	var resultJson = req.body.resultJson;

	if(!invesId || invesId.length !=24){
		res.send({error:1,data:'调查id无效'}) 
		return
	}

	try{
		var resultObj = JSON.parse(resultJson)
	}
	catch(e){
		res.send({error:1,data:'调查结果无效'})
		return
	}


	invesLogDl.findByObj({
		'userId':userId,
		'investigateId':invesId,
	}, function(err, logDoc){
		if(err) return res.send({error:1,data:err}) 
		//已经参与过了
		if(logDoc.length > 0){
			return res.send({error:1,data:'您已经参与过了'}) 
		}
			invesDl.findOneByObj({
				'_id':invesId
			}, function(err, invesDoc){
				if(err) return res.send({error:1,data:err}) 
				if(!invesDoc){
					res.send({error:1,data:'未找到调查'})
					return
				}

				try{
					var questionObj = JSON.parse(invesDoc.questionJson)
				}
				catch(e){
					res.send({error:1,data:'调查解析出错'})
					return
				}

				if(resultObj.length != questionObj.length){
					return res.send({error:1,data:'请将调查填写完整'})
				}

				//循环检查
				for(var i=0; i<resultObj.length; i++){
					if(resultObj[i].length == 0){
						return res.send({error:1,data:'第'+(i+1)+'条未填写'})
					}
					if(questionObj[i].type == 1 && resultObj[i].length > 1){
						return res.send({error:1,data:'第'+(i+1)+'条选择过多'})
					}
					//检查调查选项是否有效
					for(var j=0; j<resultObj[i]; j++){
						var tmpPos = parseInt(resultObj[i][j])
						if(!resultObj[i].questions[tmpPos]){
							return res.send({error:1,data:'第'+(i+1)+'条选择无效'})
						}
					}
				}

				invesLogDl.insertOneByObj({
					'userId':userId,
					'investigateId':invesId,
					'investigateResultJson':resultJson
				}, function(err, doc){
					if(err) return res.send({error:1,data:err}) 
					return res.send({error:0,data:'调查成功'})
				})


			})


	})



}





module.exports = obj;