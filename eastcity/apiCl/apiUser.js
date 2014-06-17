var userBl = require('../bl/wxUser.js')
var utils = require('../lib/utils.js');
var obj = {}
var pwdSalt = 'wappwapp'

obj.binder = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	//console.log(req.wxBinder)
	var pwd = ''
	if(req.body.appLoginPassword){ //如果有密码，则md5加密后保存
		pwd = utils.md5(req.body.appLoginPassword+pwdSalt);
	}

	var qobj = {
		//必填项
		openId:openId,
		appLoginName:req.body.appLoginName,
		appUserName:req.body.appUserName,
		wxName:req.body.wxName,
		appUserSex:req.body.appUserSex,
		appUserBirth:req.body.appUserBirth,
		appUserMobile:req.body.appUserMobile,
		//选填项
		
		appUserCommunity:req.body.appUserCommunity || '',
		appUserBuilding:req.body.appUserBuilding || '',
		appUserRoom:req.body.appUserRoom || '',
		//不填项
		appUserCity:req.body.appUserCity || '',
		appLoginPassword:pwd,
		wxAvatar:req.body.wxAvatar || '',
		wxGroup:req.body.wxGroup || '',

	}



	userBl.binder(qobj, appId, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}




obj.modify = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	if(req.wxBinder.appUserType != 2){
		 return res.send({error:1,data:'未认证会员不能修改'})  
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
		wxName:req.body.wxName || '',
		appUserCity:req.body.appUserCity || '',
		appLoginPassword:pwd,
		wxAvatar:req.body.wxAvatar || '',
		wxGroup:req.body.wxGroup || '',

	}

	userBl.modify(userId, openId, qobj, function(err,doc){ //修改用户资料
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}


module.exports = obj;