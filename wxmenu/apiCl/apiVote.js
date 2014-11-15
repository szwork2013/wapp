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
		res.send({error:1,data:'用户身份丢失，请重新进入'})
		return;
	}
	//获取抽奖活动的ename
	var voteEname = req.query.ename;
	if(!voteEname){
		res.send({error:1,data:'缺少ename参数'})
		return;
	}
	//先读取缓存
	var cacheKey = voteEname
	var now = Date.now()

	if(global[cacheKey] && now - global[cacheKey].timestamp < 3600*1000){
		
		res.send({error:0,data:global[cacheKey].data}) 
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
     	var todayDate = moment().hour(0).minute(0).second(0).millisecond(0).unix()*1000;
     	todayDate = new Date(todayDate);
     	//获取该用户的今日抽奖记录
     	voteBl.getUserVoteRecById(userid, voteObj._id.toString(), todayDate, 0, 1000, function(err,recordList){
     		if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	//写入缓存
	     	global[cacheKey] = {
	     		data:{
		     		voteObj:voteObj,
		     		record:recordList
	     		},
	     		timestamp:Date.now(),
	     	}

	     	//将结果返回给前端
	     	return res.send({error:0,data:{
	     		voteObj:voteObj,
	     		record:recordList
	     	}}) 

     	})
	})

}


//web页面用，获取投票信息
obj.getVoteInfo2 = function(req,res){

	var voteEname = req.query.voteename
	var lastTimeStamp = req.query.timestamp
	
	if(parseInt(lastTimeStamp) != req.query.timestamp){
		return res.send({error:1, data:'timestamp error'})
	}
	lastTimeStamp = parseInt(lastTimeStamp)
	
	if(!voteEname){
		return res.send({error:1, data:'voteEname error'})
	}

	//先读取缓存
	var cacheKey = voteEname+'2'
	var now = Date.now()

	if(global[cacheKey] && now - global[cacheKey].timestamp < 3600*1000){		
		res.send({error:0,data:global[cacheKey].data}) 
		return;
	}


	voteBl.getVoteByEname(voteEname,function(err,voteObj){
		if(err){
			return res.send({error:1, data:err})
		}
		if(!voteObj){
			return res.send({error:1, data:err})
		}


		var voteid = voteObj._id.toString()

		voteBl.getGroupByVoteId(voteid, function(err, groupList){
			if(err){
				return res.send({error:1, data:err})
			}


			voteBl.getGroupCountByVoteId(voteid, lastTimeStamp, function(err, groupCountList){
					if(err){
						return res.send({error:1, data:err})
					}
					//拼接投票分组count数组
					var tempGroupList = [];
					groupList.forEach(function(groupObj){
						groupCountList.forEach(function(groupCountObj){
							if(groupObj._id.toString() == groupCountObj.groupid){
								tempGroupList.push({
									_id:groupCountObj.groupid,
									count:groupCountObj.count,
									ename:groupObj.ename,
									title:groupObj.title,
									isFreez:groupObj.isFreez,
									code1:groupObj.code1,
									code2:groupObj.code2,
									code3:groupObj.code3,
									code4:groupObj.code4
								})
							}
						})
					})

					tempGroupList = tempGroupList.sort(function(a,b){
						if(a.count < b.count) return true;
						return false;
					})
				
					
					//写入缓存
			     	global[cacheKey] = {
			     		data:{
							group:tempGroupList,
							vote:voteObj
						},
			     		timestamp:Date.now(),
			     	}

					res.send({error:0,data:{
							group:tempGroupList,
							vote:voteObj
						}
					})

			})//end voteBl.getGroupCountByVoteId

		})//end voteBl.getGroupByVoteId

	})//end voteBl.getVoteByEname


}


//用户点击了投票按钮
obj.startVote = function(req,res){ //用户进入抽奖页面点击抽奖程序
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	//测试用，真实情况注释
	//req.session[appEname+'_userid'] = '53ecb609e00fd324efd7302d'

	var userid = req.session[appEname+'_userid'];

	if(!userid){
		res.send({error:1,data:'用户身份丢失，请重新进入'})
		return;
	}

	var itemid = req.body.itemid
	var isforward = parseInt(req.body.isforward) || 0;
	//var pos = req.ips.length - 1;
	var recordIp = req.ips[0] || '127.0.0.1'

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

	//先读取缓存
	var cacheKey = voteEname+groupid
	var now = Date.now()
	if(global[cacheKey] && now - global[cacheKey].timestamp < 3600*10){		
		res.send({error:0,data:global[cacheKey].data}) 
		return;
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

	     	//写入缓存
	     	global[cacheKey] = {
	     		data:itemlist,
	     		timestamp:Date.now(),
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


obj.getMyRecord = function(req, res){
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
		res.send({error:1,data:'用户身份丢失，请重新进入'})
		return;
	}
	//获取抽奖活动的ename
	var voteEname = req.body.ename;
	if(!voteEname){
		res.send({error:1,data:'缺少ename参数'})
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
     	var voteid = voteObj._id.toString();

     	voteBl.getUserRecordGroupByItemId(voteid, userid, function(err, recordList){
     		if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	return res.send({error:0,data:recordList})

     	})//end voteBl.getUserRecordGroupByItemId

	})//end voteBl.getVoteByEname

}


module.exports = obj;