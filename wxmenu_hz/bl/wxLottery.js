var moment = require('moment');
var userBl = require('./wxUser.js'); //加载用户Bl
var guidModel = require('../dl/guidModel.js'); //guid 模型
var utils = require('../lib/utils.js');
var lotteryModel = require('../dl/lotteryModel.js'); //加载抽奖模型
var lotteryPrizeModel = require('../dl/lotteryPrizeModel.js'); //加载奖品
var lotteryRecModel = require('../dl/lotteryRecordModel.js'); //加载抽奖记录模型

var obj = {}

//根据英文短名获取抽奖信息
obj.getLotteryByEname = function(lotteryEname,cb){
	if(!lotteryEname) return cb('no lotteryEname');
	lotteryModel.findOneByObj({
		ename:lotteryEname,
		isShow:1,
	},function(err,doc){
		cb(err,doc)
	})
}

obj.getPrizeById = function(prizeid,cb){
	if(!prizeid) return cb('no prizeid');
	lotteryPrizeModel.findOneByObj({
		_id:prizeid
	},function(err,prizeObj){
		if(err){
			return cb(err)
		}
		return cb(null,prizeObj)
	})

}

//根据用户Id查找他的抽奖记录
obj.getUserLotteryRec = function(uid,skip,pagesize,cb){ 
	var cb = cb || function(){}
	var skip = skip || 0;
	var pagesize = pagesize || 50; 

	if(!uid) return cb('no uid');

	lotteryRecModel.findAll({
		userId:uid
	},skip, pagesize, function(err,list){
		if(err){
			return cb(err)
		}
		obj.getPrizeInfoByRecordList(list,function(err,list2){
			return cb(err, list2)
		})

	})
}


obj.getPrizeInfoByRecordList = function(list,cb){

		if(list.length == 0){
			return cb(null, list);
		}
		var tempList = [];

		//如果用户获奖则去查找奖品的详细信息
		var prizeIds = []
		list.forEach(function(ro){

			if(ro.prizeId != '0'){
				prizeIds.push(ro.prizeId);
			}
			tempList.push({
				 _id: ro._id,
 				lotteryId: ro.lotteryId,
 				userId: ro.userId,
 				truename: ro.truename,
 				mobile: ro.mobile,
				writeTime: ro.writeTime,
 				code4: ro.code4,
 				code3: ro.code3,
 				code2: ro.code2,
 				code1: ro.code1,
 				isForward: ro.isForward,
 				giftId: ro.giftId,
 				prizeId: ro.prizeId
			})

		})

		//如果这个用户没有中奖，则直接返回
		if(prizeIds.length == 0){
			return cb(null, list);
		}

		//根据ids去找奖品的详细信息
		lotteryPrizeModel.getPrizeByIds(prizeIds,function(err, prizeList){
			if(err){
				return cb(err)
			}
							
			tempList.forEach(function(ro){
				if(ro.prizeId == '0') return;
				prizeList.forEach(function(po){
					//如果匹配，则赋值
					if(ro.prizeId == po._id+''){

						ro.prizeObj = po;
						return;
					}
				})
			})
			//返回列表

			return cb(null, tempList);

		})

}



//根据用户Id和抽奖Id查找他的抽奖记录
obj.getUserLotteryRecById = function(uid, lotteryId, skip, pagesize, cb){ 
	var cb = cb || function(){};
	var skip = skip || 0;
	var pagesize = pagesize || 50; 

	if(!uid) return cb('no uid');

	lotteryRecModel.findAll({
		userId:uid,
		lotteryId:lotteryId
	}, skip, pagesize, function(err,list){
		if(err){
			return cb(err)
		}
		obj.getPrizeInfoByRecordList(list,function(err,list2){
			return cb(err, list2)
		})
	})
}


obj.getLotteryAndPrize = function(lotteryId,cb){
	var cb = cb || function(){}
	if(!lotteryId) return cb('no lotteryId');
	lotteryModel.findByObj({//获得抽奖活动的对象
		_id:lotteryId,
		isShow:1
	},function(err,loList){
		if(err){
			return cb(err)
		}
		if(!loList || !loList[0]){ //没有找到抽奖活动
			return cb('没有找到活动')
		}
		var lotteryObj = loList[0];
		lotteryPrizeModel.findByObj({//获得奖品列表
			lotteryId:lotteryId,
			isShow:1
		},function(err,prList){
			if(err){
				return cb(err)
			}
			if(!prList || !prList.length == 0){ //没有找到奖品
				return cb('没有找到奖品')
			}
			cb(null,{				//返回抽奖的信息和奖品的列表
				lottery:lotteryObj,
				prize:prList
			})
		})
	})
}





