var infoBl = require('../bl/wxInfo.js')
var utils = require('../lib/utils.js');
var obj = {}


//获取专刊中某一片文章的评论
obj.getcomment = function(req,res){

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var spid = req.body.spid;
	var page = req.body.page || 1;

	infoBl.getCommentByspecialid(spid, page, null, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});	
	})
	//to do
}

//向某一个专刊发送评论
obj.sendcomment = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var spid = req.body.spid;
	var content = req.body.content;

	infoBl.createCommentBySpid(appId, userId, spid, content, 1, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});	
	})

}


//收藏某一篇专刊文章
obj.sendfavor = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var spid = req.body.spid;

	infoBl.createCommentBySpid(appId, userId, spid, '', 2, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});	
	})

}



module.exports = obj;