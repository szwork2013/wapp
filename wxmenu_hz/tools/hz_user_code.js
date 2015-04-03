var obj={}
var userModel = require('../dl/userModel.js'); //加载用户模型

obj.userCodeList  = []


obj.checkUserCode = function(userCode, cb){

	var len = obj.userCodeList.length
	var hasFound = 0
	//循环去匹配code邀请码list
	for(var i=0;i<len;i++){
		break;
	}

	//如果没有找到邀请码
	if(hasFound == 0){
		return cb(true)
	}

	//判断是否被使用
	//找到邀请码了
	userModel.countAll({'appUserCode':userCode},function(err,count){
		if(err) return cb(true)
		if(count > 0) return cb(true)
		return cb(false)
	})


}






















module.exports = obj