obj.startLottery = function(userId, lotteryId, recordIp, isForward, cb){ //用户进入抽奖页面点击抽奖程序
	var cb = cb || function(){}
	if(!userId) return cb('no userId');
	if(!lotteryId) return cb('no lotteryId');
	var recordIp = recordIp || '127.0.0.1';
	var isForward = isForward ? 1:0;

	lotteryModel.findByObj({//获得抽奖活动的对象
		_id:lotteryId,
		isShow:1
	},function(err,loList){
		if(err){
			return cb(err)
		}
		if(!loList || !loList[0]){ //没有找到抽奖活动
			return cb('没有找到活动')
		}
		var lotteryObj = loList[0];
		var now = Date.now();
		var s = Date.parse(lotteryObj.startTime)
		var e = Date.parse(lotteryObj.endTime)
		if(s > now){//判断活动是否开始或者已经结束
			return cb('活动还没开始')
		}
		if(e < now){
			return cb('活动已经结束')
		}
		if(lotteryObj.forwardTimes > 0){
			var limit = lotteryObj.intervalTimes + lotteryObj.forwardTimes;
		}
		else{
			var limit = lotteryObj.intervalTimes;
		}
		
		var interval = lotteryObj.interval*60*60*1000; //将小时转换成毫秒
		var isDay = false;
		if(lotteryObj.interval >= 24){ 
		//当后台设置时间间隔大于等于24小时，则表示按自然天来计算
			isDay = true;
		}

		//判断是否有forward
		//如果传递了额外抽奖，并且本活动没有开启额外抽奖，则报错
		if(isForward && lotteryObj.forwardTimes <= 0){
			return cb('本活动无法增加抽奖次数')
		}

		

		lotteryRecModel.findAll({//查找记录
			userId:userId,
			lotteryId:lotteryId
		},0,limit,function(err,recList){
			if(err){
				return cb(err)
			}

			var checkIsMax = function(){
				var pos = limit - 1;
				var olderRec = recList[pos];
				var olderTimestamp = Date.parse(olderRec.writeTime);

				//如果时间超过24小时，表示自然天间隔
				if(isDay){
					var olderMoment = moment(olderRec.writeTime).hour(0).minute(0).second(0);
					//将moment对象转换为unix时间戳
					olderTimestamp = olderMoment.unix()*1000;
				}	


				if(now - olderTimestamp <= interval){//如果在这个间隔时间段内，已经超过最多抽奖次数了
					return false
				}
				return true;
			}

			//如果设置了最大中奖次数
			if(lotteryObj.allowLotteryTimes > 0 && recList.length>0){
				var hasGetPrizeCount = 0;
				var hasGetPrizeForwardCount = 0;
				recList.forEach(function(o){
					if(o.prizeId != '0' && o.isForward == 0){
						hasGetPrizeCount++;
						return;
					}
					if(o.prizeId != '0' && o.isForward == 1){
						hasGetPrizeForwardCount++;
						return;
					}
				})
				//如果超过了最大的中奖次数
				if((!isForward && hasGetPrizeCount >= lotteryObj.allowLotteryTimes) || (isForward && hasGetPrizeForwardCount >= lotteryObj.allowLotteryTimes)){
					
					if(recList.length<limit){
						return obj._getPrize(userId, lotteryId, recordIp, isForward, true, cb);//进入抽奖程序
					}

					if(!checkIsMax()){
						return cb('参与次数过多')
					}
					return obj._getPrize(userId, lotteryId, recordIp, isForward, true, cb);//进入抽奖程序
				
				} 
			}

			if(recList.length == 0 || recList.length<limit){//用户没有抽过奖，或抽奖总数小于间隔抽奖数，则去抽奖
				return obj._getPrize(userId, lotteryId, recordIp, isForward, false, cb);//进入抽奖程序
			}
			else{//判断是否超过间隔的抽奖次数
				if(!checkIsMax()){
					return cb('参与次数过多')
				}
				return obj._getPrize(userId, lotteryId, recordIp, isForward, false, cb);//进入抽奖程序
			}

		})//end lotteryRecModel.findAll

	})//end lotteryModel.findByObj

}




