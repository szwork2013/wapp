var scoreBl = require('../bl/wxScoreSys.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.daySign = function(req, res){ //每日签到
	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var rule = 'dayRule'

	scoreBl.scoreRule(appId, userId, openId, {}, rule, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
	})
	
}


obj.game = function(req, res){ //每日签到
	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var gameid = req.param('gameid')
	var gameresult = req.param('gameresult')
	var rule = 'registRule'

	scoreBl.scoreRule(appId, userId, openId, {'gameid':gameid, 'gameresult':gameresult}, rule, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
	})
	
}



module.exports = obj;