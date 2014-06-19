var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');

var utils = require('../lib/utils.js');
var obj = {}



//游戏列表页
obj.gamelist = function(req,res){ //客户推荐页面
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

//游戏详细页
obj.gamedetail = function(req,res){ //客户推荐页面
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




module.exports = obj;