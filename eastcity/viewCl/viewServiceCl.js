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
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}


//乐活空间公告
obj.newsall = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}

//物语空间公告
obj.announce = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}



//一键呼叫，预约服务
obj.call = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coCall infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'获取小区新闻加载失败')
		}

		res.render('serviceCall.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}


obj.newsDetail = function(req,res){ //共用新闻详细页
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var newsId = req.query.newsId;
	var type = req.query.backtype;
	var backUrl = req.query.backUrl || '/';



	if(newsId && newsId.length !== 24){
		return res.send(500,'错误参数newsId')
	}

	if(type == 'prom'){
		backUrl = '/view/service/copromotion?wxuserid='+userId
	}
	else if(type == 'act'){
		backUrl = '/view/service/coact?wxuserid='+userId
	}
	else{
		backUrl = '/view/service/newsall?wxuserid='+userId
	}

	infoBl.getNewsDetail(newsId, function(err,doc){
		if(err){
			logger.error('obj.newsDetail infoBl.getNewsDetail error, newsId %s, err %s', newsId, err);
			return res.send(500,'新闻页面加载失败')
		}

		res.render('serviceNewsDetail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'doc':{
			  _id:doc._id,
			  appId:doc.appId,    			  //应用id
		      coId:doc.coId,
		      appNewsTitle:doc.appNewsTitle,
		      appNewsContent:doc.appNewsContent,
		      appNewsPicture:doc.appNewsPicture.split(','),
		      appNewsType:doc.appNewsType,
		      isShow:doc.isShow,
			  writeTime: moment(doc.writeTime).format('YYYY年MM月DD日')
			},
			'backUrl':backUrl,
		})
		return;
	})

}

//专刊列表,根据type显示不同的专刊内容
obj.speciallist = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}



//专刊详细
obj.specialdetail = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
/*
	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})
*/
}





module.exports = obj;