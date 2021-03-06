var userModel = require('../dl/userModel.js'); //加载用户模型

var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var starLogModel = require('../dl/starLogModel.js'); //打分的流水
var lotteryRecordModel = require('../dl/lotteryRecordModel.js'); //抽奖流水
var lotteryPrizeModel = require('../dl/lotteryPrizeModel.js'); //抽奖奖品


var fs = require('fs');
var path = require('path')
var iconv = require('iconv-lite');
var moment = require('moment');
var json2csv = require('json2csv');
var utils = require('../lib/utils.js');
var config = require('../config/config.js');
var nodemailer = require("nodemailer");
var node_schedule = require('node-schedule');
var async = require('async');


var obj = {}


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport({
    service: "QQ",
    auth: {
        user: config.MAIL_ACC,
        pass: config.MAIL_PWD
    }
});

console.log(config.MAIL_ACC)
console.log(config.MAIL_PWD)

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
					if(err){
						//如果出错就把这条纪录删了
						userAppModel.destroy({
							openId:openId,
						}, function(err, count){
							logger.error('*******')
							logger.error('delete openid: %s, count: %s, err: %s', openId, count, err);
							logger.error('*******')
						})
						return cb(err);
					} 
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


	if(qobj.appUserCode || qobj.appUserCode == ''){
		userMObj.appUserCode = qobj.appUserCode
	}
	if(qobj.appSmsCode){
		userMObj.appSmsCode = qobj.appSmsCode
	}
	if(qobj.appUserType){
		userMObj.appUserType = qobj.appUserType
	}
	if(qobj.code1){
		userMObj.code1 = qobj.code1
	}
	else{
		userMObj.code1 = Date.now() + '' + Math.random()
	}

	if(qobj.code2){
		userMObj.code2 = qobj.code2
	}


	//console.log(appMObj)

	/*
	userAppModel.createOneOrUpdate({
			userId:userId,
			openId:openId,
		},qobj,function(err,doc2){
			if(err) return cb(err);
	*/

	userModel.countAll({
		'code1': qobj.code1 || '-1'
	}, function(err, countYwy){
		if(err){
			//logger.error('wxuser.modify userModel.createOneOrUpdate error: %s', err);
			return cb(err);
		} 
		if(userMObj.appUserType && userMObj.appUserType == 2 && countYwy > 0){
			return cb('工号已经存在')
		}

		userMObj.appUserScore = 0;
		userModel.createOneOrUpdate({
				_id:userId
			},userMObj, function(err,doc){
				//出错一般是工号存在
				if(err){
					//logger.error('wxuser.modify userModel.createOneOrUpdate error: %s', err);
					return cb(err);
				} 
				cb(null,{
					'userObj':doc
					//'binderObj':doc2
				})//end cb		
		})//end userModel.createOneOrUpdate


	})
			
	//	})// end userAppModel.createOneOrUpdate 
}




//获得我的打分流水
obj.getMyStarLog = function(userId, toUserId, cb){

	starLogModel.findByObj({'fromUserId':userId, 'toUserId':toUserId}, function(err, docList){
		if(err) return cb(err)
		return cb(null, docList)
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
		//console.log(err,docList)
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
			//console.log(err,doc)
			if(err){
				return cb(err)
			}

			//然后给业务员打分，免去每次都groupby操作
			userModel.createOneOrUpdate({
				_id:toUserId
			}, {
				'$inc':{
					'appUserScore':score
				}
			}, function(err, doc){
				if(err) return cb(err)
				return cb(null, doc)
			}) // end userModel.createOneOrUpdate

			
		})//end starLogModel.insertOneByObj


	})//end obj.getMyStarLog


}





