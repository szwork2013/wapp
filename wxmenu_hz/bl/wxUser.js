var userModel = require('../dl/userModel.js'); //加载用户模型

var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var starLogModel = require('../dl/starLogModel.js'); //打分的流水


var moment = require('moment');
var utils = require('../lib/utils.js');


var obj = {}


obj.getUserByOpenid = function(openId,cb){ //根据openid查找用户信息
	var cb = cb || function(){}
	if(!openId) return cb('no openid');
	//obj.getUser({openId:openId},cb);
	userAppModel.findOneByObj({
		openId:openId
	},function(err,appUDoc){
		if(err) return cb(err); //如果出错
		if(!appUDoc){
			return cb(null, null)
		}
		var userId = appUDoc.userId;
		obj.getUserByUserId(userId,cb)
	})

}


obj.getUserByUserId = function(userId,cb){ //根据用户id查找用户信息
	var cb = cb || function(){}
	if(!userId) return cb('no userId');
	obj.getUser({_id:userId},cb);
}

obj.getUser = function(qobj,cb){
	userModel.findOneByObj(qobj,function(err,udoc){
		if(err) return cb(err); //如果出错
		if(!udoc) return cb(null,null); //如果没找到用户
		if(udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		var userId = udoc._id;

		userAppModel.findByObj({
			"userId":userId
		},function(err,bindDoc){
			if(err) return cb(err);
			//udoc.bind = bindDoc||[];
			cb(null, {
				uobj:udoc,
				bind:bindDoc || []
			});
		})

	})
}

obj.getUserType = function(udoc,appId){
	if(!udoc.bind || udoc.bind.length == 0) return 0;

	for(var i=0; i<udoc.bind.length; i++){
		if(udoc.bind[i].appId == appId){
			return udoc.bind[i].appUserType;
		}
	}
	return 0
}


obj.enter = function(openId,appId,cb){ //用户进入
	var cb = cb || function(){}
	if(!openId) return cb('no openId');
	obj.getUserByOpenid(openId,function(err,udoc){
		if(err) return cb(err);
		if(udoc && udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		if(udoc) return cb(null,udoc);
		
		guidModel.getGuid(function(err,guid){
			userModel.insertOneByObj({
				appId:appId,
				appUserMobile:'__'+guid
			},function(err,udoc2){
				if(err) return cb(err);

				userAppModel.insertOneByObj({
					userId:udoc2._id,
					openId:openId,
					appId:appId,
				},function(err,appUDoc){
					if(err) return cb(err);
					cb(null, {
						uobj:udoc2
					});
				})			
			})
		})
	})
}


obj.getUserByIds = function(uidList, cb){

	userModel.getUserByIds(uidList,function(err,list){
		if(err || list.length == 0){
			return cb(err,list)
		}
		cb(null, list)

	})
}


obj.modify = function(userId, openId, qobj,cb){//修改用户资料
	if(!userId){
		return cb('缺少 userid')
	}
	// if(!openId){
	// 	return cb('缺少 openId')
	// }

	var appMObj = {}
	if(qobj.appUserCommunity){
		appMObj.appUserCommunity = qobj.appUserCommunity
	}
	if(qobj.appUserBuilding){
		appMObj.appUserBuilding = qobj.appUserBuilding
	}
	if(qobj.appUserRoom){
		appMObj.appUserRoom = qobj.appUserRoom
	}

	var userMObj = {}
	if(qobj.appUserName){
		userMObj.appUserName = qobj.appUserName
	}
	if(qobj.appUserSex){
		userMObj.appUserSex = qobj.appUserSex
	}
	if(qobj.appUserBirth){
		userMObj.appUserBirth = qobj.appUserBirth
	}
	if(qobj.appUserMobile){
		userMObj.appUserMobile = qobj.appUserMobile
	}
	//console.log(appMObj)

	/*
	userAppModel.createOneOrUpdate({
			userId:userId,
			openId:openId,
		},qobj,function(err,doc2){
			if(err) return cb(err);
	*/
			userModel.createOneOrUpdate({
				_id:userId
			},userMObj, function(err,doc){
				if(err) return cb(err);
				cb(null,{
					'userObj':doc
					//'binderObj':doc2
				})//end cb		
			})//end userModel.createOneOrUpdate
	//	})// end userAppModel.createOneOrUpdate 
}




//获得我的打分流水
obj.getMyStarLog = function(userId, toUserId, cb){

	starLogModel.findByObj({'fromUserId':userId, 'toUserId':toUserId}, function(err, docList){
		if(err) return cb(err)
		return cb(docList)
	})
}



obj.getAvgScore = function(userId, cb){

	userModel.findOneByObj({
		_id:userId
		},function(err,udoc){
		if(err) return cb(err)
		starLogModel.countAll({
			'toUserId':userId
		}, function(err, count){
			if(err) return cb(err)
			if(count==0) return cb(null, 0)
			var avg = udoc.appUserScore/count
			return cb(null, avg)
		})
	})

	

}


//处理打分
obj.dealStar = function(userId, toUserId, score, ip, cb){

	obj.getMyStarLog(userId, toUserId, function(err, docList){
		if(err){
			return cb(err)
		}
		if(docList.length > 0){
			return cb('不能重复打分')
		}

		starLogModel.insertOneByObj({
			toUserId:toUserId,
			fromUserId:userId,
			logIp:ip,
			starScore:score,
		},function(err, doc){
			if(err){
				return cb(err)
			}
			//然后给业务员打分，免去每次都groupby操作
			userModel.createOneOrUpdate({
				_id:toUserId
			}, {
				'$inc:':{
				'appUserScore':score
				}
			}, function(err, doc){
				if(err) return cb(err)
				return cb(null, doc)
			}) // end userModel.createOneOrUpdate

			
		})//end starLogModel.insertOneByObj


	})//end obj.getMyStarLog


}



module.exports = obj;