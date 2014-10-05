var voteBl = require('../bl/wxVote.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var obj = {}

//第一次加载，获取投票信息和用户投票记录
obj.getVoteInfo = function(req,res){
	//先获取用户id
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	//测试用，真实情况注释
	//req.session[appEname+'_userid'] = '53ecbe65e00fd324efd73032'

	var userid = req.session[appEname+'_userid'];
	//如果用户身份丢失
	if(!userid){
		res.send({error:0,data:'用户身份丢失，请重新进入'})
		return;
	}
	//获取抽奖活动的ename
	var voteEname = req.query.ename;
	if(!voteEname){
		res.send({error:0,data:'缺少ename参数'})
		return;
	}
	//根据ename获取抽奖活动的对象
	voteBl.getVoteByEname(voteEname,function(err,voteObj){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(!voteObj){
     		return res.send({error:1,data:'未找到投票活动'}) 
     	}
     	//获取该用户的抽奖记录
     	voteBl.getUserVoteRecById(userid, voteObj._id.toString(), 0, 1000, function(err,recordList){
     		if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	//将结果返回给前端
	     	return res.send({error:0,data:{
	     		voteObj:voteObj,
	     		record:recordList
	     	}}) 

     	})
	})

}


//用户点击了投票按钮
obj.startVote = function(req,res){ //用户进入抽奖页面点击抽奖程序
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	//测试用，真实情况注释
	req.session[appEname+'_userid'] = '53ecb609e00fd324efd7302d'

	var userid = req.session[appEname+'_userid'];

	if(!userid){
		res.send({error:0,data:'用户身份丢失，请重新进入'})
		return;
	}

	var itemid = req.body.itemid
	var isforward = parseInt(req.body.isforward) || 0;
	var pos = req.ips.length - 1;
	var recordIp = req.ips[pos] || '127.0.0.1'

	voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
		if(err) return res.send({error:1,data:err}) 
     	
     	if(!result._id.toString()) return res.send({error:1,data:'投票失败'}) 

     	return res.send({error:0,data:result});
     	
	})

}


//获取被投票项列表信息
obj.getItemsInfo = function(req,res){

	var groupid = req.query.groupid;
	var voteEname = req.query.ename;
	if(groupid && groupid.length != 24){
		return res.send({error:1,data:'groupid有误'})
	}

	voteBl.getVoteByEname(voteEname,function(err,voteObj){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(!voteObj){
     		return res.send({error:1,data:'未找到投票活动'}) 
     	}

     	voteBl.getItemByGroupId(voteObj._id.toString(), groupid, function(err,itemlist){
	     	if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	return res.send({error:0,data:itemlist})
     	})

	})

	
}


//获取实时排名
obj.getRank = function(req,res){

	var groupid = req.query.groupid;
	var voteEname = req.query.ename;
	if(groupid && groupid.length != 24){
		return res.send({error:1,data:'groupid有误'})
	}

	voteBl.getVoteByEname(voteEname,function(err,voteObj){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(!voteObj){
     		return res.send({error:1,data:'未找到投票活动'}) 
     	}

     	voteBl.getRankByVoteIdGroupId(voteObj._id.toString(), groupid, function(err,itemlist){
	     	if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	return res.send({error:0,data:itemlist})
     	})

	})

	
}



module.exports = obj;