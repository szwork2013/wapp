var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var lotteryBl = require('../bl/wxLottery.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.regist = function(req,res){ //用户注册
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId

	res.render('user_regist.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


//修改资料
obj.modify = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	res.render('user_modify.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
	
}


//我的评论和收藏页面
obj.myzone = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	res.render('user_zone.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
}







obj.day = function(req,res){ //会员每日打卡页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	scoreBl.getHistoryByUserIdAndRule(userId, 'dayRule', function(err, doclist){
		
		if(err){
			logger.error('obj.day  error, userid %s, err %s', userId, err);
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

	infoBl.getScoreList(appId, userId, function(err,list){
		if(err){
			logger.error('obj.myscore error, appId %s, err %s', appId, err);
			return res.send(500,'我的积分页面失败')
		}

		res.render('user_score.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}

module.exports = obj;