//获取当天新注册的用户excel表格
obj.getTodayUserRegAndMail = function(dayMoment, endMoment, cb){

	var result = []
	//获取当天的业务员信息
	userModel.findAll({
		'appUserType':1,
		'writeTime':{
			'$gte':dayMoment.format('YYYY/MM/DD HH:mm:ss'),
			'$lt':endMoment.format('YYYY/MM/DD HH:mm:ss')
		}
	},0,1000000,function(err, list){
		if(err){
			logger.error('obj.getTodayUserRegAndMail userModel.findAll got  error: %s', err);
			return cb(err)
		}

		if(list.length == 0){
			//obj.mailTo(0, false)
			return cb({
				'length':0
			})
		}

		var ywyIds = []

		list.forEach(function(item){
			if(ywyIds.indexOf(item.appUserCode) == -1){
				ywyIds.push(item.appUserCode)
			}
		})
		//console.log(ywyIds)

		userModel.getUserByIds(ywyIds, function(err, ywyList){
			if(err){
				logger.error('obj.getTodayUserRegAndMail userModel.getUserByIds got error: %s', err);
				return cb(err)
			}
			list.forEach(function(item){
				for(var i=0; i<ywyList.length;i++){
					//如果业务员id和用户id匹配
					if(item.appUserCode == ywyList[i].value.toString()){
						result.push({
							'name':item.appUserName+'',
							'mobile':item.appUserMobile+'',
							'ywy_name':ywyList[i].name,
							'ywy_gh':'gh '+ywyList[i].code1,
							'ywy_mobile':ywyList[i].mobile,
							'writeTime':moment(item.writeTime).format('YYYY/MM/DD HH:mm:ss').toString()
						})
						break;
					}
				}
				
			})

			//完成循环保存csv
			json2csv({data: result, fields: Object.keys(result[0] || {})}, function(err, csv) {
					  if(err){
							logger.error('obj.getTodayUserRegAndMail json2csv got error: %s', err);
							return cb(err)
						}
					  var saveExcelPath = path.join(__dirname,'..','upload')
					  var excelName = endMoment.format('YYYY-MM-DD') + '_userlist.csv'
					  var excelPath =  path.join(saveExcelPath, excelName)
					  try{
					  	//var buf = iconv.convert()
					  	var buf = iconv.encode(csv, 'gbk');
					  }
					  catch(e){
					  	logger.error('obj.getTodayUserRegAndMail  iconv.convert got error: %s', e);
					  	return cb(e)
					  }
					  
					  fs.writeFile(excelPath, buf, function (err) {
						  if(err){
								logger.error('obj.getTodayUserRegAndMail fs.writeFile got error: %s', err);
								return cb(err)
							}
							  //console.log('It\'s saved!');
							  //obj.mailTo(result.length, excelPath, excelName)
							  cb(null, {
							  		'length':result.length,
							  		'excelPath':excelPath,
							  		'excelName':excelName
							  })
						}); //end fs.writeFile
					  return
				});//end json2csv


		})//end userModel.getUserByIds
	})//end userModel.findAll

}



//获取业务员信息
var userHzType = {
	'tenyear':'十年用户',
	'gold':'金牌用户',
	'silver':'银牌用户',
	'other':'其他用户',
}

obj.getYwyInfo = function(ywyid, cb){

	var result = {}
	var prizeCount = 0 
	obj.getUserByUserId(ywyid, function(err, userObj){
		if(err) return cb(err)
		result.ywy = userObj.uobj
		if(userObj.uobj.appUserType != 2){
			return cb('非业务员无法查看信息')
		}

		//找到这个业务员名下的所有用户
		userModel.findAll({
			'appUserCode':ywyid,
			'appUserType':1,
		},0,100000, function(err, userList){
			if(err) return cb(err)
			result.users = []
			var userIds = []
			//获取所有用户的id列表
			userList.forEach(function(item){
				userIds.push(item._id.toString())
			})

			//查找所有这些用户的中奖记录
			lotteryRecordModel.findAll({
				'userId':{'$in':userIds},
				'prizeId':{'$ne':0}
			},0,100000,function(err, recordList){
				if(err) return cb(err)

				lotteryPrizeModel.findByObj({}, function(err, prizeList){
					if(err) return cb(err)

					userList.forEach(function(item){
						var hasPrize = 0
						var tempObj = {
							'appUserName':item.appUserName,
							'appUserMobile':item.appUserMobile,
						}
						for(var i=0; i<recordList.length; i++){
							if(recordList[i].userId == item._id.toString()){
								for(var j=0;j<prizeList.length;j++){
									if(prizeList[j]._id.toString() == recordList[i].prizeId){
											hasPrize = 1
											prizeCount++
											tempObj.prize = prizeList[j].name;
											break;
									}//end if
								}//end for
								tempObj['type'] = userHzType[recordList[i].code2]
								break;
							}//end if record
						}//end for

						if(hasPrize == 0){
							tempObj.prize = '未中奖'
						}
						
						tempObj['type'] = tempObj['type'] || '其他用户'

						result.users.push(tempObj)
					})//end for userList each

					result.prizeCount = prizeCount
					//响应出去
					return cb(null, result)


				})//end lotteryPrizeModel.findByObj

			})//end lotteryRecordModel.findAll

		})//end userModel.findAll

	})//end obj.getUserByUserId

}







