var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var lotteryBl = require('../bl/wxLottery.js');
var utils = require('../lib/utils.js');
var qrcodeDl = require('../dl/qrcodeLogModel.js');
var qrcodeBl = require('../bl/qrcode.js');

var guidDl = require('../dl/guidModel.js');
var moment = require('moment')
var obj = {}
var qrcodeAddScore = 10; //二维码增加积分

obj.regist = function(req,res){ //用户注册
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId

//console.log(req.wxBinder)
	res.render('user_regist.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


//修改资料
obj.modify = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	var cardStr = userBl.createCardNum(req.wxBinder.appCardNumber)
	var createTime = req.wxuobj.registTime

	res.render('user_modify.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'cardStr':cardStr,
		'createTime':createTime
	})
	
}

//修改资料2
obj.modify2 = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	var cardStr = userBl.createCardNum(req.wxBinder.appCardNumber)
	var createTime = req.wxuobj.registTime

	res.render('user_modify_2.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'cardStr':cardStr,
		'createTime':createTime
	})
	
}

//exchange临时
obj.exchange = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	var cardStr = userBl.createCardNum(req.wxBinder.appCardNumber)
	var createTime = req.wxuobj.registTime

	res.render('user_exchange.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'cardStr':cardStr,
		'createTime':createTime
	})
	
}


//exchange临时
obj.score = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	var cardStr = userBl.createCardNum(req.wxBinder.appCardNumber)
	var createTime = req.wxuobj.registTime

	res.render('user_score.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'cardStr':cardStr,
		'createTime':createTime
	})
	
}




//我的评论页面
obj.mycomment = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	userBl.countMyComment(appId,userId,1,function(err,count){
		res.render('user_comment.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'count':count
		})
	})

}

//我的收藏页面
obj.myfavor = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	userBl.countMyComment(appId,userId,2,function(err,count){
		res.render('my_favor.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'count':count
		})
	})
}

//我的订单
obj.myorder = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	shopBl.getMyOrder(appId, userId, function(err,list){
		if(err){
			logger.error('obj.myorder  error, userid %s, err %s', userId, err);
			return res.send(500,'我的订单加载失败')
		}

			res.render('my_order.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'list':list,
				'count':list.length
			})
	})

	
}



//推荐用户录入页面
obj.recommend = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	res.render('user_recommend.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
}

//积分规则
obj.scorerule = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	res.render('score_rule.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
}


//推荐用户录入页面
obj.scorelist = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	res.render('user_scorelist.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
}







obj.day = function(req,res){ //会员每日打卡页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	scoreBl.getHistoryByUserIdAndRule(userId, 'daysign', null, null, function(err, list){
		
		if(err){
			logger.error('obj.day  error, userid %s, err %s', userId, err);
			return res.send(500,'签到页面加载失败')
		}

		var todaySign = false;
		var todayZero = moment().hour(0).minute(0).second(0)
		if(list.length>0 && moment(list[0].writeTime) > todayZero){
			todaySign = true
		}
		//console.log(list)

		res.render('user_day.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			//'list':list,
			'date':moment().format('MM-DD'),
			'todaySign':todaySign
		})
		return;
	})
}



//我的积分页面
obj.myscore = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	userBl.getScoreList(appId, userId, function(err,list){
		if(err){
			logger.error('obj.myscore error, appId %s, err %s', appId, err);
			return res.send(500,'我的积分页面失败')
		}

		return res.json(list)

		res.render('user_score.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
	})
	
}


//有二维码生成按钮的页面
obj.myQrcode = function(req, res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId
	res.render('user_qrcode.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
		})
}

//二维码显示页面
obj.shareQrCode = function(req, res){

	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId


	guidDl.getGuid4(function(err, guid4){
		if(err) return res.send(500,'二维码页面加载失败');

		qrcodeDl.findOneByObj({'userId': userId},function(err, qrDoc){
			if(err) return res.send(500,'二维码页面加载失败');
			//如果没有找到文档
			if(!qrDoc){
				qrcodeBl.createTmpQRCode(guid4, function(err, qrImgUrl){
					if(err) return res.send(500,'二维码页面加载失败');
					var dbObj = {
						'userId':userId,
						'openId':openId,
						'type':1,
						'qrcodeGuid':guid4,
						'qrcodeUrl':qrImgUrl,
						'addScore':qrcodeAddScore,
						'createTimeStamp':Date.now()
					}
					qrcodeDl.insertOneByObj(dbObj, function(err){
						if(err) return res.send(500,'二维码页面加载失败');
						res.render('share_qrcode.ejs',{
								'userObj':req.wxuobj,
								'binderObj':req.wxBinder,
								'qrcode':dbObj
							})
					})

				})
				return
			}
			//如果有文档
			else{
				var now = Date.now()
				//如果5天内生成
				if(now - qrDoc.createTimeStamp <= 5*24*3600*1000){
					res.render('share_qrcode.ejs',{
								'userObj':req.wxuobj,
								'binderObj':req.wxBinder,
								'qrcode':qrDoc
							})
					return
				}
				//超过5天的，则要重新生成了
				//生成qrcode
				qrcodeBl.createTmpQRCode(guid4, function(err, qrImgUrl){
					if(err) return res.send(500,'二维码页面加载失败');
					var qObj = {
						'userId':userId,
					}
					var uObj = {
						'qrcodeGuid':guid4,
						'qrcodeUrl':qrImgUrl,
						'createTimeStamp':Date.now()
					}
					//更新记录
					qrcodeDl.createOneOrUpdate(qObj, uObj, function(err, newQrObj){
						if(err) return res.send(500,'二维码页面加载失败');
						res.render('share_qrcode.ejs',{
								'userObj':req.wxuobj,
								'binderObj':req.wxBinder,
								'qrcode':newQrObj
							})
					})//end qrcodeDl.insertOneByObj

				})//emd qrcodeBl.createTmpQRCode

			}//end else

		})//end qrcodeDl.findOneByObj

	})// guidDl.getGuid4

}


module.exports = obj;