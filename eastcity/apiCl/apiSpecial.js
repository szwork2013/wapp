var infoBl = require('../bl/wxInfo.js')
var utils = require('../lib/utils.js');
var userBl = require('../bl/wxUser.js');
var obj = {}


//获取专刊中某一片文章的评论
obj.getcomment = function(req,res){

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var spid = req.body.spid;
	var page = req.body.page || 1;

	if(!spid || spid.length!=24){
		return res.send({error:1,data:'专刊id有误'}) 
	}

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

	if(!spid || spid.length!=24){
		return res.send({error:1,data:'专刊id有误'}) 
	}
	if(!content || content.length>100){
		return res.send({error:1,data:'评论内容有误'}) 
	}
	infoBl.getSpecialById(spid,function(err,spdoc){
	if(err){
	        return res.send({error:1,data:err}) 
     	}
    if(!spdoc){
    	return res.send({error:1,data:'未找到专刊内容'})
    }

		infoBl.createCommentBySpid(appId, userId, spid, content, 1, function(err,doc){
			if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	res.send({error:0,data:doc});	
		})

	})

}


//收藏某一篇专刊文章
obj.sendfavor = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;
	var spid = req.body.spid;
	if(!spid || spid.length!=24){
		return res.send({error:1,data:'专刊id有误'}) 
	}

	infoBl.getSpecialById(spid,function(err,spdoc){
		if(err){
		        return res.send({error:1,data:err}) 
	     	}
	    if(!spdoc){
	    	return res.send({error:1,data:'未找到专刊内容'})
	    }

	    userBl.getFavorOrCommentById(spid,userId,2,function(err,doc){
			if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	if(doc){
	     		return res.send({error:0,data:'已收藏'});
	     	}
	     	

			infoBl.createCommentBySpid(appId, userId, spid, '', 2, function(err,doc){
				if(err){
			        return res.send({error:1,data:err}) 
		     	}
		     	res.send({error:0,data:doc});	
			})
		})	
	})

}



module.exports = obj;