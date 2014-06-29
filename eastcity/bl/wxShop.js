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
			if(userids.indexOf(saleobj.highUserId) == -1){
				userids.push(saleobj.highUserId)
			}
			
		})
		//console.log(userids)

		userModel.getUserByIds(userids,function(err,userlist){
			if(err) return cb(err);
			//if(userlist.length==0) return cb(); //如果没有找到用户
			//console.log(userlist);

			var tempary = [];
			doc.forEach(function(obj){
				var state = 0;
				if(moment()<moment(obj.startTime)){
					state = 1;
				}
				if(moment()>moment(obj.endTime)){
					state = 2;
				}
				if(obj.startPrice>obj.highPrice){
					highPrice = obj.startPrice 
				}
				else{
					highPrice = obj.highPrice
				}
				var appUserName;
				if(obj.highUserId == ''){
					appUserName = '暂无人出价'
				}
				else{
					for(var i=0;i<userlist.length;i++){
						if(userlist[i].value == obj.highUserId ){
							appUserName = userlist[i].text
							break;
						}
					}
				}

				tempary.push({
					  state:state,
					  appUserName:appUserName,
					  _id:obj._id,	
					  name:obj.name,
					  highPrice:highPrice,
					  highUserId:obj.highUserId,
					  startTime:moment(obj.startTime).format('YYYY-MM-DD hh:mm:ss'),
					  endTime:moment(obj.endTime).format('YYYY-MM-DD hh:mm:ss'),
					  imgUrl:obj.imgUrl,
					  code1:obj.code1,
					  code2:obj.code2,
					  userDetail:obj.userDetail
				})

			})

			//console.log(tempary)
			cb(null, tempary)
		})
	})
}


obj.getUserPrize = function(userId,appId,cb){ //获取自己的礼品流水
	scoreGetModel.findByObj({
		userId:userId,
		appId:appId,
		scoreType:2,
		scoreWay:'exchange',
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


obj.saleprize = function(saleid, userId, score, mobile, cb){

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

		if(saledoc.status != 1){
			return cb('拍品已经拍出')
		}
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
					highUserId:userId,
					highMobile:mobile
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



obj.getMyOrder = function(appId, userId, cb){

	scoreGetModel.findAll({
		appId:appId,
		userId:userId,
		scoreType:2,
		 $or: [ { scoreWay: 'exchange' }, { scoreWay: 'sale' } ]
	},0,1000,function(err,list){
		if(err) return cb(err);
		if(list.length == 0) return cb(null,list);
		//console.log(list)


		var templist = []
		var ids_shop = [];
		var ids_sale = [];
		list.forEach(function(o){
			var status = '待发货';
			if(o.scoreCode2 == '1'){
				status = '已发货'
			}

			templist.push({
				_id:o._id,
				mobile:o.mobile,
				scoreGuid:o.scoreGuid,
				scoreDetail:o.scoreDetail,
				scoreCode1:o.scoreCode1,
				status:status,
				scoreWay:o.scoreWay,
				writeTime:moment(o.writeTime).format('YYYY-MM-DD hh:mm:ss')
			})
			if(o.scoreWay == 'exchange' && ids_shop.indexOf(o.scoreCode1) == -1){
				ids_shop.push(o.scoreCode1)
			}
			if(o.scoreWay == 'sale' && ids_sale.indexOf(o.scoreCode1) == -1){
				ids_sale.push(o.scoreCode1)
			}
		})
		//console.log(ids_sale)
		
		prizeModel.getByIds(ids_shop,function(err,list_prize){
			if(err) return cb(err);
			saleModel.getByIds(ids_sale,function(err,list_sale){
				if(err) return cb(err);
				var len_prize = list_prize.length;
				var len_sale = list_sale.length;

				var temp2list = [];

				templist.forEach(function(tempo,j){
					if(tempo.scoreWay == 'exchange'){//兑换
						tempo.scoreWayName = '兑换';
						for(var i=0;i<len_prize;i++){
							if(list_prize[i]._id == tempo.scoreCode1){
								tempo.shopname = list_prize[i].name;
								tempo.imgurl = list_prize[i].imgUrl;
								temp2list.push(tempo);
								return;
							}
						}
					}
					else if(tempo.scoreWay == 'sale'){//拍卖
						tempo.scoreWayName = '拍卖';
						for(var i=0;i<len_sale;i++){
							if(list_sale[i]._id == tempo.scoreCode1){
								tempo.shopname = list_sale[i].name;
								tempo.imgurl = list_sale[i].imgUrl;
								temp2list.push(tempo);
								return;
							}
						}
					}			
				})
				return cb(null,temp2list)
			})
		})
	})
}
	

module.exports = obj;