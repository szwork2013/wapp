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

	infoBl.getGameList(appId, function(err,list){
		if(err){
			logger.error('obj.gamelist error, appId %s, err %s', appId, err);
			return res.send(500,'游戏列表页加载失败')
		}

		res.render('game_list.ejs',{
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
	var gameid = req.query.gameid;

	if(!gameid || gameid.length != 24){
		return res.send(500,'gameid有误')
	}
	req.csession['userId'] = userId;
	req.csflush(); 
	
	infoBl.getOneGameById(gameid, function(err,doc){
		if(err){
			logger.error('obj.gamedetail error, appId %s, err %s', appId, err);
			return res.send(500,'游戏详细页加载失败')
		}
		if(!doc){
			return res.send(500,'未找到游戏')
		}
		
		if(doc['url'].indexOf('http://') != -1){
			res.redirect(doc['url']);
			return;
		}

		//return res.json(doc)

		res.render('game/'+doc['url'],{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'doc':doc
		})
		return;
	})	
}




module.exports = obj;