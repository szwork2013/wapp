var userBl = require('../bl/wxUser.js');

var infoBl = require('../bl/wxInfo.js');

var utils = require('../lib/utils.js');
var moment = require('moment')
var obj = {}


obj.regist = function(req,res){ //用户注册
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId

	//如果是已经认证用户
	if(req.wxBinder.appUserType >= 1){
		obj.modify(req,res);
		return;
	}

	res.render('user_regist.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


obj.modify = function(req,res){ //用户修改资料
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId

	req.wxBinder.appCardNumber = userBl.genCardNumber(req.wxBinder.appCardNumber)
//console.log(req.wxBinder)
	res.render('user_modify.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


//我的推荐记录，工程进度
obj.recrecord = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	userBl.getRecrecordByUserId(appId, userId, {}, function(err,list){
		if(err){
			return res.send(500,'我的推荐记录加载失败')
		}

			res.render('recrecord_list.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'list':list,
				'count':list.length
			})
	})

}


//某条详细的结佣记录
obj.transacDetail = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var transacId = req.query.transacid;

	if(!transacId || transacId.length != 24){
		return res.send(500,'结佣id有误')
	}

	userBl.getTransacById(appId, userId, transacId, function(err,doc){
		if(err){
			return res.send(500,'结佣记录加载失败')
		}

		res.render('transac_detail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'obj':doc
		})
	})

}








//推荐用户录入页面
obj.recommend = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId

	//如果是已经认证用户
	if(req.wxBinder.appUserType < 1){
		obj.regist(req,res);
		return;
	}

	res.render('user_recommend.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})
}






module.exports = obj;