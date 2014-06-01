var suggestBl = require('../bl/wxSuggest.js');
var utils = require('../lib/utils.js');
var guidModel = require('../dl/guidModel.js');
var obj = {}


obj.sendSuggest = function(req,res){ //发送意见建议

	var appId = global.wxAppObj._id;
	var userId = req.wxuobj._id;
	var openId = req.wxBinder.openId;
	var suggestType = 2;
	var suggestGuid = '-1';
	var suggestCode1 = req.body.truename;
	var suggestCode2 = req.body.mobile;
	var suggestContent = req.body.suggestContent;

	if(!suggestCode1){
		return res.send({error:1,data:'请填写姓名'})
	}
	if(!suggestCode2){
		return res.send({error:1,data:'请填写联系电话'})
	}
	if(!suggestContent){
		return res.send({error:1,data:'请填写建议内容'})
	}

	suggestBl.sendSuggest({
	  appId:appId,
      userId:userId,
      openId:openId,      
      suggestGuid:suggestGuid,
      suggestContent:suggestContent,
      suggestType:suggestType,
      suggestCode1:suggestCode1,
      suggestCode2:suggestCode2
	},function(err,doc){
		if(err){
	        logger.error('infoBl.sendMessage error, error: %s',config.appEname,err);
	        return res.send(500) 
     	}
     	res.send({error:0,data:''});
	})


}

obj.sendMessage = function(req,res){ //发送留言信息

	var appId = global.wxAppObj._id;
	var userId = req.wxuobj._id;
	var openId = req.wxBinder.openId;
	var suggestType = req.body.suggestType || 3;
	var suggestGuid = '-1'
	var suggestContent = req.body.suggestContent
	var suggestName = req.body.suggestName || ''
	var suggestTel = req.body.suggestTel || ''
	var suggestHouse = req.body.suggestHouse || ''
	var suggestRoom = req.body.suggestRoom || ''
	
	if(!suggestContent){
		return res.send({error:1,data:'请填写留言内容'})
	}

	suggestBl.sendSuggest({
	  appId:appId,
      userId:userId,
      openId:openId,      
      suggestGuid:suggestGuid,
      suggestContent:suggestContent,
      suggestType:suggestType,
      suggestCode1:suggestName,
      suggestCode2:suggestTel,
      suggestCode3:suggestHouse,
      suggestCode4:suggestRoom
	},function(err,doc){
		if(err){
	        logger.error('infoBl.sendMessage error, error: %s',err);
	        return res.send(500) 
     	}
     	res.send({error:0,data:''});
	})
}


obj.sendService = function(req,res){ //发送服务请求
	var appId = global.wxAppObj._id;
	var userId = req.wxuobj._id;
	var openId = req.wxBinder.openId;
	var suggestType = 1;
	var suggestGuid = '-1';
	var suggestContent = req.body.suggestContent

	if(!suggestContent){
		return res.send({error:1,data:'请填写请求内容'})
	}

	guidModel.getGuid(function(err,guid){
		if(err){
			 logger.error('obj.sendService guidModel.getGuid error, error: %s',err);
			 return res.send(500) 
		}

		suggestGuid = guid;
		suggestBl.sendSuggest({
			  appId:appId,
		      userId:userId,
		      openId:openId,      
		      suggestGuid:suggestGuid,
		      suggestContent:suggestContent,
		      suggestType:suggestType
		},function(err,doc){
			if(err){
		        logger.error('suggestBl.sendSuggest error, error: %s',err);
		        return res.send(500) 
	     	}
	     	res.send({error:0,data:''});
		})

	})
}




obj.sendOrder = function(req,res){ //根据流水号查询服务请求的进度
	var appId = global.wxAppObj._id;
	var userId = req.wxuobj._id;
	var openId = req.wxBinder.openId;
	var orderId = req.query.orderId

	if(!orderId || orderId.length != 24){
		return res.send({error:1,data:'流水号填写有误'})
	}

	suggestBl.getSuggestBySuggestId(orderId, userId, function(err,doc){
		if(err){
			 logger.error('obj.sendOrder suggestBl.getSuggestBySuggestId error, error: %s',err);
			 return res.send(500) 
		}
		res.send({error:0,data:doc});
	})
}






module.exports = obj;