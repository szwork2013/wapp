var obj = {}
var request = require('request');
var util = require('util')
var lotteryBl = require('../bl/wxLottery.js');
var lotteryRecModel = require('../dl/lotteryRecordModel.js'); //加载抽奖记录模型
var lotteryPrizeModel = require('../dl/lotteryPrizeModel.js');


var guidModel = require('../dl/guidModel.js'); //guid 模型
var userBl = require('../bl/wxUser.js'); //加载用户Bl

var moment = require('moment')

//十年客户
var memberTenYear = require('./tenyear.json')
var memberTenYearLen = memberTenYear.length 
//金牌客户
var memberGold = require('./gold.json')
var memberGoldLen = memberGold.length 
//银牌客户
var memberSilver = require('./silver.json')
var memberSilverLen = memberSilver.length 

//必须中奖的列表
obj.prizeRuleList = []
obj.rulesList = [
	{//开发测试用
		'dateStart':moment("20150401", "YYYYMMDD"),
		'dateEnd':moment("20150430", "YYYYMMDD"),
		'phoneTime':[7,13,18,21],
		'phoneAll':3,
		'phoneTen':1,
		'magic':100,
	},
	{
		'dateStart':moment("20150501", "YYYYMMDD"),
		'dateEnd':moment("20150515", "YYYYMMDD"),
		'phoneTime':[8,13,18,21],
		'phoneAll':3,
		'phoneTen':1,
		'magic':5000,
	},
	{
		'dateStart':moment("20150516", "YYYYMMDD"),
		'dateEnd':moment("20150615", "YYYYMMDD"),
		'phoneTime':[9,14,20],
		'phoneAll':2,
		'phoneTen':1,
		'magic':3000,
	},
	{
		'dateStart':moment("20150616", "YYYYMMDD"),
		'dateEnd':moment("20150630", "YYYYMMDD"),
		'phoneTime':[13,20],
		'phoneAll':1,
		'phoneTen':1,
		'magic':1000,
	},
]

obj.getMobileType = function(mobile){
	for(var i=0;i<memberTenYearLen;i++){
		if(mobile == memberTenYear[i]){
			return 'tenyear'
		}
	}
	for(var i=0;i<memberGoldLen;i++){
		if(mobile == memberGold[i]){
			return 'gold'
		}
	}
	for(var i=0;i<memberSilverLen;i++){
		if(mobile == memberSilver[i]){
			return 'silver'
		}
	}
	return 'other'
}


obj.getNowRule = function(){

	var nowMoment = moment()
	var ruleObj = false
	for(var i=0;i<obj.rulesList.length;i++){
		if(nowMoment>=obj.rulesList[i].dateStart && nowMoment>=obj.rulesList[i]<=obj.rulesList[i].dateEnd){
			ruleObj = obj.rulesList[i]
			break;
		}
	}

	return ruleObj

}

//获取当天魔豆和手机的获取数量
obj.getCurDayPrizeCount = function(prizeList, cb){
	var phoneId = ''
	var magicId = ''
	prizeList.forEach(function(item){
		if(item.desc == 'phone'){
			phoneId = item._id
			obj.phoneId = phoneId
		}
		if(item.desc == 'magic'){
			magicId = item._id
			obj.magicId = magicId
		}
	})

	if(!phoneId || !magicId){
		logger.error('hz_must_prize.js obj.getCurDayPrizeCount no prizelist, prizelist: %s', prizeList);
		cb('未找到奖品')
		return
	}

	var todayZero = moment().hour(0).minute(0).second(0)
	var returnObj = {}
	lotteryRecModel.countAll({
		'prizeId':magicId,
		'writeTime':{'$gte':todayZero}
	}, function(err, countMagic){
		if(err) return cb(err)
		returnObj.magic = countMagic

		lotteryRecModel.countAll({
			'prizeId':phoneId,
			'writeTime':{'$gte':todayZero}
		}, function(err, countPhone){
			if(err) return cb(err)
			returnObj.phone = countPhone

			cb(null, returnObj)

		})//end lotteryRecModel.countAll

	})//end lotteryRecModel.countAll


}


obj.checkIfgetPrize = function(){

	var userRate = (Math.random()*100).toFixed(2) - 0; //用户抽出的随机数
	if(userRate < 0.5){
		return 'phone'
	}
	if(userRate < 5){
		return 'magic'
	}

	return 'nothing'
}

