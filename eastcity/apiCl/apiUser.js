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
	if(!qobj.appUserName || qobj.appUserName.length>20){
		return res.send({error:1,data:'真实姓名格式有误'}) 
	}

	if(!/^1[0-9][0-9]\d{4,8}$/.test(qobj.appUserMobile)){
		return res.send({error:1,data:'手机号格式有误'}) 
	}
	if(qobj.appUserSex != 1 && qobj.appUserSex != 0){
		return res.send({error:1,data:'性别格式有误'}) 
	}
	if(!qobj.appUserBirth){
		return res.send({error:1,data:'生日格式有误'}) 
	}


	userBl.binder(qobj, appId, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	var userId = req.wxuobj._id;
		var openId = req.wxuobj.openId;
		var appId = global.wxAppObj._id;
     	var rule = 'registRule'

     	scoreBl.scoreRule(appId, userId, openId, {'mobile':req.wxuobj.appUserMobile}, rule, function(err,doc){
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
	//var pwd = ''
	//if(req.body.appLoginPassword){ //如果有密码，则md5加密后保存
	//	pwd = utils.md5(req.body.appLoginPassword+pwdSalt);
	//}



	var qobj = {
		//必填项
		appUserName:req.body.appUserName,
		appUserSex:req.body.appUserSex,
		appUserBirth:req.body.appUserBirth,
		
		appUserCommunity:req.body.appUserCommunity,
		appUserBuilding:req.body.appUserBuilding,
		appUserRoom:req.body.appUserRoom,

		//不填项
		appUserCity:req.body.appUserCity || '',

	}


	if(qobj.appUserName && qobj.appUserName.length>20){
		return res.send({error:1,data:'真实姓名格式有误'}) 
	}

	if(qobj.appUserSex && qobj.appUserSex != 1 && qobj.appUserSex != 0){
		return res.send({error:1,data:'性别格式有误'}) 
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
	var page = req.body.page || 1;
	
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
	var page = req.body.page || 1;
	
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


obj.scoreRank = function(req,res){ //积分排行
	userBl.scoreRank(function(err,doclist){
		if(err) return res.json({'error':1,'data':err})
		res.json({'error':0,'data':doclist})
	})
}


obj.recommend = function(req,res){ //推荐人
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;
	var mobile = req.body.mobile; //获得被推荐人手机号

	if(!/^1[0-9][0-9]\d{4,8}$/.test(mobile)){
		return res.send({error:1,data:'手机号格式有误'}) 
	}

	userBl.recommend(appId, userId, mobile, function(err,doc){
		if(err) return res.json({'error':1,'data':err})
		res.json({'error':0,'data':doc})
	})
}


module.exports = obj;