var userModel = require('../dl/userModel.js'); //加载用户模型
var commentModel = require('../dl/appCommentModel.js'); //加载评论模型
var recommendModel = require('../dl/recommendModel.js'); //加载推荐模型
var scoreModel = require('../dl/scoreGetModel.js');  //score模型
var scoreGetModel = require('../dl/scoreGetModel.js');
var appSpecialModel = require('../dl/appSpecialModel.js');  //appSpecialModel模型
var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var utils = require('../lib/utils.js');
var obj = {}
var recommendScore = 20;

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

obj.createCardNum = function(cardNumber){
	var cardStr = cardNumber.toString()
	var len = cardStr.length;
	var needLen = 7 - len;
	for(var i=0; i<needLen; i++){
		cardStr = '0' + cardStr
	}
	return cardStr
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

									obj.checkRecommend(appId, udoc.uobj._id, qobj.appUserMobile);

									cb(null,doc2)

								})//end userAppModel.createOneOrUpdate

							})//end userAppModel.findByObj

						})//userModel.createOneOrUpdate
					})//guidModel.getGuid
				})
			}
		})
}



obj.checkRecommend = function(appId, userid, mobile){

	//根据手机号查找推荐条目
	recommendModel.findByObj({
		appId:appId,
		recommendMobile:mobile,
		status:1,
	},function(err,rec_list){
		if(err){
			console.log(err);
			return;
		}
		if(rec_list.length == 0){
			return;
		}

		//第一条表示推荐成功
		var recObj = rec_list[0];
		var noRecAry = rec_list.slice(1);
		var noRecIds = [];
		noRecAry.forEach(function(o){
			noRecIds.push(o._id);
		})

		userModel.createOneOrUpdate({ //判断成功，更新推荐人积分
                  _id:recObj.userId
                },{
                  $inc:{
                  	appUserScore:recommendScore
                  } //推荐他人注册成功，+20分

                },function(err,udoc){ //开始写入积分获取流水
                   if(err) return;
                   if(!udoc) return;
                   var qobj={
                      appId:recObj.appId,
                      userId:recObj.userId,
                      mobile:mobile,
                      scoreDetail:recommendScore,
                      scoreType:1,
                      scoreWay:'recommend',
                      scoreCode1:recObj._id
                   }
                    guidModel.getGuid(function(err,guid){ //生成guid
                        if(err) return;
                        qobj.scoreGuid = guid;
                        
                        //插入获取积分流水
                        scoreGetModel.insertOneByObj(qobj,function(err,doc){
	                           
	                            if(err) return;
                                recommendModel.createOneOrUpdate({_id:recObj._id}, {
	                                status:2,
	                                code1:userid,	//保存被推荐人用户id
                                }, function(err, doc){ //更新推荐状态
                                    if(err) return;
                                })

                                recommendModel.createOneOrUpdate({'_id':{
                                	'$in':noRecIds
                                }}, {status:3}, function(err, doc){ //更新推荐状态
                                    if(err) return;
                                })

                        })// end scoreGetModel.insertOneByObj
                    })//end guidModel.getGuid         
        })//end userdl.createOneOrUpdate


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


obj.commentAndFavor = function(userid,type,page,pagesize,cb){ //获取用户的评论或者收藏列表
	var size = size || 10;
	var skip = (page-1) * size
	commentModel.findAll({
		userId:userid,
		type:type,
	},skip, size,function(err,doc){
		if(err) return cb(err)
		if(doc.length==0) return cb(null, doc);

		if(type == 1){//如果获取的是评论内容
				var tempary = []
				doc.forEach(function(obj){
					tempary.push({
						_id:obj._id,
						specialId:obj.specialId,
						content:obj.content,
						type:obj.type,
						code1:obj.code1,
						code2:obj.code2,
						writeTime:moment(obj.writeTime).format('YYYY-MM-DD hh:mm:ss')
					})
				})
				return cb(err,tempary)
		}
		else{//如果获取的是收藏夹内容
			var ids =[];
			doc.forEach(function(o2){
				if(ids.indexOf(o2.specialId) == -1){
					ids.push(o2.specialId);
				}
			})

			appSpecialModel.getByIds(ids,function(err,list){
				if(err) return cb(err);
				var tempary = [];

				doc.forEach(function(obj){
					var len = list.length;
					for(var i=0;i<len;i++){
						if(list[i]._id == obj.specialId){
							tempary.push({
								_id:obj._id,
								specialId:obj.specialId,
								title:list[i].title,
								picture:list[i].picture,
								type:list[i].type,
								writeTime:list[i].writeTime
							})
							return;
						}
					}

				})

				return cb(null,tempary)
			})



		}


	})
}

obj.getFavorOrCommentById = function(spid,userid, type,cb){

	commentModel.findOneByObj({
		specialId:spid,
		userId:userid,
		type:type
	},function(err,doc){
		return cb(err,doc)
	})


}




obj.getScoreList = function(appid,userid, cb){
	scoreModel.findAll({
		appId:appid,
		userId:userid
	},0,50,function(err,doc){
		return cb(err,doc)
	})
}


obj.scoreRank = function(cb){
	userModel.scoreRank({},20,function(err,doclist){
		return cb(err,doclist)
	})
}

obj.recommend = function(appId, userId, mobile, cb){

	recommendModel.findOneByObj({
		recommendMobile:mobile,
		status:2
	},function(err,doc){
		if(err) return cb(err)
		if(doc) return cb('此人已经被推荐过了')

		recommendModel.findOneByObj({
			recommendMobile:mobile,
			userId:userId,
			status:1
		},function(err,doc){
			if(err) return cb(err)
			if(doc) return cb('你已经推荐过了')

			recommendModel.insertOneByObj({//插入数据
				appId:appId,
				userId:userId,
				recommendMobile:mobile,
				status:1
			},function(err,doc){
				return cb(err,doc)
			})
		})
	})
}


obj.countMyComment = function(appId,uid,type,cb){ //获取我的评论数

	commentModel.countAll({
		appId:appId,
		userId:uid,
		type:type,
	},function(err,count){
		if(err) return cb(null,0)
		return cb(null,count)
	})
}

obj.countMyFavor = function(appId,uid,cb){ //获取我的收藏数

	commentModel.countAll({
		appId:appId,
		userId:uid,
		type:2,
	},function(err,count){
		if(err) return cb(null,0)
		return cb(null,count)
	})
}

module.exports = obj;