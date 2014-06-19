var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var lotteryBl = require('../bl/wxLottery.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.binder = function(req,res){ //用户认证绑定页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId


	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户认证绑定页面失败')
		}

		res.render('userBinder.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})

	return;
}


//我的评论和收藏页面
obj.myzone = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户会员卡页面失败')
		}

		res.render('userCard.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}




obj.modify = function(req,res){ //用户会员卡功能
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户会员卡页面失败')
		}

		res.render('userCard.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}



obj.day = function(req,res){ //会员每日打卡页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	scoreBl.getHistoryByUserIdAndRule(userId, 'dayRule', function(err, doclist){
		
		if(err){
			logger.error('obj.day getHistoryByUserIdAndRule error, userid %s, err %s', userId, err);
			return res.send(500,'签到页面加载失败')
		}

		res.render('userDayRule.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'dayRule':doclist
		})
		return;
	})
}



//我的积分页面
obj.myscore = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户会员卡页面失败')
		}

		res.render('userCard.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}

module.exports = obj;