//最后校验
obj.reCheck = function(prizeId, recordDoc, maxCount, cb){
	var todayZero = moment().hour(0).minute(0).second(0)

	lotteryRecModel.countAll({
		'prizeId':prizeId,
		'writeTime':{'$lte':todayZero}
	}, function(err, count){
		if(err) return cb(err)

		//如果检测出异常，则回滚之前的中奖纪录
		if(count > maxCount){
			logger.error('recheck error,max count error, rollback');
			var recordId = recordDoc._id
			lotteryRecModel.createOneOrUpdate({
				'_id':recordId
			}, {
				'prizeId':0
			}, function(err, doc){
				if(err) return cb(err)
				return cb(null, {
					prizeId:0
				})
			})
		}
		else{//检查没有异常
			//增加奖品被抽中次数
			lotteryPrizeModel.createOneOrUpdate({
				'_id':prizeId
			}, {
				$inc:{countNum:1},
			}, function(err, prizeDoc){
				 cb(null, {
					prizeId:prizeDoc._id.toString(),
					name:prizeDoc.name,
					ename:prizeDoc.desc,
					imgUrl:prizeDoc.imgUrl,
				})

				//只有抽中手机才发短信告知业务员
				if(prizeDoc.desc == 'phone'){
					obj.sendSmsPrize(recordDoc.userId, prizeDoc._id.toString())
				}
				return
			})
			return
		}

	})//end lotteryRecModel.countAll
}

//肯定不中奖处理
obj.prizeDeal = function(logData, prizeId, cb){


	guidModel.getGuid(function(err,guid){
		if(err) return cb(err); //如果出错
		if(!guid) return cb('获取兑奖码失败');

		userBl.getUserByUserId(logData.userId, function(err, userObj){
				if(err) return cb(err); //如果出错
				var uobj = userObj.uobj

				//记录流水未中奖
				lotteryRecModel.insertOneByObj({
					'lotteryId':logData.lotteryId,
					'prizeId':prizeId,
					'userId':logData.userId,
					'truename':uobj.appUserName,
					'mobile':uobj.appUserMobile,
					'recordIp':logData.recordIp,
					'giftId':guid,
					'code2':logData.userType,
					'writeTime':new Date()
				},function(err, recordDoc){
					if(err) return cb(err); //如果出错
					if(prizeId == 0){
						cb(null, {
							prizeId:0
						})
						return
					}
					else{
						var maxCount = logData.maxCount
						//如果中奖，则再去检查
						obj.reCheck(prizeId, recordDoc, maxCount, cb)
						return 
					}

				})//end lotteryRecModel.insertOneByObj

		})//end userBl.getUserByUserId

	})//end guidModel.getGuid
}



