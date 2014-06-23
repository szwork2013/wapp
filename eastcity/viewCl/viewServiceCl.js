var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var utils = require('../lib/utils.js');
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
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}


//物语空间活动
obj.newsall = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getNewsByTypePage(appId, 2, 1, 50, function(err,list){
		if(err){
			logger.error('obj.newsall error, appId %s, err %s', appId, err);
			return res.send(500,'物语空间活动加载失败')
		}

		res.render('newsall_list.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
}



//物语空间公告
obj.announce = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getNewsByTypePage(appId, 3, 1, 50, function(err,list){
		if(err){
			logger.error('obj.announce error, appId %s, err %s', appId, err);
			return res.send(500,'物语空间公告加载失败')
		}

		res.render('announce_list.ejs',{
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

	infoBl.getNewsById(newsId, userId, function(err,doc){
		if(err){
			logger.error('obj.newsDetail error, newsId %s, err %s', newsId, err);
			return res.send(500,'详细页面加载失败')
		}
		if(doc.type == 1 && doc.url != ''){
			res.redirect(doc.url)
			return;
		}
		res.render('news_detail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'doc':doc
		})
		return;
	})

}


//一键呼叫，预约服务
obj.call = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getBookList(appId, function(err,list){
		if(err){
			logger.error('obj.call error, appId %s, err %s', appId, err);
			return res.send(500,'一键呼叫加载失败');
		}

		res.render('service_call.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}




//专刊列表,根据type显示不同的专刊内容
obj.speciallist = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;


	res.render('special_list.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'list':list
	})
	return;

}



//专刊详细
obj.specialdetail = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var spid = req.query.spid;

	infoBl.getSpecialById(spid, function(err,list){
		if(err){
			logger.error('obj.specialdetail error, appId %s, err %s', appId, err);
			return res.send(500,'专刊详细页面加载失败')
		}

		res.render('special_detail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}





module.exports = obj;