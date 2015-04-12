var obj = {}
var request = require('request');
var util = require('util')
var lotteryBl = require('../bl/wxLottery.js');
//必须中奖的列表
obj.prizeRuleList = []


obj.checkPrize = function(mobile, prizeList){
	//根据用户的手机号和奖品列表循环，然后判断这个手机号，在这个时间点，会不会中奖
	//如果中奖，那么返回奖品的id，如果没中奖，返回false
	//匹配规则，奖品的ename、手机号、时间
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
		var smsPwd = 'CE3F35A459E5C9ADCEB3B6AFCE5AB7A2'
		var smsUser = 'snoopyxdy'
		var smsContent = util.format('尊敬的业务员，您的客户%s抽中奖品%s',userObj.appUserName, prizeObj.name)
		smsContent = encodeURIComponent(smsContent)
		var smsReqUrl = util.format('http://api.smsbao.com/sms?u=%s&p=%s&m=%s&c=%s',
			smsUser,smsPwd,ywy_mobile,smsContent)

		request(smsReqUrl, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	logger.error('hz_must_prize.js uobj.sendSms response err, err: %s, body: %s',
				err, body);
				return
			  }
			  if(body == '0'){
			  	 logger.info('hz_must_prize.js uobj.sendSms success')
			  	 return
			  }
			  else{
			  	logger.error('hz_must_prize.js uobj.sendSms send fail body: %s',body);
			  }

		})

		return
	})
}

module.exports = obj;