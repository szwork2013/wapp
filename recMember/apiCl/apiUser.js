var userBl = require('../bl/wxUser.js');

var utils = require('../lib/utils.js');
var obj = {}
var pwdSalt = 'wappwapp'

obj.binder = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;


	var qobj = {
		//必填项
		openId:openId,

		appUserName:req.body.appUserName,
		appUserSex:req.body.appUserSex || 1,
		appUserBirth:req.body.appUserBirth || '1970-01-01',
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
		return res.send({error:1,data:'手机号输入有误'}) 
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
		//appUserBirth:req.body.appUserBirth,
		
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


obj.recommend = function(req,res){ //推荐人
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	var recTel = req.body.recTel;
	var recName = req.body.recName;
	var recSex = req.body.recSex || 1;

	var recRoom = req.body.recRoom;
	var recArea = req.body.recArea;

	var recPrice = req.body.recPrice || 0;
	
	if(req.wxBinder.appUserType < 1){
		res.send({error:1,data:'认证会员才能推荐朋友'})
		return;
	}

	if(!/^1[0-9][0-9]\d{4,8}$/.test(recTel)){
		return res.send({error:1,data:'手机号格式有误'}) 
	}

	userBl.recommend(appId, userId, {
		recName:recName,
		recSex:recSex,
		recTel:recTel,
		recArea:recArea,
		recPrice:recPrice,
		recRoom:recRoom,
	}, function(err,doc){
		if(err) return res.json({'error':1,'data':err})
		res.json({'error':0,'data':doc})
	})
}


obj.createtransac = function(req,res){ //申请结佣
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;

	var recRecordsId = req.body.recRecordsId;


	if(!recRecordsId || recRecordsId.length != 24){
		return res.json({'error':1,'data':'推荐记录id有误'})
	}

	userBl.createTransac(appId, userId, recRecordsId, function(err,doc){
		if(err) return res.json({'error':1,'data':err})
		res.json({'error':0,'data':doc})
	})
}

//获得此用户的推荐状态更新
obj.getrecnews = function(req,res){ 
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;
	var lastActiveTime = req.wxBinder.lastActiveTime;

	userBl.getRecNews(appId, userId, lastActiveTime,function(err,recdoc){
		if(err) return res.json({'error':1,'data':err});
		res.json({'error':0,'data':recdoc})
	})

}

obj.getMoney = function(req,res){
	var userId = req.wxuobj._id;

	userBl.getMoneyCode(userId,, function(err,recdoc){
		if(err) return res.json({'error':1,'data':err});
		res.json({'error':0,'data':recdoc})
	})

}



module.exports = obj;