//获取当天中奖的用户以及此用户的ywy的excel表格
obj.getTodayUserPrizeAndMail = function(dayMoment, endMoment, cb){

	var result = []


	//获取当天的业务员信息
	lotteryRecordModel.findAll({
		'prizeId':{'$ne':0},
		'writeTime':{
			'$gte':dayMoment.format('YYYY/MM/DD HH:mm:ss'),
			'$lt':endMoment.format('YYYY/MM/DD HH:mm:ss')
		}
	},0,1000000,function(err, list){
		

		if(err){
			logger.error('obj.getTodayUserPrizeAndMail lotteryRecordModel.findAll got  error: %s', err);
			return cb(err)
		}
		if(list.length == 0){
			//obj.mailTo(0, false)
			return cb({
				'length':0
			})
		}
		console.log('@@@@@@@@@@@@@@@@@@')
		console.log('list length', list.length)


		var userIds = []
		var prizeIds = []
		//获取用户和奖品id列表
		list.forEach(function(item){
			if(userIds.indexOf(item.userId) == -1){
				userIds.push(item.userId)
			}
			if(prizeIds.indexOf(item.prizeId) == -1){
				prizeIds.push(item.prizeId)
			}
		})

		console.log('userIds length', userIds.length)
		console.log('prizeIds length', prizeIds.length)

		//获取奖品列表
		lotteryPrizeModel.getPrizeByIds(prizeIds, function(err, prizeList){
				if(err){
					logger.error('obj.getTodayUserPrizeAndMail lotteryPrizeModel.getPrizeByIds got  error: %s', err);
					return cb(err)
				}

				console.log('prizeList length', prizeList.length)

				userModel.getUserByIds(userIds, function(err, userList){
				if(err){
					logger.error('obj.getTodayUserPrizeAndMail userModel.getUserByIds got error: %s', err);
					return cb(err)
				}

				
				console.log('userList length', userList.length)

				var result = []
				var ywyIds = []

				var userDict = {}
				userList.forEach(function(userItem){
					userDict[userItem.value.toString()] = userItem
				})


				console.log('convert userList to Dict')


				list.forEach(function(item){
					var userItem = userDict[item.userId]

					if(userItem){
						var tempObj = {
							'name':userItem.name+'',
							'mobile':userItem.mobile+'',
							'ywy_id':userItem.appUserCode,
							'writeTime':moment(item.writeTime).format('YYYY/MM/DD HH:mm:ss').toString()
						}
						if(ywyIds.indexOf(userItem.appUserCode) == -1 && userItem.appUserCode.length == 24){
							ywyIds.push(userItem.appUserCode)
						}
						
						//找到奖品名字
						prizeList.forEach(function(prizeItem){
							if(item.prizeId == prizeItem._id.toString()){
								tempObj.prize = prizeItem.name
							}

						})//end prizeList.forEach
						result.push(tempObj)
					}
					else{
						console.log('not found user', item.userId)
					}
					

				})//end list.forEach

				//console.log(ywyIds)
				//获取业务员信息

				console.log('ywyIds length', ywyIds.length)
				console.log('result length', result.length)

				userModel.getUserByIds(ywyIds, function(err, ywyList){
					if(err){
						logger.error('obj.getTodayUserPrizeAndMail ywy userModel.getUserByIds got error: %s', err);
						return cb(err)
					}

					console.log('ywyList length', ywyList.length)

					
					var ywyDict = {}
					ywyList.forEach(function(ywyItem){
						ywyDict[ywyItem.value.toString()] = ywyItem
					})

					console.log('convert ywyList to Dict')

					//填写业务员信息
					result.forEach(function(resultItem){

						var ywyItem = ywyDict[resultItem.ywy_id]
						if(ywyItem){
							resultItem.ywy_name = ywyItem.name
							resultItem.ywy_gh = 'gh '+ywyItem.code1
						}
						else{
							console.log('not found ywy', resultItem.ywy_id)
						}

					})//end result.forEach

					console.log('@@@@@@@@@@@@@@@@@@')

					json2csv({data: result, fields: Object.keys(result[0] || {})}, function(err, csv) {
							  if(err){
									logger.error('obj.getTodayUserPrizeAndMail json2csv got error: %s', err);
									return cb(err)
								}
							  var saveExcelPath = path.join(__dirname,'..','upload')
							  var excelName = endMoment.format('YYYY-MM-DD') + '_prizelist.csv'
							  var excelPath =  path.join(saveExcelPath, excelName)
							  try{
							  	//var buf = iconv.convert()
							  	var buf = iconv.encode(csv, 'gbk');
							  }
							  catch(e){
							  	logger.error('obj.getTodayUserPrizeAndMail  iconv.convert got error: %s', e);
							  	return cb(e)
							  }
							  
							  fs.writeFile(excelPath, buf, function (err) {
								  if(err){
										logger.error('obj.getTodayUserPrizeAndMail fs.writeFile got error: %s', err);
										return cb(err)
									}
									  //console.log('It\'s saved!');
									  //obj.mailTo(result.length, excelPath, excelName)
									  cb(null, {
									  		'length':result.length,
									  		'excelPath':excelPath,
									  		'excelName':excelName
									  })
								}); //end fs.writeFile
							  return
						});//end json2csv

				})//end userModel.getUserByIds ywy
			})//end userModel.getUserByIds user
		})//end lotteryPrizeModel.getPrizeByIds
	})//end lotteryRecordModel.findAll


}

