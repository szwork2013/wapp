var userBl = require('../bl/wxUser.js');

var utils = require('../lib/utils.js');
var moment = require('moment')
var obj = {}


//ajax 接口
obj.modify = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var openId = req.wxBinder.openId;

	var qobj = {
		//必填项
		appUserName:req.body.appUserName,
		appUserMobile:req.body.appUserMobile,

	}


	if(!qobj.appUserName || qobj.appUserName.length>20){
		return res.send({error:1,data:'真实姓名格式有误'}) 
	}

	if(!qobj.appUserMobile || !/^[0-9]{11}$/.test(qobj.appUserMobile)){
		return res.send({error:1,data:'手机格式有误'}) 
	}

	userBl.modify(userId, openId, qobj, function(err,doc){ //修改用户资料
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});		
	})
}






module.exports = obj;