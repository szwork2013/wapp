var voteBl = require('../bl/wxVote.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var async = require('async');
var fs = require("fs")
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

	/*
	if(global[cacheKey] && now - global[cacheKey].timestamp < 3600*1000){
		
		res.send({error:0,data:global[cacheKey].data}) 
		return;
	}*/


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
	     	/*global[cacheKey] = {
	     		data:{
		     		voteObj:voteObj,
		     		record:recordList
	     		},
	     		timestamp:Date.now(),
	     	}*/

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

	if(global[cacheKey] /*&& now - global[cacheKey].timestamp < 3600*1000*/){		
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
						if(a.count < b.count) return 1;
						return -1;
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


//用户批量投票
obj.startManyVote = function(req, res){

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

	//var itemid = req.body.itemid
	var isforward = 0;
	//var pos = req.ips.length - 1;
	var recordIp = req.ips[0] || '127.0.0.1'

	var voteEname = req.body.voteEname
	var lv0Items = (req.body.lv0 || '').split(',')
	var lv1Items = (req.body.lv1 || '').split(',')
	var lv2Items = (req.body.lv2 || '').split(',')
	var lv3Items = (req.body.lv3 || '').split(',')
	var lv4Items = (req.body.lv4 || '').split(',')

	if(!voteEname){
		res.send({error:1,data:'投票ename无效'})
		return;
	}

	//参数检查
	if(lv0Items.length != 1){
		res.send({error:1,data:'特等奖只能1名'})
		return;
	}
	//参数检查
	if(lv1Items.length != 2){
		res.send({error:1,data:'一等奖只能2名'})
		return;
	}
	//参数检查
	if(lv2Items.length != 3){
		res.send({error:1,data:'二等奖只能3名'})
		return;
	}
	//参数检查
	if(lv3Items.length != 6){
		res.send({error:1,data:'三等奖只能6名'})
		return;
	}
	//参数检查
	if(lv4Items.length != 3){
		res.send({error:1,data:'建筑过程影响奖只能3名'})
		return;
	}

	var allItemIds = lv0Items.concat(lv1Items).concat(lv2Items).concat(lv3Items).concat(lv4Items)
	var error = 0
	allItemIds.forEach(function(itemid){
		if(itemid.length != 24){
			error++
		}
	})
	if(error>0){
		res.send({error:1,data:'投票id部分无效'})
		return;
	}
	//检查itemid是否都在集合内
	voteBl.countVoteNumInIds(allItemIds, function(err, itemsCount){
		if(err) return res.send({error:1,data:err}) 
		if(itemsCount != allItemIds.length){
			res.send({error:1,data:'投票id部分未找到'})
			return; 
		}
		//拿到投票id
		voteBl.getVoteByEname(voteEname,function(err, voteObj){
			if(err) return res.send({error:1,data:err}) 
			if(!voteObj) return res.send({error:1,data:'未找到投票'})
			var voteId = voteObj._id.toString()
			//检查这个用户是否已经投过票了
			voteBl.countUserVoteRecord(userid, voteId, function(err, countNum){
				if(err) return res.send({error:1,data:err}) 
				if(countNum>0) return res.send({error:1,data:'您已经参与过了'})

				var dealFunc = []
				lv0Items.push(function(itemid){
					//将操作放入数组
					dealFunc.push(function(callback){
						voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
								if(err) return callback(err)
						     	if(!result._id.toString()) return callback('投票失败') 
						     	return callback(null) 	
						},'lv0')
					})
				})
				lv1Items.push(function(itemid){
					//将操作放入数组
					dealFunc.push(function(callback){
						voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
								if(err) return callback(err)
						     	if(!result._id.toString()) return callback('投票失败') 
						     	return callback(null) 	
						},'lv1')
					})
				})
				lv2Items.push(function(itemid){
					//将操作放入数组
					dealFunc.push(function(callback){
						voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
								if(err) return callback(err)
						     	if(!result._id.toString()) return callback('投票失败') 
						     	return callback(null) 	
						},'lv2')
					})
				})
				lv3Items.push(function(itemid){
					//将操作放入数组
					dealFunc.push(function(callback){
						voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
								if(err) return callback(err)
						     	if(!result._id.toString()) return callback('投票失败') 
						     	return callback(null) 	
						},'lv3')
					})
				})
				lv4Items.push(function(itemid){
					//将操作放入数组
					dealFunc.push(function(callback){
						voteBl.startVote(itemid, userid, recordIp, isforward, function(err,result){
								if(err) return callback(err)
						     	if(!result._id.toString()) return callback('投票失败') 
						     	return callback(null) 	
						},'lv4')
					})
				})


				async.series(dealFunc, function(err){
					if(err){
						res.send({error:1,data:err})
						return;
					} 
					res.send({error:0,data:'投票成功'})
				})//end async.series

			})//end voteBl.countUserVoteRecord

		})//end voteBl.getVoteByEname

	})//end voteBl.countVoteNumInIds

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
	var limit = req.query.limit;
	var skip = req.query.skip || 0;
	//排序类型
	//1 表示按投票个数来倒排序
	//2 表示按更新时间来倒排序
	//3 表示乱排序
	var sortType = req.query.sorttype || 1


	if(groupid && groupid.length != 24){
		return res.send({error:1,data:'groupid有误'})
	}

	//先读取缓存
	var cacheKey = voteEname+groupid
	var now = Date.now()
	if(false && global[cacheKey] /*&& now - global[cacheKey].timestamp < 3600*10*/){		
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
     	}, sortType, limit, skip)

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