obj.checkPrize = function(mobile, prizeList, logData, cb){
	//根据用户的手机号和奖品列表循环，然后判断这个手机号，在这个时间点，会不会中奖
	//如果中奖，那么返回奖品的id，如果没中奖，返回false
	//匹配规则，奖品的ename、手机号、时间

	var userType = obj.getMobileType(mobile)
	console.log(userType)

	var nowRule = obj.getNowRule()
	logData.userType = userType

	//如果没有找到规则，直接报错
	if(!nowRule){
		cb('活动抽奖无效')
		return
	}

	var userGetPrize = obj.checkIfgetPrize()
	//var userGetPrize = 'phone';
	
	if(userGetPrize === 'nothing'){
		obj.prizeDeal(logData, 0, cb)
		return
	}


	obj.getCurDayPrizeCount(prizeList, function(err, countObj){
		if(err) return cb(err)

		//如果用户抽中魔豆
		if(userGetPrize === 'magic'){
			console.log(countObj, nowRule)
			//如果魔豆已经超过限额
			if(countObj.magic >= nowRule.magic){
				//用户未中奖
				obj.prizeDeal(logData, 0, cb)
				return
			}
			else{
				logData.maxCount = nowRule.magic
				//进入中奖流程
				obj.prizeDeal(logData, obj.magicId, cb)
				return 
			}
		}//end 魔豆中奖流程

		if(userGetPrize === 'phone'){

			//先判断下一个中间手机的时间有没有到来
			var nextHour = nowRule.phoneTime[countObj.phone] || 0
			if(nextPrizeTime == 0){
				logger.error('today sail more than one, fuck');
			}
			var nextPrizeTime = moment().hour(nextHour).minute(10).second(10)
			if(moment() <= nextPrizeTime){
				//下一个中手机时间没到，所以没中奖
				logger.error('next phone get prize time not arrival');
				obj.prizeDeal(logData, 0, cb)
				return 
			}


			//如果用户是other的，则手机不可能中奖
			if(userType == 'other'){
				logger.error('other user can not prize mobile');
				obj.prizeDeal(logData, 0, cb)
				return
			}
			//如果手机已经超过限额
			if(countObj.phone >= (nowRule.phoneAll+nowRule.phoneTen)){
				logger.error('all of today phone is empty');
				obj.prizeDeal(logData, 0, cb)
				return
			}

			//如果是10年用户
			if(userType == 'tenyear'){
				logger.error('ten year user prize phone');	
				logData.maxCount = (nowRule.phoneAll+nowRule.phoneTen)
				obj.prizeDeal(logData, obj.phoneId, cb)
				return
			}
			if(userType != 'tenyear'){

				//如果非10年用户名额已经用完
				if(countObj.phone >= nowRule.phoneAll){
					logger.error('not ten year user, no prize, no phone');
					obj.prizeDeal(logData, 0, cb)
					return 
				}
				else{
					logger.error('not ten year user, prize phone');
					logData.maxCount = nowRule.phoneAll
					obj.prizeDeal(logData, obj.phoneId, cb)
					return 
				}

			}//end if(userType != 'tenyear')

		}//end phone 中奖流程


		obj.prizeDeal(logData, 0, cb)
		return 

	})//end obj.getCurDayPrizeCount

	return false
}









/*
错误吗说明
30：密码错误
40：账号不存在
41：余额不足
42：帐号过期
43：IP地址限制
50：内容含有敏感词
51：手机号码不正确
*/
obj.sendSmsPrize = function(userId, prizeId){


	userBl.getUserByUserId(userId, function(err, userDoc){
		if(err) return
		if(!userDoc) return	
		var ywyUserId = userDoc.uobj.appUserCode
		var appUserName = userDoc.uobj.appUserName

		userBl.getUserByUserId(ywyUserId, function(err, ywyDoc){
				if(err) return
				if(!ywyDoc){
					//没找到业务员记录错误日志
					logger.error('hz_must_prize.js obj.sendSmsPrize  error, ywyDoc not found, userid: %s', userId);
					return
				}
				var ywy_mobile = ywyDoc.uobj.appUserMobile

				lotteryBl.getPrizeById(prizeId, function(err, prizeObj){
					if(err){
						logger.error('hz_must_prize.js uobj.sendSms error, err: %s', err);
						return
					}
					if(!prizeObj){
						logger.error('hz_must_prize.js uobj.sendSms not found prizeObj, err: %s, prizeId: %s',
							err, prizeId);
						return
					}
					var smsContent = util.format('尊敬的业务员，您的客户%s抽中奖品%s',appUserName, prizeObj.name)
					
					obj.sendSms(ywy_mobile, smsContent, function(){})
					return
				})
		})//end userBl.getUserByUserId

	})//end userBl.getUserByUserId
}


obj.sendSms = function(mobile, content, cb){
	
	//获取到用户的名字，手机，奖品名字，业务员手机
	//然后就可以进行发送手机短信的流程了
	var smsPwd = 'CE3F35A459E5C9ADCEB3B6AFCE5AB7A2'
	var smsUser = 'snoopyxdy'
	
	var smsContent = encodeURIComponent(content)
	var smsReqUrl = util.format('http://api.smsbao.com/sms?u=%s&p=%s&m=%s&c=%s',
		smsUser,smsPwd,mobile,smsContent)

	request(smsReqUrl, function (error, response, body) {
		  if (error || response.statusCode != 200) {
		  	logger.error('hz_must_prize.js uobj.sendSms response err, err: %s, body: %s',
			error, body);
			return cb('error')
		  }
		  if(body == '0'){
		  	 logger.info('hz_must_prize.js uobj.sendSms success')
		  	 return cb(null, 'ok')
		  }
		  else{
		  	logger.error('hz_must_prize.js uobj.sendSms send fail body: %s',body);
		  	return cb(body)
		  }
	})


}


module.exports = obj;