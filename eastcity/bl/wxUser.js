var userModel = require('../dl/userModel.js'); //加载用户模型
var commentModel = require('../dl/appCommentModel.js'); //加载评论模型
var scoreModel = require('../dl/scoreGetModel.js');  //score模型
var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
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


obj.binder = function(qobj,appId,cb){ //用户认证绑定
	var openId = qobj.openId;
	if(!openId) return cb('no openId');

		obj.getUserByOpenid(openId,function(err,udoc){ //根据openId获取用户信息
			//console.log('**********')
			//console.log(err)
			//console.log(udoc);

			if(err) return cb(err);
			if(!udoc || !udoc.uobj) return cb('未找到该用户',null);
			if(udoc.uobj.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
			if(!qobj.appUserMobile){
				return cb('请填写手机')
			}

			var uType = obj.getUserType(udoc, appId);

			//console.log(uType);

			if(uType == 2 || uType == 1){ //如果已经是注册会员了
				return cb('您已经是注册用户',null);
			}
			else{  //如果是0或者没有绑定

			userModel.findOneByObj({
					appUserMobile:qobj.appUserMobile
				},function(err,udoc2){
					if(err) return cb(err)
					if(udoc2) return cb('手机号已经被使用')
					guidModel.getGuid(function(err,guid){
						if(err) return cb(err); //如果出错



						var isNewSubmit = 0
						if(qobj.appUserRoom && qobj.appUserCommunity && qobj.appUserBuilding){
							isNewSubmit = 1
						}

						userModel.createOneOrUpdate({
							_id:udoc.uobj._id,				
						},{						
							appUserName:qobj.appUserName,
							appUserMobile:qobj.appUserMobile,
							appUserSex:qobj.appUserSex || 1,
							appUserBirth:qobj.appUserBirth || '1970/1/1'	
						},function(err,doc){
							if(err) return cb(err);
							var type = 1;
							var isNewSubmit = 0;


							if(qobj.appUserRoom && qobj.appUserCommunity && qobj.appUserBuilding){ 
							//如果传递了房号，小区和楼号则表示，这个人是请求验证vip认证会员，需要手工
								type = 1;
								isNewSubmit = 1
							}
							userAppModel.findByObj({
								userId:udoc.uobj._id,
								openId:openId,
								appId:appId
							},function(err, appDoc){

								if(err) return cb(err);
								if(appDoc && appDoc.length>0 && appDoc[0].appCardNumber){
									guid = appDoc[0].appCardNumber
								}
								userAppModel.createOneOrUpdate({
									userId:udoc.uobj._id,
									openId:openId,
									appId:appId
								},{
									appUserCommunity:qobj.appUserCommunity || '',
									appUserBuilding:qobj.appUserBuilding || '',
									appUserRoom:qobj.appUserRoom || '',
									appUserCity:qobj.appUserCity || '',
									appUserType:type,
									appCardNumber:guid,					
									isNewSubmit:isNewSubmit
								},function(err,doc2){

									if(err) return cb(err);
									cb(null,doc2)
								})//end userAppModel.createOneOrUpdate

							})//end userAppModel.findByObj

						})//userModel.createOneOrUpdate
					})//guidModel.getGuid
				})
			}
		})
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

obj.removeScore = function(userId,score,cb){ //减去积分
	obj.getUserByUserId(userId,function(err,uobj){
		if(err) return(err);
		var doc = uobj.uobj

		if(doc.appUserScore < score){
			return cb('没有足够的积分');
		}
		userModel.createOneOrUpdate({
			_id:userId
		},{
			$inc :{appUserScore:score*-1}
		},function(err,doc){
			cb(err, doc)
		})
	})
}


obj.addScore = function(userId,score,cb){//增加积分

		userModel.createOneOrUpdate({
			_id:userId
		},{
			$inc:{appUserScore:score}
		},function(err,doc){
			//console.log(err)
			cb(err, doc)
		})
}

obj.modify = function(userId, openId, qobj,cb){//修改用户资料
	if(!userId){
		return cb('缺少 userid')
	}
	if(!openId){
		return cb('缺少 openId')
	}

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
	/*if(qobj.appUserMobile){
		userMObj.appUserMobile = qobj.appUserMobile
	}*/

	userAppModel.createOneOrUpdate({
			userId:userId,
			openId:openId,
		},appMObj,function(err,doc2){
			if(err) return cb(err);

			userModel.createOneOrUpdate({
				_id:userId
			},userMObj, function(err,doc){
				if(err) return cb(err);
				cb(null,{
					'userObj':doc,
					'binderObj':doc2
				})//end cb		
			})//end userModel.createOneOrUpdate
		})// end userAppModel.createOneOrUpdate 
}


obj.commentAndFavor = function(userid,type,page,pagesize,cb){ //获取用户的评论或者收藏列表
	var size = size || 10;
	var skip = (page-1) * size
	commentModel.findAll({
		userId:userid,
		type:type,
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(!doc) return cb(null, doc);
		return cb(err,doc)
	})
}






obj.getScoreList = function(appid,userid, cb){

	scoreModel.findAll({
		appId:appid,
		userId:userid
	},0,50,function(err){
		return cb(err,doc)
	})


}


module.exports = obj;