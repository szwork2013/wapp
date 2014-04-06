var prizeModel = require('../dl/prizeModel.js'); //加载小区模型
var guidModel = require('../dl/guidModel.js');
var scoreGetModel = require('../dl/scoreGetModel.js');
var userBl = require('./wxUser.js'); //加载用户模型

var utils = require('../lib/utils.js');
var obj = {}

obj.getPrizeList = function(appId,cb){ //获取奖品列表
	prizeModel.findByObj({
		appId:appId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})
}

obj.getUserPrize = function(userId,appId,cb){ //获取自己的礼品流水
	scoreGetModel.findByObj({
		userId:userId,
		appId:appId,
		scoreType:2,
		scoreWay:'prize',
	},function(err,doc){
		cb(err,doc);
	})
}

obj.userGetThisPrize = function(userId,prizeId,cb){ //用户是否获得过这个奖品
	scoreGetModel.findByObj({
		userId:userId,
		scoreCode1:prizeId,
		scoreType:2,
		scoreWay:'prizeRule',
	},function(err,doc){
		cb(err,doc);
	})
}


obj.getPrize = function(prizeId,cb){ //获取奖品详情
	prizeModel.findByObj({
		_id:prizeId,
		isShow:1,
	},function(err,doc){
		return cb(err,cb)
	})
}

obj.obtainPrize = function(qobj){
	
	obj.getPrize(qobj.prizeId, function(err,doc){//获取此奖品，查看此奖品是否有效
		if(err) return cb(err);
		if(!doc) return cb('没有找到此商品');
		if(doc.totalNumber<1) return cb('商品已经兑换完毕');

			guidModel.getGuid(function(err,guid){ //生成guid

					userBl.removeScore(qobj.userId, function(err,doc){//查找用户状态
							if(err) return cb(err);
							
							scoreGetModel.insertOneByObj({ //发货记录
								appId:qobj.appId,
								userId:qobj.userId,
								scoreGuid:guid,
								scoreDetail:qobj.price,
								scoreType:2,
								scoreWay:'prize',
								scoreCode1:qobj.prizeId,
							},function(err,doc){
								if(err){
									logger.error('send prize error, userid: %s get prizeid: %s error, score has reduce %s.', qobj.userId, qobj.prizeId, qobj.price);//用户积分已扣，发货失败
									return cb(err);
								}
								
								prizeModel.createOneOrUpdate({//减去库存
									_id:qobj.prizeId,
								},{
									totalNumber:{$inc:-1}
								},function(err,doc){//完成兑换礼品
									if(err){
										logger.error('reduce prize totalnumber error, userid: %s get prizeid: %s error, score has reduce %s.', qobj.userId, qobj.prizeId, qobj.price);//用户积分已扣，发货失败
									}
									return cb(err,doc)
								})

							})
					})
			})
	})
}



module.exports = obj;