//获取目前为止所有95515下面的客户及联系方式
obj.getAll95515Custom = function(cb){
	var getMobileType = require('../tools/hz_must_prize.js').getMobileType

	var result = []
	userModel.findOneByObj({
		'appUserMobile':'95515'
	}, function(err, doc){
		if(err) return cb(err)
		var ywy95515Id = doc._id.toString()

		userModel.findAll({
			'appUserCode':ywy95515Id
		},0,1000000, function(err, userList){
			if(err) return cb(err)
			//var iconv = new Iconv('UTF-8', 'GBK');
			userList.forEach(function(item){
				result.push({
					//'name':iconv.convert(item.appUserName.toString()),
					'name':item.appUserName+'',
					'mobile':item.appUserMobile+'',
					'ywy_id':item.appUserCode,
					'type':getMobileType(item.appUserMobile),
					'writeTime':moment(item.writeTime).format('YYYY/MM/DD HH:mm:ss')+''
				})
			})
			if(result.length == 0){
				//obj.mailTo(0, false)
				return cb({
					'length':0
				})
			}


			json2csv({data: result, fields: Object.keys(result[0] || {})}, function(err, csv) {
				  if(err){
						logger.error('obj.getAll95515Custom json2csv got error: %s', err);
						return cb(err)
					}
				  var saveExcelPath = path.join(__dirname,'..','upload')
				  var excelName = 'all_95515_user_list.csv'
				  var excelPath =  path.join(saveExcelPath, excelName)
				  try{
				  	//var buf = iconv.convert()
				  	var buf = iconv.encode(csv, 'gbk');
				  }
				  catch(e){
				  	logger.error('obj.getAll95515Custom  iconv.convert got error: %s', e);
				  	return cb(e)
				  }
				  
				  fs.writeFile(excelPath, buf, function (err) {
					  if(err){
							logger.error('obj.getAll95515Custom fs.writeFile got error: %s', err);
							return cb(err)
						}
					  //console.log('It\'s saved!');
					  cb(null, {
						  		'length':result.length,
						  		'excelPath':excelPath,
						  		'excelName':excelName
						  })
					});
				  return
			});//json to csv

		})//end userModel.findAll

	})//end userModel.findOneByObj


}







