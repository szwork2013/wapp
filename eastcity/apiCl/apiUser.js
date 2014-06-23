var userBl = require('../bl/wxUser.js');

var utils = require('../lib/utils.js');
var scoreBl = require('../bl/wxScoreSys.js')
var obj = {}
var pwdSalt = 'wappwapp'

obj.binder = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	//console.log(req.wxBinder)
	//var pwd = ''
	//if(req.body.appLoginPassword){ //如果有密码，则md5加密后保存
	//	pwd = utils.md5(req.body.appLoginPassword+pwdSalt);
	//}

	var qobj = {
		//必填项
		openId:openId,

		appUserName:req.body.appUserName,
		appUserSex:req.body.appUserSex,
		appUserBirth:req.body.appUserBirth,
		appUserMobile:req.body.appUserMobile,
		//选填项
		
		appUserCommunity:req.body.appUserCommunity || '',
		appUserBuilding:req.body.appUserBuilding || '',
		appUserRoom:req.body.appUserRoom || '',
		//不填项
		appUserCity:req.body.appUserCity || '',

	}



	userBl.binder(qobj, appId, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	var userId = req.wxuobj._id;
		var openId = req.wxuobj.openId;
		var appId = global.wxAppObj._id;
     	var rule = 'registRule'

     	scoreBl.scoreRule(appId, userId, openId, {}, rule, function(err,doc){
			if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	res.send({error:0,data:''});
		})

     	res.send({error:0,data:doc});		
	})
}




obj.modify = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	if(req.wxBinder.appUserType == 0){
		 return res.send({error:1,data:'未注册会员不能修改'})  
	}

	//console.log(req.wxBinder)
	var pwd = ''
	if(req.body.appLoginPassword){ //如果有密码，则md5加密后保存
		pwd = utils.md5(req.body.appLoginPassword+pwdSalt);
	}


	var qobj = {
		//必填项
		appUserName:req.body.appUserName,
		appUserSex:req.body.appUserSex,
		appUserBirth:req.body.appUserBirth,
		appUserMobile:req.body.appUserMobile,
		
		appUserCommunity:req.body.appUserCommunity,
		appUserBuilding:req.body.appUserBuilding,
		appUserRoom:req.body.appUserRoom,

		//不填项
		appUserCity:req.body.appUserCity || '',

	}

	userBl.modify(userId, openId, qobj, function(err,doc){ //修改用户资料
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}




obj.mycomment = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;
	var page = req.body.appUserName || 1;
	
	userBl.commentAndFavor(userId, 1, page, null, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}


obj.myfavor = function(req,res){ //用户认证绑定

	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;
	var page = req.body.appUserName || 1;
	
	userBl.commentAndFavor(userId, 2, page, null, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}



obj.activeback = function(req,res){ //金数据返回接口
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	//to do
}




module.exports = obj;