var prizeModel = require('../dl/prizeModel.js'); //加载商品模型
var saleModel = require('../dl/saleModel.js'); //加载拍品模型
var guidModel = require('../dl/guidModel.js');
var userModel = require('../dl/userModel.js');
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


obj.getSaleList = function(appId,cb){ //获取竞拍列表
	saleModel.findByObj({
		appId:appId,
		isShow:1,
	},function(err,doc){
		if(err) return cb(err);
		if(doc.length==0) return cb(); //如果没有竞拍数据

		var userids = [] //获得出价的用户id数组，去查询这些用户的数据
		doc.forEach(function(saleobj){
			if(saleobj.highUserId == '') return;
			userids.push(saleobj.highUserId)
		})

		userModel.getUserByIds(userids,function(err,userlist){
			if(err) return cb(err);
			if(userlist.length==0) return cb(); //如果没有找到用户

			doc.forEach(function(saleobj){
				if(saleobj.highUserId == ''){
					saleobj.userDetail = {}
					return;
				}
				for(var i=0;i<userlist.length;i++){
					if(userlist[i]._id == saleobj.highUserId ){
						saleobj.userDetail = userlist[i];
						break;
					}
				}
			})
			cb(null, doc)
		})
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

obj.obtainPrize = function(qobj,mobile,cb){
	
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
								mobile:mobile,
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
		_id:saleid,
		isShow:1
	},function(err,saledoc){
		if(err) return cb(er)
		if(!saledoc) return cb('未找到拍品')
		
		var now = Date.now()
		var s = Date.parse(saledoc.startTime)
		var e = Date.parse(saledoc.endTime)
		var startPrice = saledoc.startPrice;
		var highUserId = saledoc.highUserId; //当前最高出价的用户id
		var highPrice = saledoc.highPrice;   //当前最高出价

		if(s>now){
			return cb('竞拍还未开始')
		}
		if(e<now){
			return cb('竞拍已经结束')
		}
		if(startPrice>=score){
			return cb('出价低于起拍价')
		}
		if(highPrice>=score){
			return cb('出价低于当前竞拍价')
		}

			//先扣除这个用户的积分
		userModel.createOneOrUpdate({
			_id:userId
		},{
			$inc:{appUserScore:score*-1}
		},function(err,doc){
				if(err){
					//更新价目失败
					logger.error('reduce user score error:userModel.createOneOrUpdate, userid: %s ,saleid: %s, score %s.', userId, saleid, score);
					return cb(err)
				}
				saleModel.createOneOrUpdate({
					_id:saleid
				},{
					highPrice:score,
					highUserId:userId
				},function(err,doc){
					if(err){
						//更新价目失败
						logger.error('has reduce user score,but got error:saleModel.createOneOrUpdate, userid: %s ,saleid: %s, score %s.', userId, saleid, score);
						return cb(err)
					}
					if(saledoc.highPrice == 0){ //第一个出价					
						return cb(null,doc)
					}

					//如果不是第一个出价，则把上一个最高出价的人分数返回加上
					userModel.createOneOrUpdate({
						_id:highUserId
					},{
						$inc:{appUserScore:highPrice}
					},function(err,doc){
						if(err){
							//更新价目失败
							logger.error('add last userid score error: userModel.createOneOrUpdate, userid: %s ,saleid: %s, score %s.', highUserId, saleid, highPrice);
							return cb(err)
						 }
						 cb(null,doc)
					})//end userModel.createOneOrUpdate

				})//end saleModel.createOneOrUpdate
		
		})//end 


	})//end saleModel.findOneByObj




}
	

module.exports = obj;