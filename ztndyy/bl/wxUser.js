var userModel = require('../dl/userModel.js'); //加载用户模型
var recRecordModel = require('../dl/recRecordModel.js'); //加载推荐模型
var recBankTransac = require('../dl/recBankTransac.js'); //加载结佣模型
var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var moment = require('moment');
var utils = require('../lib/utils.js');
//加载老用户信息
//第一列为姓名
//第二列为电话
//第三列为楼号
//第四列为房号
//第五列为来源
//var oldMember = require('../oldMember.json') || [];


var obj = {}
var recommendScore = 20;


obj.getJieDaiUsers = function(cb){ //根据openid查找用户信息
	var cb = cb || function(){}
	userModel.findByObj({code2:'1'}, function(err, list){
			cb(err, list)
	})
}

obj.getMyAgents = function(userid, cb){
	recRecordModel.findByObj({
		recRoom:userid
	}, function(err, list){
		cb(err, list)
	})
}

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

obj.genCardNumber = function(trueCardNum){
	var trueCardNum = trueCardNum +''
	var len = 6-trueCardNum.length;
	if(len<=0) return trueCardNum;
	for(var i=0;i<len;i++){
		trueCardNum = '0'+trueCardNum;
	}
	return trueCardNum;
}


//检查这个用户是否是老用户
obj.checkIsOldMember = function(uobj){
	if(!Array.isArray(oldMember) || oldMember.length == 0) return false;

	var len = oldMember.length;
	for(var i=0;i<len;i++){
		var foundCount = 0;

		if(oldMember[i][0].indexOf(uobj.appUserName)!=-1){
			foundCount++;
		}
		if(oldMember[i][1].indexOf(uobj.appUserMobile)!=-1){
			foundCount++;
		}
		if(uobj.appUserBuilding.indexOf(oldMember[i][2]) != -1){
			foundCount++;
		}
		if(uobj.appUserRoom.indexOf(oldMember[i][3]) != -1){
			foundCount++;
		}
		/*
		console.log(oldMember[i][0],uobj.appUserName)
		console.log(oldMember[i][1],uobj.appUserMobile)
		console.log(oldMember[i][2],uobj.appUserBuilding)
		console.log(oldMember[i][3],uobj.appUserRoom)
		console.log(foundCount)
		*/
		if(foundCount>=3){
			var from = oldMember[i][4]
			return from || '其它';
		}
	}
	return false;
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
					//if(udoc2) return cb('手机号已经被使用')

					//生成会员卡号
					guidModel.getGuid(function(err,guid){
						if(err) return cb(err); //如果出错
						/*
						if(qobj.appUserRoom && qobj.appUserCommunity && qobj.appUserBuilding){
							isNewSubmit = 1
						}
						*/

						/*
						var isOldMember = obj.checkIsOldMember({
									appUserName:qobj.appUserName,
									appUserMobile:qobj.appUserMobile,
									appUserBuilding:qobj.appUserBuilding,
									appUserRoom:qobj.appUserRoom,
						})
						*/
						var isOldMember = true
						//新的用户提交，将会审核
						var isNewSubmit = 1;

						//判断是否是老会员，如果是老会员则type2，
						if(isOldMember){
							var type = 2
							var fromStr = isOldMember; //获取
						}
						else{
							var type = 0
							var fromStr = "其它"; //获取
						}


						//更新或写入用户数据
						userModel.createOneOrUpdate({
							_id:udoc.uobj._id,				
						},{						
							appUserName:qobj.appUserName,
							appUserMobile:qobj.appUserMobile,
							appUserSex:qobj.appUserSex || 1,
							appUserBirth:qobj.appUserBirth || '1970/1/1',
							userFrom:fromStr, //获取用户来源
							code1:qobj.code1,      //用户身份
						},function(err,doc){
							if(err) return cb(err);						

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

									//obj.checkRecommend(appId, udoc.uobj._id, qobj.appUserMobile);

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
	if(qobj.code1){
		userMObj.code1 = qobj.code1
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




obj.recommend = function(appId, userId, qobj, cb){

	var qobj = qobj || {}
	var recName = qobj.recName;
	var recSex = qobj.recSex || 1;
	var recTel = qobj.recTel;
	var recArea = qobj.recArea;
	var recPrice = qobj.recPrice;
	var recRoom = qobj.recRoom;
	var recCode1 = qobj.recCode1 || '';
	var recStatus = 1;

	if(!recName || recName.length>50){
		return cb('推荐人姓名有误')
	}
	if(recSex != 0 && recSex != 1){
		return cb('推荐人性别有误')
	}
	if(!recTel || recTel.length != 11 || recTel != recTel -0){
		return cb('手机号输入有误')
	}
	if(recArea == ''){
		return cb('面积输入有误')
	}
	if(recPrice != '' && recPrice != recPrice - 0){
		return cb('价格输入有误')
	}
	if(recRoom != '' && recRoom.length>50){
		return cb('房型输入有误')
	}

	recRecordModel.findByObj({
		recName:recName,
		recTel:recTel,
		recStatus:{
			'$ne':2
		},
	},function(err,list){
		if(err) return cb(err)
		if(list.length>0) return cb('此人已经被推荐过')

		//判断正常，将操作写入数据库
		recRecordModel.createOneOrUpdate({
			recName:recName,
			recTel:recTel,
			recStatus:{
				'$ne':2
			},
		},{
			appId:appId,
			userId:userId,
			recName:recName,
			recSex:recSex,
			recTel:recTel,
			recArea:recArea,
			recPrice:recPrice,
			recRoom:recRoom,
			recStatus:1,
			recCode1:recCode1,
			updateTime:new Date(),
			writeTime:new Date()
		},function(err,doc){
			if(err) return cb(err);
			cb(null, doc);
		})//end insert


	})//end findByObj


}



var record_status = [
	"无",
	"待审核",
	"审核不通过",
	"未到访",
	"已到访",
	"已认购",
	"已认购",
]

obj.getRecrecordByUserId = function(appId, userId, qobj, cb){
	
	var qobj = qobj || {}
	qobj.appId = appId;
	qobj.userId = userId;

	recRecordModel.findAll(qobj,0,500,function(err,list){
		if(err){
			return cb(err)
		}
		var tempary = []
		var ids = []
		list.forEach(function(o){
			o.comments = o.comments.sort(function(a,b){return 1})

			tempary.push({
				_id:o._id,
				appId:o.appId,
				userId:o.userId,
				recName:o.recName,
				recSex:o.recSex,
				recTel:o.recTel,
				recArea:o.recArea,
				recPrice:o.recPrice,
				recRoom:o.recRoom,
				recCode1:o.recCode1,
				recCode2:o.recCode2,
				recStatus:o.recStatus-0,
				Status:record_status[o.recStatus-0],
				comments:o.comments,
				isCash:o.isCash,
				cashStatus:0, //表示结佣状态，0表示不能结佣
				cashTransacId:'0',//表示结佣id
				writeTime:moment(o.writeTime).format('YYYY-MM-DD HH:mm:ss')
			})

			if(o.recStatus=='6'){
				ids.push(o._id);
			}

		})


		if(ids.length == 0){
			return cb(null, tempary)
		}
		//console.log(ids)
		recBankTransac.findByObj({
			"recRecords":{
				"$in":ids
			}
		},function(err,list2){
			if(err) return cb(err);
			if(list2.length == 0) return cb(null,tempary)			
				//console.log(list2)

				tempary.forEach(function(tempo){

					list2.forEach(function(listo2){

						if(tempo._id == listo2.recRecords){
							tempo.cashStatus = listo2.status
							tempo.cashTransacId = listo2._id						
						}

					})//end list2

				})//end tempary

				return cb(null,tempary)

		})//end recBankTransac


	})//end recRecordModel.findAll

}


var transac_status = [
	"无",
	"结佣申请 待审核",
	"结佣申请 审核不通过",
	"结佣申请 已受理",
	"结佣申请 已发放",
]

//根据获取结佣流水列表
obj.getTransacList = function(appId, userId, cb){

	recBankTransac.findByObj({
		appId:appId,
		userId:userId,
	},function(err,list){
		if(err) return cb(err)
		cb(null, list)
	})
}


//根据id获取结佣流水信息
obj.getTransacById = function(appId, userId, tranId, cb){

	recBankTransac.findOneByObj({
		_id:tranId,
		appId:appId,
		userId:userId,
	},function(err,o){
		if(err) return cb(err)
		if(!o) return cb('未找到结佣记录')

		var tranobj = {
			 userId:o.userId,
  			 recRecords:o.recRecords,
  			 cardNo:o.cardNo,
  			 bankName:o.bankName,
  			 trueName:o.trueName,
  			 idNumber:o.idNumber,
  			 cash:o.cash,
  			 status:o.status,
  			 statusName:transac_status[o.status-0],
  			 comment:o.comment,
  			 writeTime:moment(o.writeTime).format('YYYY-MM-DD HH:mm:ss')
		}

		recRecordModel.findOneByObj({
			_id:o.recRecords
		},function(err,o2){
			if(err) return cb(err)
			if(!o2) return cb('未找到相关推荐记录')
			tranobj.recName = o2.recName
			cb(null, tranobj)
		
		})//end recRecordModel.findOneByObj

	})// end recBankTransac.findOneByObj
}

//申请结佣业务
obj.createTransac = function(appId, userId, recRecordsId, cb){


	recBankTransac.findOneByObj({
		recRecords:recRecordsId,
		appId:appId,
	},function(err,tranobj){
		if(err) return cb(err)
		if(tranobj) return cb('此推荐记录已经申请过结佣')

		recBankTransac.createOneOrUpdate({
			recRecords:recRecordsId,
			appId:appId,
		},{
			userId:userId,
			recRecords:recRecordsId,
			appId:appId,
		},function(err,doc){
			console.log('4444444444')
			if(err) return cb(err)
			cb(null, doc)
		}) //end recBankTransac.createOneOrUpdate
	})//end recBankTransac.findOneByObj

}

//更新用户活跃时间
obj.updateActiveTime = function(appId, userId, cb){
	userAppModel.findOneByObj({
		userId:userId,
		appId:appId
	},function(err,appUDoc){
		if(err) return cb(err); //如果出错
		if(!appUDoc){
			return cb('update active error,not found user by userid='+userId)
		}
		userAppModel.createOneOrUpdate({
				userId:userId,
				appId:appId
			},{lastActiveTime:Date.now()},cb)
	})

}

//根据用户id获取新的推荐状态变更
obj.getRecNews = function(appId, userId, lastActiveTime,cb){

	recRecordModel.findAll({
		appId:appId,
		userId:userId,
		updateTime:{
			$gte:lastActiveTime
		}
	},0,100,function(err,doc){

		//获取完状态，异步更新用户活跃时间
		obj.updateActiveTime(appId, userId, function(err){
			if(err) global.logger.error('userBl.updateActiveTime'+err);
		})

		if(err) return cb(err);
		if(doc.length == 0) return cb(null,[]);

		var tempary = []
		var ids = []
		doc.forEach(function(o){
			o.comments = o.comments.sort(function(a,b){return 1})

			tempary.push({
				_id:o._id,
				appId:o.appId,
				userId:o.userId,
				recName:o.recName,
				recSex:o.recSex,
				recTel:o.recTel,
				recArea:o.recArea,
				recPrice:o.recPrice,
				recRoom:o.recRoom,
				recStatus:o.recStatus-0,
				Status:record_status[o.recStatus-0],
				comments:o.comments,
				isCash:o.isCash,
				cashStatus:0, //表示结佣状态，0表示不能结佣
				cashTransacId:'0',//表示结佣id
				writeTime:moment(o.writeTime).format('YYYY-MM-DD HH:mm:ss')
			})
		})
		return cb(null,tempary);
	})


}

module.exports = obj;