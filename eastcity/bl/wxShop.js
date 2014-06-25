var prizeModel = require('../dl/prizeModel.js'); //加载商品模型
var saleModel = require('../dl/saleModel.js'); //加载拍品模型
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
		return cb(err,doc)
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
	prizeModel.findOneByObj({
		_id:prizeId,
		isShow:1,
	},function(err,doc){
		return cb(err,doc)
	})
}

obj.obtainPrize = function(qobj,cb){
	
	obj.getPrize(qobj.prizeId, function(err,prizeDoc){//获取此奖品，查看此奖品是否有效
		if(err) return cb(err);
		if(!prizeDoc) return cb('没有找到此商品');
		if(prizeDoc.totalNumber<1) return cb('商品已经兑换完毕');

			guidModel.getGuid(function(err,guid){ //生成guid
				if(err) return cb(err);

				scoreGetModel.findByObj({
					userId:qobj.userId,
					scoreCode1:prizeDoc._id
				},function(err,recrodAry){

					if(err) return cb(err);
					var len = recrodAry.length;

					if(prizeDoc.accountBuyNumber >0 && len > 0 && len >= prizeDoc.accountBuyNumber){
						return cb('超过限额');
					}

					userBl.removeScore(qobj.userId, prizeDoc.price, function(err,doc){//查找用户状态
							if(err) return cb(err);
							
							scoreGetModel.insertOneByObj({ //发货记录
								appId:qobj.appId,
								openId:qobj.openId,
								userId:qobj.userId,
								scoreGuid:guid,
								scoreDetail:prizeDoc.price,
								scoreType:2,
								scoreWay:'exchange',
								scoreCode1:prizeDoc._id,
							},function(err,doc){
								if(err){
									logger.error('send prize error, userid: %s get prizeid: %s error, score has reduce %s.', qobj.userId, qobj.prizeId, qobj.price);//用户积分已扣，发货失败
									return cb(err);
								}
								
								prizeModel.createOneOrUpdate({//减去库存
									_id:prizeDoc._id,
								},{
									$inc:{totalNumber:-1}
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
	})
}


obj.saleprize = function(saleid, userId, score, cb){

	saleModel.findOneByObj({
		_id:saleid
	},function(err,saledoc){
		if(err) return cb(er)
		if(!saledoc) return cb('未找到拍品')
		var now = Date.now()
		var s = 


	})




}
	

module.exports = obj;