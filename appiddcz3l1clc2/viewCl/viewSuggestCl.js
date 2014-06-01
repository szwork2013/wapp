var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var lotteryBl = require('../bl/wxLottery.js');
var suggestBl = require('../bl/wxSuggest.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.reCommend = function(req,res){ //客户推荐页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.reCommend infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'客户推荐页面加载失败')
		}

		res.render('suggestReCommend.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})	
}

/*
obj.custom = function(req,res){ //客服页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	res.render('suggestCustom.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder
	})
	return;
}
*/

/*
obj.reqService = function(req,res){ //服务请求
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.reqService infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'服务请求页面加载失败')
		}

		res.render('suggestReqService.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})	
}
*/

/*
obj.reqComplaints = function(req,res){ //意见投诉
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	res.render('suggestReqComplaints.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder
	})
	return;
}
*/

obj.reqMessage = function(req,res){ //用户留言
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	res.render('suggestReqMessage.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder
	})
	return;
}

obj.myReply = function(req,res){ //查询反馈,并可获取最近100条记录
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	suggestBl.getSuggestByUerId(userId,appId,function(err,list){
		if(err){
			logger.error('obj.myReply infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'查询反馈页面加载失败')
		}
		res.render('suggestMyReply.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}


obj.orderSearch = function(req,res){ //输入流水号，查询处理结果页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	res.render('suggestOrderSearch.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
	return;

}






module.exports = obj;