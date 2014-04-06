var moment = require('moment');
var prizeModel = require('../dl/prizeModel.js'); //加载小区模型
var guidModel = require('../dl/guidModel.js');
var scoreGetModel = require('../dl/scoreGetModel.js');
var userBl = require('./wxUser.js'); //加载用户模型

var utils = require('../lib/utils.js');
var obj = {}


obj.registRule = function(qobj,cb){ //注册
	qobj.scoreWay = 'registRule'
	qobj.scoreDetail = 10
	obj.addScoreHistory(qobj)
}

obj.dayRule = function(qobj,cb){ //每日签到
	qobj.scoreWay = 'dayRule';
	qobj.scoreDetail = 10;
	var now = Date.now();
	var s = new Date(now - now % 1000*60*60*24);//今天0点的时间戳
	var e = new Date(s+1000*60*60*24);//明天0点的时间戳

	obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, s, e, function(err,doc){
		if(err) return cb(err);
		if(doc){//如果找到文档，则表示此用户已经签过到了
			return cb('您已经签过到了')
		}

		obj.addScoreHistory(qobj,cb);

	})
}

obj.getHistoryByUserId = function(userId, cb){//根据用户id查询记录
	scoreGetModel.findAll({userId:userId},0,100,function(err,doc){
		return cb(err,doc)
	})
}

obj.getHistoryByUserIdAndRule = function(userId, rule, cb){//根据用户id和规则查询记录
	scoreGetModel.findAll({
		userId:userId,
		scoreDetail:rule,
		},0,100,function(err,doc){
			return cb(err,doc)
	})
}

obj.getHistoryByStartAndEnd = function(userId, rule, s, e, cb){//根据用户id和规则查询记录
	scoreGetModel.findAll({
		userId:userId,
		scoreDetail:rule,
		writeTime:{
			$gt:s,
			$lt:e
		}
		},0,100,function(err,doc){
			return cb(err,doc)
	})
}


obj.addScoreHistory = function(qobj,cb){ //插入获取积分流水表

	guidModel.getGuid(function(err,guid){ //生成guid
		if(err) return cb(err);
		qobj.scoreGuid = guid;
		
		scoreGetModel.createOneOrUpdate{//插入获取积分流水
			{
				scoreType:-1
			},qobj,function(err,doc){
				if(err) return cb(err);
				userBl.addScore(qobj.userId, qobj.scoreDetail, function(err,doc){//用户获取积分，对用户表做加分的操作
					if(err){
						logger.error('user obtain score but not add, userid is %s', qobj.userId)
					}
					cb(err,doc)
				})
			}
		}
	})
}


obj.scoreRule = function(appId, userId, rule, cb){ //根据rule调用规则
	if(!appid || !userid || !rule){
		return cb('appid userid rule can not be null');
	}
	if(!obj[rule] || 'function' typeof != obj[rule]){ //如果此次rule没有规则送积分
		return cb(null,null)
	}
	var qobj = {};
	qobj.appId = appId;
	qobj.userId = userId;
	qobj.scoreType = 1;
	try{
		obj[rule](qobj,cb);
	}
	catch(e){
		logger.error('execute %s function error: %s',rule,e);
		cb(e);
	}
}


module.exports = obj;