obj._getPrize = function(userId, lotteryId, recordIp, isForward, mustNoPrize, cb){//用户进入抽奖程序

	if(mustNoPrize){
		return obj._completeLottery(userId, lotteryId, recordIp, 0, 0, isForward, cb);//表示没有抽到奖品
	}

	lotteryPrizeModel.findByObj({//获得奖品列表
			lotteryId:lotteryId,
			isShow:1
		},function(err,prList){
			if(err){
				return cb(err)
			}


			if(!prList || prList.length == 0){ //没有找到奖品，表示此次抽奖未中奖
				return obj._completeLottery(userId, lotteryId, recordIp, 0, 0, isForward, cb);//表示没有抽到奖品
			}
			prList = prList.filter(function(pobj){ //剔除奖品已经抽取完毕项
				var last = pobj.totalNumber - pobj.countNum
				return last > 0;  //将抽完的奖品从待抽奖数组中去掉
			})

			if(prList.length == 0){ //没有找到奖品，表示此次抽奖未中奖
				return obj._completeLottery(userId, lotteryId, recordIp, 0, 0, isForward, cb);//表示没有抽到奖品
			}

			var userRate = (Math.random()*100).toFixed(2); //用户抽出的随机数

			//console.log(userRate)

			var ratePrizeAry = [];
			var countPrizeAry = [];//记录奖品中是否含有计数抽奖的奖品，如果没有则概率没中可直接返回未中奖，提高效率

			prList.forEach(function(pobj){
				if(pobj.prizeLotteryType == 1 && pobj.rate >= userRate){ //如果是概率方式，并且中奖则将奖品放入数组中
					ratePrizeAry.push(pobj);
				}
				if(pobj.prizeLotteryType == 2){ //如果有奖品是计数抽奖的
					countPrizeAry.push(pobj)
				}
			})

			var prizeLen = ratePrizeAry.length
			if(prizeLen>0){
				var prizePos = ~~(Math.random()*prizeLen); //获得随机的一个中奖奖品
				var userPrizeId = ratePrizeAry[prizePos]._id;
				return obj._completeLottery(userId, lotteryId, recordIp, userPrizeId, 0, isForward, cb);//抽到奖品 userPrizeId
			}
			else if(countPrizeAry.length == 0){ //如果没有概率中奖，并且也没有计数抽奖的奖品，则表示用户没有中奖
				return obj._completeLottery(userId, lotteryId, recordIp, 0, 0, isForward, cb);//表示没有抽到奖品
			}

			//如果用户概率没有中奖，并且有奖品是计数中奖的，则进入计数抽奖流程

			lotteryRecModel.countAll({ //查找此 抽奖活动 的抽奖记录数
				lotteryId:lotteryId,
			},function(err,recCount){
				if(err){
					return cb(err)
				}
				recCount = recCount + 1; //表示本次抽奖计数

				var userCountPrizeId = 0; //中奖prizeid变量
				var prizePos = -1;

				countPrizeAry.forEach(function(cpobj,i){ //循环待抽奖数组
					//console.log(cpobj.priceNum, recCount)

					if(cpobj.priceNum == recCount){ //如果正好中奖
						userCountPrizeId = cpobj._id;
						prizePos = i
					}
				})

				if(userCountPrizeId == 0){ //如果计数抽奖也没中
					return obj._completeLottery(userId, lotteryId, recordIp, 0, 0, isForward, cb);//表示没有抽到奖品
				}

				
				var nextPriceNum = 0;
				var pos = 0;
				do{
					//生成被抽掉的奖品的下次抽奖次数
					nextPriceNum = countPrizeAry[prizePos].priceNum * 2 + ~~(Math.random()*(countPrizeAry[prizePos].priceNum/2));
					
					pos = -1;
					//循环匹配下次抽奖次数是否有重复
					for(var j=0;j<countPrizeAry.length;j++){
						if(countPrizeAry[j].priceNum == nextPriceNum){
							pos = j;
							break;
						}
					}				
				}
				while(pos != -1)

				return obj._completeLottery(userId, lotteryId, recordIp, userCountPrizeId, nextPriceNum, isForward, cb);//表示没有抽到奖品

			})// end lotteryRecModel.countAll



	})//end lotteryPrizeModel.findByObj

}


obj._completeLottery = function(userId, lotteryId, recordIp, prizeId, nextPriceNum, isForward, cb){//用户抽奖结束，更新记录和相关信息
	var prizeId = prizeId || 0;
	var nextPriceNum = nextPriceNum || 0;

	guidModel.getGuid(function(err,guid){
		if(err) return cb(err); //如果出错
		if(!guid) return cb('获取兑奖码失败');

		userBl.getUserByUserId(userId,function(err,udoc){//查找用户对象
			if(err) return cb(err);
			if(!udoc || !udoc.uobj) return cb('未找到用户');

			var userObj = udoc.uobj
			/*
			if(prizeId == 0){
				guid = 0;
			}
			*/

			lotteryRecModel.insertOneByObj({
				lotteryId:lotteryId,
				prizeId:prizeId,
				userId:userId,
				truename:userObj.appUserName,
				mobile:userObj.appUserMobile,
				recordIp:recordIp,
				giftId:guid,
				isForward:isForward?1:0,
			},function(err,recDoc){
				if(err) return cb(err); //如果出错
				if(!recDoc) return cb('抽奖记录生成失败');

				if(prizeId == 0){ //如果没有中奖，则返回控制器，不执行更新奖品集合代码
					cb(null,{
						prizeId:0
					})

					obj._checkWrongCountPrize(lotteryId); //运行检查奖品程序
					return;
				}

				//更新奖品集合，存入 nextPriceNum 和把 countNum 加1
				lotteryPrizeModel.createOneOrUpdate({
					_id:prizeId
				},{
					$inc:{countNum:1},
					priceNum:nextPriceNum
				},function(err,doc){ 
					if(err){
						logger.error('update prize error,prize id %s,err: %s', prizeId, err);
						return cb(err); //如果出错
					} 
					if(!doc) {
						logger.error('update prize error,prize id %s,err: %s, lottery record id is %s', prizeId, err, recDoc._id);
						return cb('更新奖品记录失败');
					}
					cb(null, {
						prizeId:prizeId,
						giftId:recDoc.giftId,
						recordId:recDoc._id
					});

					obj._checkWrongCountPrize(lotteryId);
					return;
				}) //end lotteryPrizeModel.createOneOrUpdate

			})//end lotteryRecModel.createOneOrUpdate

		})//end userBl.getUserByUserId
		
	})//end guidModel.getGuid

}

