var userBl = require('../bl/wxUser.js');

var utils = require('../lib/utils.js');
var hzUserCodeTool = require('../tools/hz_user_code.js')
var apiSmsLog = require('../apiCl/apiSmsLog.js')
var moment = require('moment')
var ywyList = require('../tools/ywy.json')
var ywyList2 = require('../tools/ywy2.json')
var ywyList3 = require('../tools/ywy3.json')
var ywyList4 = require('../tools/ywy4.json')
var ywyList5 = require('../tools/ywy5.json')
var ywyListLen = ywyList.length
var ywyList2Len = ywyList2.length
var ywyList3Len = ywyList3.length
var ywyList4Len = ywyList4.length
var ywyList5Len = ywyList5.length
var obj = {}


//检查是否为业务员
obj.checkIsYwy = function(gh, name){

	for(var i=0; i<ywyListLen; i++){
		if(ywyList[i].gh == gh && ywyList[i].name == name){
			return true
		}
	}


	for(var i=0; i<ywyList2Len; i++){
		if(ywyList2[i].gh == gh && ywyList2[i].name == name){
			return true
		}
	}
	
	
	for(var i=0; i<ywyList3Len; i++){
		if(ywyList3[i].gh == gh && ywyList3[i].name == name){
			return true
		}
	}

	for(var i=0; i<ywyList4Len; i++){
		if(ywyList4[i].gh == gh && ywyList4[i].name == name){
			return true
		}
	}

	for(var i=0; i<ywyList5Len; i++){
		if(ywyList5[i].gh == gh && ywyList5[i].name == name){
			return true
		}
	}

	return false
}


//ajax 接口
obj.modify = function(req,res){ //用户认证绑定
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var openId = req.wxBinder.openId;

	var qobj = {
		//必填项
		appUserName:req.body.appUserName,
		appUserMobile:req.body.appUserMobile,
		appUserCode:req.body.appUserCode,//所属的业务员id
		appSmsCode:req.body.appSmsCode, //短信code
		appUserType:req.body.appUserType || 1,
		code1:req.body.code1,
		code2:req.body.code2,
	}


	if(!qobj.appUserName || qobj.appUserName.length>20){
		return res.send({error:1,data:'真实姓名格式有误'}) 
	}

	if(!qobj.appUserMobile || !/^[0-9]{11}$/.test(qobj.appUserMobile)){
		return res.send({error:1,data:'手机格式有误'}) 
	}


	//这里表示修改资料的是普通用户
	if(qobj.appUserType == 1){

		if(!qobj.appUserCode){
			return res.send({error:1,data:'appUserCode 有误'}) 
		}
		if(!qobj.appSmsCode){
			return res.send({error:1,data:'appSmsCode 有误'}) 
		}

		userBl.getUser({
			'appUserMobile':qobj.appUserMobile
		}, function(err, doc){
				if(err) return res.send({error:1,data:err}) 
				if(doc){
					return res.send({error:1,data:'手机号已被注册'}) 
				}

				//检查sms短信码
				apiSmsLog.checkSms(userId, qobj.appUserMobile, qobj.appSmsCode, function(err, result){
						if(err || !result){
							return res.send({error:1,data:'短信验证码无效'}) 
						}
						
						userBl.modify(userId, openId, qobj, function(err,doc){ //修改用户资料
							if(err){
						        return res.send({error:1,data:err}) 
					     	}
					     	res.send({error:0,data:doc});		
						})
				})
		})
		return
	}

	//如果修改资料的是业务员
	if(qobj.appUserType == 2){

		if(!qobj.code1){
			return res.send({error:1,data:'工号输入有误'}) 
		}
		if(!qobj.code2){
			return res.send({error:1,data:'微信账号输入有误'}) 
		}

		var isYwy = obj.checkIsYwy(qobj.code1, qobj.appUserName)
		if(!isYwy){
			return res.send({error:1,data:'对不起，姓名或工号有误'}) 
		}

		userBl.modify(userId, openId, qobj, function(err,doc){ //修改用户资料
			if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	res.send({error:0,data:doc});		
		})
		return
	}


	return res.send({error:1,data:'用户类型错误'}) 

	

	
}






module.exports = obj;