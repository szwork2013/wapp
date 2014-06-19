var moment = require('moment');
var prizeModel = require('../dl/prizeModel.js'); //加载小区模型
var guidModel = require('../dl/guidModel.js');
var scoreGetModel = require('../dl/scoreGetModel.js');
var userBl = require('./wxUser.js'); //加载用户模型

var utils = require('../lib/utils.js');
var obj = {}


obj.registRule = function(qobj,data,cb){ //注册
	qobj.scoreWay = 'regist'
	qobj.scoreDetail = 10
	obj.addScoreHistory(qobj,cb)
}

obj.gameRule = function(qobj,data,cb){ //游戏获得积分规则
	qobj.scoreWay = 'game'
	//qobj.scoreDetail = 10
	//obj.addScoreHistory(qobj,cb)
}

obj.dayRule = function(qobj,data,cb){ //每日签到
	qobj.scoreWay = 'daysign';
	qobj.scoreDetail = 5;
	var now = Date.now();
	var s = moment().hour(0).minute(0).second(0).format('YYYY/MM/DD HH:mm:ss');
	var e = moment().hour(23).minute(59).second(59).format('YYYY/MM/DD HH:mm:ss');

	obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, s, e, function(err,doc){
		if(err) return cb(err);
		//console.log(doc)
		if(doc && doc.length>0){//如果找到文档，则表示此用户已经签过到了
			return cb('您已经签过到了')
		}

		obj.addScoreHistory(qobj,cb);

	})
}

obj.getHistoryByUserId = function(userId, cb){//根据用户id查询记录
	scoreGetModel.findByObj({userId:userId},function(err,doc){
		return cb(err,doc)
	})
}

obj.getHistoryByUserIdAndRule = function(userId, rule, cb){//根据用户id和规则查询记录
	scoreGetModel.findByObj({
		userId:userId,
		scoreWay:rule,
		},function(err,doc){
			return cb(err,doc)
	})
}

obj.getHistoryByStartAndEnd = function(userId, rule, s, e, cb){//根据用户id和规则查询记录
	//console.log(userId,rule,s,e)

	scoreGetModel.findByObj({
		userId:userId,
		scoreWay:rule,
		writeTime:{
			"$gt":new Date(s)
		}
		},function(err,doc){
			//console.log(doc)
			return cb(err,doc)
	})
}


obj.addScoreHistory = function(qobj,cb){ //插入获取积分流水表

	guidModel.getGuid(function(err,guid){ //生成guid
		if(err) return cb(err);
		qobj.scoreGuid = guid;
		
		scoreGetModel.insertOneByObj(//插入获取积分流水
			qobj,
			function(err,doc){
				if(err) return cb(err);
				userBl.addScore(qobj.userId, qobj.scoreDetail, function(err,doc){//用户获取积分，对用户表做加分的操作
					if(err){
						logger.error('user obtain score but not add, userid is %s', qobj.userId)
					}
					cb(err,doc)
				})
			})
		})

}


obj.scoreRule = function(appId, userId, openId, data, rule, cb){ //根据rule调用规则
	if(!appId || !userId || !rule){
		return cb('appid userid rule can not be null');
	}
	if(!obj[rule] || 'function' != typeof obj[rule]){ //如果此次rule没有规则送积分
		return cb(null,null)
	}
	var qobj = {};
	qobj.appId = appId;
	qobj.userId = userId;
	qobj.openId = openId;
	qobj.scoreType = 1;
	try{
		obj[rule](qobj,data,cb);
	}
	catch(e){
		logger.error('execute %s function error: %s',rule,e);
		cb(e);
	}
}


module.exports = obj;