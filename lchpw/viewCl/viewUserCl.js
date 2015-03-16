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
		obj.cover_v2(req,res);
		return;
	}
	if(req.is_v2){
		res.render('user_regist_v2.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
		})
	}
	else{
		res.render('user_regist.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
		})
	}

}


obj.modify = function(req,res){ //用户修改资料
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId

	req.wxBinder.appCardNumber = userBl.genCardNumber(req.wxBinder.appCardNumber)
	//console.log(req.wxBinder)

	if(req.is_v2){
		res.render('user_modify_v2.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
		})
	}
	else{
		res.render('user_modify.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
		})
	}

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

		userBl.getJieDaiUsers(function(err, jieDaiList){
				console.log(jieDaiList)
				console.log(list)
				if(req.is_v2){
					res.render('recrecord_list_v2.ejs',{
						'userObj':req.wxuobj,
						'binderObj':req.wxBinder,
						'list':list,
						'count':list.length,
						'jieDaiList':jieDaiList
					})
				}
				else{
					res.render('recrecord_list.ejs',{
						'userObj':req.wxuobj,
						'binderObj':req.wxBinder,
						'list':list,
						'count':list.length,
						'jieDaiList':jieDaiList
					})
				}
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

	//如果是不是认证用户
	if(req.wxBinder.appUserType < 1){
		obj.regist(req,res);
		return;
	}

	userBl.getJieDaiUsers(function(err, jieDaiList){
			if(err){
				return res.send(500,'结佣记录加载失败')
			}
			if(req.is_v2){
			res.render('user_recommend_v2.ejs',{
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'jieDaiList':jieDaiList
				})
			}
			else{
				res.render('user_recommend.ejs',{
					'userObj':req.wxuobj,
					'binderObj':req.wxBinder,
					'jieDaiList':jieDaiList
				})	
			}
	})

	
}



//入口地址
obj.enter_v2 = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	//根据用户类型跳转到不同的地址
	if(req.wxBinder.appUserType > 0){
		res.redirect('/view/user/index_login_v2?wxuserid='+userId)
	}
	else{
		res.redirect('/view/user/cover_v2?wxuserid='+userId)
	}
	
}

//封面页
obj.cover_v2 = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	
	res.render('cover_v2.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


//未登录主页
obj.index_nologin_v2 = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	
	//如果是已经认证用户
	if(req.wxBinder.appUserType >= 1){
		obj.index_login_v2(req,res);
		return;
	}
	
	res.render('index_nologin_v2.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
	})

}


//登录主页
obj.index_login_v2 = function(req,res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	
	userBl.getRecrecordByUserId(appId, userId, {}, function(err,list){
		if(err){
			return res.send(500,'个人主页加载失败')
		}

		res.render('index_login_v2.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list,
			'count':list.length
		})

	})
}


//我的经纪人
obj.myagent = function(req, res){
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	userBl.getMyAgents(userId, function(err, list){
		if(err){
			return res.send(500,'我的经纪人加载失败')
		}
		res.render('myagent_list.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list,
			'count':list.length
		})
	})

}




module.exports = obj;