obj._checkWrongCountPrize = function(lotteryId){//检查是否有错误的计数抽奖的奖品，异步执行
	var prizeId = prizeId || 0;

	lotteryRecModel.countAll({ //查询所有抽奖的次数
		lotteryId:lotteryId,
	},function(err,recCount){
		if(err){
			logger.error('_checkWrongCountPrize lotteryRecModel.countAll error: %s', err);
			return;
		}

		lotteryPrizeModel.findByObj({//获得奖品列表,条件是次数抽奖，并且isshow
			lotteryId:lotteryId,
			prizeLotteryType:2,   
			isShow:1
		},function(err,plist){
			if(err){
				logger.error('_checkWrongCountPrize lotteryPrizeModel.findByObj error: %s', err);
				return;
			}

			plist = plist.filter(function(po){
				var last = po.totalNumber - po.countNum
				var priceNum = po.priceNum;
				if(last <= 0 || priceNum > recCount){ //将抽完的奖品和符合要求的奖品从数组中去掉
					return false;
				}
				return true;
			})
			if(plist.length == 0) return; //没有奖品可检查，return

			logger.error('_checkWrongCountPrize has error prize pricenum array is : %s', JSON.stringify(plist));

			var plist2 = [];

			plist.forEach(function(v){ //将prizeId和priceNum转存到plist2种
				plist2.push({
					_id:v._id,
					priceNum:v.priceNum
				});
			})

			var pos = 0 //初始化pos
			var errorCount = 0;
			do{ //循环检查并且更新奖品的priceNum
				errorCount++
				pos = -1;
				var len = plist2.length;
				for(var i=0;i<len;i++){
					plist2[i].priceNum = ~~(Math.random()*(plist2[i].priceNum/2)) + (plist2[i].priceNum + recCount);
				}

				for(var j=0;j<len;j++){
					var tempPrice = plist2[j].priceNum
					var tempId = plist2[j]._id
					for(var k=0;k<len;k++){
						if(tempId != plist2[k]._id && tempPrice == plist2[k].priceNum){
							pos = k;
							break;
						}
					}
				}
				if(errorCount>10){
					logger.error('_checkWrongCountPrize do while plist error max count, prize list is: %s', JSON.stringify(plist));
					return;
				}
			}
			while(pos != -1)
			//除错完毕，接下来写入数据库

			plist2.forEach(function(p2obj){ //循环写入数据库

				lotteryPrizeModel.createOneOrUpdate({
					_id:p2obj._id
				},{
					priceNum:p2obj.priceNum
				},function(err,doc){ 
					if(err){
						logger.error('_checkWrongCountPrize lotteryPrizeModel.createOneOrUpdate error prizeid is: %s, error is: %s', p2obj._id, err);
					}
				})//end lotteryPrizeModel.createOneOrUpdate

			})//end plist2.forEach

			logger.error('_checkWrongCountPrize success update error prize pricenum,plist is: %s', JSON.stringify(plist));

		})//end lotteryPrizeModel.findByObj

	})// end lotteryRecModel.countAll

}



obj.improveInfo = function(recordId, truename, mobile, cb){ //抽奖完成,完善姓名和手机
	var cb = cb || function(){}
	if(!recordId) return cb('no recordId');
	if(!truename) return cb('no truename');
	if(!mobile) return cb('no mobile');

	lotteryRecModel.findByObj({ //查找一下recordId是否存在
		_id:recordId
	},function(err,d){
		if(err){
			return cb(err)
		}
		if(!d || d.length == 0){ //如果不存在则报错
			return cb('没有找到记录')
		}
		lotteryRecModel.createOneOrUpdate({ //更新记录
			_id:recordId
		},{
			truename:truename,
			mobile:mobile
		},function(err,list){ //更新成功回调控制器
			if(err){
				return cb(err)
			}
			cb(null, list);
		})
	})

}


module.exports = obj;