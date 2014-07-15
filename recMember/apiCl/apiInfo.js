var infoBl = require('../bl/wxInfo.js')
var utils = require('../lib/utils.js');
var obj = {}


//获取专刊中某一片文章的评论
obj.newslist = function(req,res){

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var type = req.query.type || 1;
	var page = req.query.page || 1;

	infoBl.getNewsByTypePage(appId,type,page,null,function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});
	})

}

//向某一个专刊发送评论
obj.speciallist = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var type = req.body.type || 1;
	var page = req.body.page || 1;


	infoBl.getSpecialByTypePage(appId,type,page,null,function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(page == 1){
     		infoBl.getSpecialTop(appId,type,function(err,topdoc){
     			if(err) return res.send({error:1,data:err});

     			res.send({error:0, data:doc, topdoc:topdoc});
     		})
     	}
     	else{
     		res.send({error:0,data:doc});
     	}
	})

}

//参加活动
obj.active = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;

	var username = req.body.username;
	var mobile = req.body.mobile;
	var activeId = req.body.activeid;

	if(!/^1[0-9][0-9]\d{4,8}$/.test(mobile)){
		return res.send({error:1,data:'手机号输入有误'}) 
	}

	if(!username){
		return res.send({error:1,data:'用户名输入有误'}) 
	}

	if(!activeId || activeId.length !=24){
		return res.send({error:1,data:'活动id输入有误'}) 
	}

	var obj = {
		appId:appId,
		activeId:activeId,
		userid:userId,
		username:username,
		mobile:mobile,
	}
	infoBl.saveActive(obj,function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}

     	return res.send({error:0,data:''});

	})

}


module.exports = obj;