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
	var type = req.query.type || 1;
	var page = req.query.page || 1;

	infoBl.getSpecialByTypePage(appId,type,page,null,function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:doc});
	})

}



module.exports = obj;