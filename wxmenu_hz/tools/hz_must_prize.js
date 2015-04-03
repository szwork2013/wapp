var obj = {}
var lotteryBl = require('../bl/wxLottery.js');
//必须中奖的列表
obj.prizeRuleList = []


obj.checkPrize = function(mobile, prizeList){
	//根据用户的手机号和奖品列表循环，然后判断这个手机号，在这个时间点，会不会中奖
	//如果中奖，那么返回奖品的id，如果没中奖，返回false
	//匹配规则，奖品的ename、手机号、时间
	return false
}

obj.sendSms = function(userObj, prizeId, ywy_mobile){
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

		//获取到用户的名字，手机，奖品名字，业务员手机
		//然后就可以进行发送手机短信的流程了


		return
	})
}

module.exports = obj;