//获取当天的业务员注册excel表格
obj.getTodayYwyRegAndMail = function(dayMoment, endMoment, cb){
	if(!dayMoment){
		var dayMoment = moment().hour(0).minute(0).second(0)
	}
	if(!endMoment){
		var endMoment = moment().hour(23).minute(59).second(59) 
	}
	var result = []
	//获取当天的业务员信息
	userModel.findAll({
		'appUserType':2,
		'writeTime':{
			'$gte':dayMoment.format('YYYY/MM/DD HH:mm:ss'),
			'$lt':endMoment.format('YYYY/MM/DD HH:mm:ss')
		}
	},0,1000000,function(err, list){
		if(err){
			logger.error('obj.getTodayYwyRegAndMail userModel.findAll got  error: %s', err);
			return cb(err)
		}

		//var iconv = new Iconv('UTF-8', 'GBK');
		list.forEach(function(item){

			result.push({
				//'name':iconv.convert(item.appUserName.toString()),
				'name':item.appUserName+'',
				'mobile':item.appUserMobile+'',
				'gh':'gh '+item.code1,
				'wx':item.code2+'',
				'score':item.appUserScore,
				'writeTime':moment(item.writeTime).format('YYYY/MM/DD HH:mm:ss')+''
			})
		})

		//console.log(result)

		if(result.length == 0){
			//obj.mailTo(0, false)
			return cb({
				'length':0
			})
		}

		json2csv({data: result, fields: Object.keys(result[0] || {})}, function(err, csv) {
			  if(err){
					logger.error('obj.getTodayYwyRegAndMail json2csv got error: %s', err);
					return cb(err)
				}
			  var saveExcelPath = path.join(__dirname,'..','upload')
			  var excelName = endMoment.format('YYYY-MM-DD') + '_list.csv'
			  var excelPath =  path.join(saveExcelPath, excelName)
			  try{
			  	//var buf = iconv.convert()
			  	var buf = iconv.encode(csv, 'gbk');
			  }
			  catch(e){
			  	logger.error('obj.getTodayYwyRegAndMail  iconv.convert got error: %s', e);
			  	return cb(e)
			  }
			  
			  fs.writeFile(excelPath, buf, function (err) {
				  if(err){
						logger.error('obj.getTodayYwyRegAndMail fs.writeFile got error: %s', err);
						return cb(err)
					}
				  //console.log('It\'s saved!');
				  cb(null, {
					  		'length':result.length,
					  		'excelPath':excelPath,
					  		'excelName':excelName
					  })
				});
			  return
		});


	})

}

















