var moment = require('moment');
var guidModel = require('../dl/guidModel.js');
var gameModel = require('../dl/appGameModel.js');
var scoreGetModel = require('../dl/scoreGetModel.js');
var recommendModel = require('../dl/recommendModel.js'); //加载推荐模型

 //新闻模型
var newsModel = require('../dl/appNewsModel.js');
//专刊模型
var specialModel = require('../dl/appSpecialModel.js');

var userBl = require('./wxUser.js'); //加载用户模型

var utils = require('../lib/utils.js');
var obj = {}


obj.registRule = function(qobj,data,cb){ //注册
	qobj.scoreWay = 'regist'
	qobj.scoreDetail = 100;
	qobj.mobile = data.mobile;

	obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, null, null, function(err,doc){
		if(err) return cb(err);
		if(doc && doc.length>0) return cb('已经获取过注册积分');
		obj.addScoreHistory(qobj,cb,true)
	})
}


obj.commentRule = function(qobj,data,cb){ //评论规则，评论每人每篇文章可获得5积分，可多次评论不可重复获取
	qobj.scoreWay = 'comment'
	qobj.scoreDetail = 5;
	qobj.mobile = data.mobile;
	qobj.scoreCode1 = data.scoreCode1;
	qobj.scoreCode2 = data.scoreCode2;

	obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, null, null, function(err,doc){
		if(err) return cb(err);
		if(doc && doc.length>0) return cb(null,null);//不增加积分，但是返回成功，让用户继续评论
		obj.addScoreHistory(qobj,cb)
	}, qobj.scoreCode1, qobj.scoreCode2)
}


obj.forwardingRule = function(qobj,data,cb){ //转发
	qobj.scoreWay = 'forwarding'
	qobj.scoreDetail = 5;
	qobj.mobile = data.mobile;
	qobj.scoreCode1 = data.articleid;

	newsModel.findOneByObj({
		_id:data.articleid
	},function(err,newsObj){
		if(err) return cb(err);
		specialModel.findOneByObj({
				_id:data.articleid
			},function(err,spObj){
				if(err) return cb(err);
				if(!newsObj && !spObj) return cb('未找到相关文章')
				obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, null, null, function(err,doc){
						if(err) return cb(err);
						if(doc.length>0) return cb('已经转发过此文章');
					obj.addScoreHistory(qobj,cb)
				}, data.articleid)//是否已经转发过				
		})//查找专刊
	})//查找新闻活动

}

obj.gameRule = function(qobj,data,cb){ //游戏获得积分规则
	qobj.scoreWay = 'game'
	var gameid = data.gameid;
	var gamescore = data.gamescore || 0
	if(!gameid || gameid.length !== 24){
		return cb('游戏id有误');
	}
	gameModel.findOneByObj({
		_id:gameid
	},function(err,doc){
		if(err) return cb(err);
		if(!doc) return cb('未找到相关游戏');
		var maxscore = doc.maxScore
		if( gamescore > maxscore) return cb('积分超过最大值');
		//判断成功，写入数据库
		qobj.scoreCode1 = gameid
		qobj.scoreDetail = gamescore
		qobj.mobile = data.mobile;
		
		var s = moment().hour(0).minute(0).second(0).format('YYYY/MM/DD HH:mm:ss');
		var e = moment().hour(23).minute(59).second(59).format('YYYY/MM/DD HH:mm:ss');

		obj.getHistoryByStartAndEnd(qobj.userId, qobj.scoreWay, s, e, function(err,doc){
			if(err) return cb(err);
			//console.log(doc)
			var r = doc.some(function(v){
				return v.scoreCode1 == gameid
			})
			if(r) return cb('今天获得过此游戏积分了')

			obj.addScoreHistory(qobj,cb);

		})

	})
	//qobj.scoreDetail = 10
	//obj.addScoreHistory(qobj,cb)
}

obj.dayRule = function(qobj,data,cb){ //每日签到
	qobj.scoreWay = 'daysign';
	qobj.scoreDetail = 5;
	qobj.mobile = data.mobile;
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

obj.getHistoryByUserIdAndRule = function(userId, rule, page, limit, cb){//根据用户id和规则查询记录
	var page = page || 0;
	var limit = limit || 10;

	scoreGetModel.findAll({
		userId:userId,
		scoreWay:rule,
		}, page*limit, limit, function(err,doc){
			return cb(err,doc)
	})
}

obj.getHistoryByStartAndEnd = function(userId, rule, s, e, cb, sc1,sc2,sc3,sc4,sc5){//根据用户id和规则查询记录
	//console.log(userId,rule,s,e)
	var obj = {
		userId:userId,
		scoreWay:rule,
	}

	if(s){
		obj.writeTime = {
			"$gt":new Date(s)
		}
	}
	if(sc1){
		obj.scoreCode1 = sc1;	
	}
	if(sc2){
		obj.scoreCode2 = sc2;	
	}
	if(sc3){
		obj.scoreCode3 = sc3;	
	}
	if(sc4){
		obj.scoreCode4 = sc4;	
	}
	if(sc5){
		obj.scoreCode5 = sc5;	
	}

	scoreGetModel.findByObj(obj,function(err,doc){
			//console.log(doc)
			return cb(err,doc)
	})
}


obj.addScoreHistory = function(qobj,cb,noCheckRecommend){ //插入获取积分流水表

	guidModel.getGuid(function(err,guid){ //生成guid
		if(err) return cb(err);
		qobj.scoreGuid = guid;
		
		scoreGetModel.insertOneByObj(//插入获取积分流水
			qobj,
			function(err,doc2){
				if(err) return cb(err);
				userBl.addScore(qobj.userId, qobj.scoreDetail, function(err,doc){
				//用户获取积分，对用户表做加分的操作
					if(err){
						logger.error('user obtain score but not add, userid is %s', qobj.userId)
					}
					if(!noCheckRecommend){
						obj.addRecommendUserScore(qobj, doc2._id)
					}
						cb(err,doc)					
				})
			})
		})
}

obj.addRecommendUserScore = function(lastobj,socreGetId){
	var qobj={}
	var addScoreUserId = lastobj.userId

	recommendModel.findOneByObj({
		appId:lastobj.appId,
		status:2,
		code1:addScoreUserId
	},function(err,recobj){
		if(err || !recobj) return;

		qobj.scoreWay = 'extra';
		qobj.appId = lastobj.appId;
		qobj.userId = recobj.userId;
		qobj.mobile = lastobj.mobile;
		qobj.scoreDetail = parseInt(lastobj.scoreDetail*0.1) || 1;
		qobj.scoreType = 1;		
		qobj.scoreCode1 = socreGetId;

		obj.addScoreHistory(qobj,function(err,doc){
			if(err) return console.log(err)
			//console.log(doc)
		},true)
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