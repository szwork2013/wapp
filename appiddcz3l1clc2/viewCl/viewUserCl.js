var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var lotteryBl = require('../bl/wxLottery.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.binder = function(req,res){ //用户认证绑定页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId


	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户认证绑定页面失败')
		}

		res.render('userBinder.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})

	return;
}


obj.card = function(req,res){ //用户会员卡功能
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.binder infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'用户会员卡页面失败')
		}

		res.render('userCard.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}

/*

obj.day = function(req,res){ //会员每日打卡页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	scoreBl.getHistoryByUserIdAndRule(userId, 'dayRule', function(err, doclist){
		
		if(err){
			logger.error('obj.day getHistoryByUserIdAndRule error, userid %s, err %s', userId, err);
			return res.send(500,'签到页面加载失败')
		}

		res.render('userDayRule.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'dayRule':doclist
		})
		return;
	})
}
*/
/*
obj.shop = function(req,res){ //商店页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	shopBl.getPrizeList(appId, function(err, prizeList){
		if(err){
			logger.error('obj.shop shopBl.getPrizeList error, appId %s, err %s', appId, err);
			return res.send(500,'商品页面加载失败')
		}
		shopBl.getUserPrize(userId, function(err,recordList){
			if(err){
				logger.error('obj.shop shopBl.getUserPrize error, userId %s, err %s', userId, err);
				return res.send(500,'商品页面加载失败')
			}

			res.render('userShop.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'prizeList':prizeList,
				'recordList':recordList
			})
			return;
		})
	
	})

}
*/
/*
obj.lottery1 = function(req,res){ //抽奖1页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var ename = req.query.lotteryEname || '';//此次活动唯一标识 
	var ejsname =  req.query.ejsname || 'userLottery1.ejs';//此次活动制定模版

	if(!ename){
		return res.send(500,'缺少参数抽奖ename')
	}

	lotteryBl.getLotteryByEname(ename,function(err, doc1){ //根据ename查_id
		
		if(err){
			logger.error('obj.lottery1 lotteryBl.getLotteryByEname error, ename %s, err %s', ename, err);
			return res.send(500,'抽奖页面加载失败1')
		}
		if(!doc1 || doc1.length == 0){
			return res.send(404,'未找到抽奖页面')
		}

		lotteryBl.getLotteryAndPrize(doc1._id, function(err,doc2){ //查询抽奖内容和奖品内容
			if(err){
				logger.error('obj.lottery1 lotteryBl.getLotteryAndPrize error, doc1._id %s, err %s', doc1._id, err);
				return res.send(500,'抽奖页面加载失败2')
			}

			lotteryBl.getUserLotteryRecById(userId, doc1._id, null, null, function(err,list){
				if(err){
					logger.error('obj.lottery1 lotteryBl.getUserLotteryRecById error, userId %s, err %s', userId, err);
					return res.send(500,'抽奖页面加载失败3')
				}

				res.render(ejsname, {
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'list':list,
					'lottery':doc2.lottery,
					'prize':doc2.prize
				})
				return;

			})


		})

	})

}
*/

module.exports = obj;