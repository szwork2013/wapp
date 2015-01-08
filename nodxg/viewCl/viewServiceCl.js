var userBl = require('../bl/wxUser.js');
var infoBl = require('../bl/wxInfo.js');
var utils = require('../lib/utils.js');
var moment = require('moment');
var obj = {}


//乐活空间公告，不用登录
obj.newsall = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var newsId = req.query.newsId;

	infoBl.getNewsByTypePage(appId, 2, 1, 100, function(err,list){
		if(err){
			logger.error('obj.newsall error, appId %s, err %s', appId, err);
			return res.send(500,'新闻列表页加载失败')
		}

		res.render('news_list.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
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
		if(!doc){
			return res.send(404,'未找到相关新闻')
		}
		//console.log(actdoc)
		if(req.is_v2){
			res.render('news_detail_v2.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'doc':doc
			})
		}
		else{
			res.render('news_detail.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'doc':doc
			})
		}
		
		return;

	})

}





 //只显示推荐说明的详细页
obj.newsDetail2 = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;


	infoBl.getNewsByType(appId, 2, function(err,doc){
		if(err){
			return res.send(500,'推荐说明加载失败')
		}
		//return res.json(doc)

		res.render('news_detail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			"title_detail":'推荐说明',
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
		
	})

}





module.exports = obj;