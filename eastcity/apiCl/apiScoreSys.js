var scoreBl = require('../bl/wxScoreSys.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.daySign = function(req, res){ //每日签到
	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var rule = 'dayRule'

	scoreBl.scoreRule(appId, userId, openId, {'mobile':req.wxuobj.appUserMobile}, rule, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
	})
	
}


obj.game = function(req, res){ //游戏规则
	var userId = req.csession['userId'] || req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	//从client session中获取用户id
	var gameid = req.param('gameid');

	var gameresult = req.param('gameresult');
	var gamescore = req.param('gamescore');
	var rule = 'gameRule'
	if(!gameid || gameid.length != 24){
		 return res.send({error:1,data:'游戏id有误'})
	}
	if(!gameresult){
		 return res.send({error:1,data:'游戏结果有误'})
	}
	if(!gamescore || gamescore != parseInt(gamescore)){
		 return res.send({error:1,data:'游戏积分有误'})
	}
	
	scoreBl.scoreRule(appId, userId, openId, {'mobile':req.wxuobj.appUserMobile,'gameid':gameid, 'gameresult':gameresult, 'gamescore':gamescore}, rule, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
	})
	
}



module.exports = obj;