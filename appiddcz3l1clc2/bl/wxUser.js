var userModel = require('../dl/userModel.js'); //加载用户模型
var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var utils = require('../lib/utils.js');
var obj = {}


obj.getUserByOpenid = function(openId,cb){ //根据openid查找用户信息
	var cb = cb || function(){}
	if(!openId) return cb('no openid');
	obj.getUser({openId:openId},cb);
}

obj.getUserByUserId = function(userId,cb){ //根据用户id查找用户信息
	var cb = cb || function(){}
	if(!userId) return cb('no openid');
	obj.getUser({_id:userId},cb);
}

obj.getUser = function(qobj,cb){
	userModel.findOneByObj(qobj,function(err,udoc){
		if(err) return cb(err); //如果出错
		if(!udoc) return cb(null,null); //如果没找到用户
		if(udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		var userId = udoc._id;

		userAppModel.findOneByObj({
			"_id":userId
		},function(err,bindDoc){
			if(err) return cb(err);
			udoc.bind = bindDoc||[];
			cb(null, bindDoc);
		})

	})
}

obj.getUserType = function(udoc,appId){
	if(!udoc.bind) return 0;
	if(udoc.bind.length == 0) return 0;

	for(var i=0; i<udoc.bind.length; i++){
		if(udoc.bind[i].appId == appId){
			return udoc.bind[i].appUserType;
		}
	}
	return 0
}


obj.binder = function(qobj,appId,cb){ //用户认证绑定
	var openid = qobj.openId;
	if(!openId) return cb('no openId');
	obj.getUserByOpenid(openId,function(err,udoc){ //根据openId获取用户信息

		if(err) return cb(err);
		if(!udoc) return cb('未找到该用户',null);
		if(udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		var uType = obj.getUserType(udoc, appId);
		if(uType == 2){ //如果已经是认证vip会员了
			return cb('您已经是vip认证用户',null);
		}
		if(uType == 1){//如果是认证会员，但不是vip，只需要完善小区信息即可

			userAppModel.createOneOrUpdate({
				userId:udoc._id,
				openId:udoc.openId,
				appId:appId
			},{
				appUserCity:qobj.appUserCity,
				appUserCommunity:qobj.appUserCommunity,
				appUserBuilding:qobj.appUserBuilding,
				isNewSubmit:1      //完善资料后成为vip用户
			},function(err,doc){
				if(err) return cb(err);
				cb(doc)
			})

		}
		else{  //如果是0或者没有绑定

			guidModel.getGuid(function(err,guid){
				if(err) return cb(err); //如果出错
				userModel.createOneOrUpdate({
					_id:udoc._id,				
				},{
					wxName:qobj.wxName,
					wxAvatar:qobj.wxAvatar,
					wxGroup:qobj.wxGroup,
					appUserName:qobj.appUserName,
					appUserMobile:qobj.appUserMobile,
					appUserSex:qobj.appUserSex,
					appUserBirth:qobj.appUserBirth	
				},function(err,doc){
					if(err) return cb(err);
					var type = 1;
					var isNewSubmit = 0;
					if(qobj.appUserCity && qobj.appUserCommunity && qobj.appUserBuilding){ 
					//如果传递了城市，小区和楼号则表示，这个人是请求验证vip认证会员，需要手工
						type = 1;
						isNewSubmit = 1
					}

					userAppModel.createOneOrUpdate({
						userId:udoc._id,
						openId:udoc.openId,
						appId:appId
					},{
						appUserCity:qobj.appUserCity || '',
						appUserCommunity:qobj.appUserCommunity || '',
						appUserBuilding:qobj.appUserBuilding || '',
						appUserType:type,
						appCardNumber:guid,
						isNewSubmit:isNewSubmit
					},function(err,doc2){
						if(err) return cb(err);
						cb(doc2)
					})
				})//userModel.createOneOrUpdate
			})//guidModel.getGuid
		}
	})


}

obj.enter = function(openId,appId,cb){ //用户进入
	var cb = cb || function(){}
	if(!openId) return cb('no openId');
	obj.getUserByOpenid(openId,function(err,udoc){
		if(err) return cb(err);
		if(udoc) return cb(null,udoc);
		if(udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		userModel.insertOneByObj({
			openId:openId,
			appId:appId
		},function(err,udoc2){
			if(err) return cb(err);
			cb(null, udoc2);
		})
	})
}

obj.removeScore = function(userId,score,cb){ //减去积分
	obj.getUserByUserId(userId,function(err,doc){
		if(err) return(err);
		if(doc.appUserScore < score){
			return cb('没有足够的积分');
		}

		userModel.createOneOrUpdate({
			_id:userId
		},{
			appUserScore:{$inc:score*-1}
		},function(err,doc){
			cb(err, doc)
		})
	})
}


obj.addScore = function(userId,score,cb){//增加积分
		userModel.createOneOrUpdate({
			_id:userId
		},{
			appUserScore:{$inc:score}
		},function(err,doc){
			cb(err, doc)
		})
}


module.exports = obj;