obj.mailTo = function(excelList){


	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: "wuzh <"+config.MAIL_ACC+">", // sender address
	    to: "29132101@qq.com, jambo.cn@163.com, 53822985@qq.com, tianying@ulic.com.cn", // list of receivers
	    //to: "53822985@qq.com", // list of receivers
	    subject: "合众日报", // Subject line
	    //text: string, // plaintext body
	    html:'',
	}
	mailOptions.html += "当天共有 "+excelList['ywy'].length+" 业务员注册成功。</b><br/>"
	mailOptions.html += "当天共有 "+excelList['prize'].length+" 客户中奖。</b><br/>"
	mailOptions.html += "当天共有 "+excelList['user'].length+" 客户注册成功。</b><br/>"
	mailOptions.html += "截止当前共有 "+excelList['95515_user'].length+" 客户从十年合众账号入口注册。</b><br/>"

	 // html body
	mailOptions.attachments = []
	if(excelList['ywy'].length > 0){
		mailOptions.attachments.push({
				filename: excelList['ywy']['excelName'],
				content: fs.createReadStream(excelList['ywy']['excelPath'])
			})
	}
	if(excelList['prize'].length > 0){
		mailOptions.attachments.push({
				filename: excelList['prize']['excelName'],
				content: fs.createReadStream(excelList['prize']['excelPath'])
			})
	}
	if(excelList['user'].length > 0){
		mailOptions.attachments.push({
				filename: excelList['user']['excelName'],
				content: fs.createReadStream(excelList['user']['excelPath'])
			})
	}
	if(excelList['95515_user'].length > 0){
		mailOptions.attachments.push({
				filename: excelList['95515_user']['excelName'],
				content: fs.createReadStream(excelList['95515_user']['excelPath'])
			})
	}


	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, info){
		
		if(error){
			logger.error('smtpTransport.sendMail got error: %s', error);
			
		}else{
        	console.log('Message sent: ' + info.response);
   		}
	   	smtpTransport.close();
	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});

}



obj.sendMailJob = function(dayMoment, endMoment){


	var excelList = {}
	async.series([
		function(callback){
			obj.getTodayYwyRegAndMail(dayMoment, endMoment, function(err, dict){
				if(err) return callback(err)
				excelList['ywy'] = dict
				console.log(dict)
				callback()
			})
		},
		function(callback){
			obj.getTodayUserPrizeAndMail(dayMoment, endMoment, function(err, dict){
				if(err) return callback(err)
				excelList['prize'] = dict
				console.log(dict)
				callback()
			})
		},
		function(callback){
			obj.getTodayUserRegAndMail(dayMoment, endMoment, function(err, dict){
				if(err) return callback(err)
				excelList['user'] = dict
				console.log(dict)
				callback()
			})
		},
		function(callback){
			obj.getAll95515Custom(function(err, dict){
				if(err) return callback(err)
				excelList['95515_user'] = dict
				console.log(dict)
				callback()
			})
		},

	],function(err){
		if(err) return
		obj.mailTo(excelList)
	})


}




/*
setTimeout(function(){
	var s = moment('2015/5/23').hour(0).minute(0).second(0)
	var e = moment('2015/5/23').hour(23).minute(59).second(59)
	obj.sendMailJob(s, e)
},2000)
*/




//定义定时器
obj.setSchedule = function(){
	//定义规则
	//日计划
	var rule = new node_schedule.RecurrenceRule();
	rule.dayOfWeek = [new node_schedule.Range(0, 6)];
	rule.hour = 2;
	rule.minute = 10;

	var j = node_schedule.scheduleJob(rule, function(){

			var s = moment().add(-1, 'days').hour(0).minute(0).second(0)
			var e = moment().add(-1, 'days').hour(23).minute(59).second(59)

			console.log('^^^^^^^^^^^^^')
			console.log(s.toString())
			console.log(e.toString())
			console.log('^^^^^^^^^^^^^')
			
			if(obj.doSend){
				obj.sendMailJob(s, e)
			}
			//执行定时计划
	});


	//执行定时计划,周计划
	var rule2 = new node_schedule.RecurrenceRule();
	rule2.dayOfWeek = [new node_schedule.Range(0, 0)];
	rule2.hour = 10;
	var s2 = moment('2015/4/1')
	var e2 = moment().hour(0).minute(0).second(0)
	var j2 = node_schedule.scheduleJob(rule2, function(){
			console.log('^^^^^^^^^^^^^')
			console.log(s2.toString())
			console.log(e2.toString())
			console.log('^^^^^^^^^^^^^')
			if(obj.doSend){
				//obj.sendMailJob(s2, e2)
			}
			
	});

}

//只有一个

obj.setSchedule()
obj.doSend = false
//obj.doSend = true

module.exports = obj;