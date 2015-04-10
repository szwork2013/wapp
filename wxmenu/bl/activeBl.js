var request = require('request')
var async = require('async')
var fs = require('fs')
var child_process = require('child_process')

var userBl = require('./wxUser.js');
var userModel = require('../dl/userModel.js'); //加载用户模型

var activeModel = require('../dl/appActiveModel.js');
var activeLogModel = require('../dl/appActiveLogModel.js');

var appActivePrizeModel = require('../dl/appActivePrizeModel.js');
var appActivePrizeRecordModel = require('../dl/appActivePrizeRecordModel.js');

var guidModel = require('../dl/guidModel.js');
var moment = require('moment');
var utils = require('../lib/utils.js');



var obj = {}


//根据活动的ename查找活动
obj.getActiveByEname = function(activeEname,cb){
	if(!activeEname){
		return cb('wrong activeEname')
	}
	activeModel.findOneByObj({
		ename:activeEname,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc) return cb('not found active')
		cb(null,doc);
	})


}

obj.getIfHasAdd = function(activeId, fromOpenid, toUserId, cb){ //根据openid查找用户信息

	activeLogModel.findOneByObj({
		fromOpenId:fromOpenid,
		toUserId:toUserId,
		activeId:activeId
	},function(err,docRecord){
		if(err) return cb(err);

		if(!docRecord){
			return cb(null, docRecord)
		}

		activeModel.findOneByObj({
			_id:activeId,
			isShow:1
		},function(err,docActive){

			if(err) return cb(err);


			if(!docActive) return cb('not found active')
			//如果是正常的
			if(docActive.withDay == 0){
				cb(null, docRecord);
			}
			//每天来一发的
			else{
				
				//console.log(docRecord)
				var recordWriteTime = moment(docRecord.writeTime)
				var todayZero = moment().hour(0).minute(0).second(0)
				

				//如果今天投过票了
				if(recordWriteTime >= todayZero){
					cb(null, docRecord);
				}
				else{
					cb(null, null);
				}
			}
		})
			
	})

}


obj.getRankByActiveId = function(activeId, limit, cb){ //排名

	activeLogModel.getRankByActive(activeId,limit,function(err,list){
		//console.log(list)
		if(err) return cb(err);
		if(list.length == 0) return cb(null,[]);



		var uids = []
		list.forEach(function(o){
			uids.push(o._id)
		})
		userBl.getUserByIds(uids,function(err,ulist){
			if(err) return cb(err)
			if(ulist.length == 0){
				return cb('get user by ids error')
			}
			var tempList = []

			list.forEach(function(oActive){
				ulist.forEach(function(oUser){
					if(oActive._id == oUser.value){
						tempList.push({
							userId:oUser.value,
							supportCount:oActive.supportCount,
							supportScore:oActive.supportScore,
							userName:oUser.name,
							userMobile:oUser.mobile
						})
					}
				})
			}) //end uList foreach

			cb(null, tempList) //将列表返回出去

		})
	})

}


obj.getRankByEname = function(ename, limit, cb){ //排名,根据ename找

		obj.getActiveByEname(ename, function(err, aobj){
			if(err) return cb(err)
			if(!aobj) return cb('未找到活动')

			obj.getRankByActiveId(aobj._id, limit, cb)
		})

	}

obj.getCountByActiveIdAndToUserId = function(activeId, toUserId, cb){ //计算当前用户所有支持数
	
	//先查找活动id
	activeModel.findOneByObj({
		_id:activeId,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc) return cb('not found active')
		
		if(doc.useScore){//如果使用支持分数功能
			var supportCount = 0
			activeLogModel.findByObj({
				toUserId:toUserId,
				activeId:activeId
			},function(err,list){
				list.forEach(function(item){
					supportCount += (item.supportScore || 0)
				})
				cb(err,list.length, supportCount)

			})
		}
		else{
			//如果不使用支持分数
			activeLogModel.countAll({
				toUserId:toUserId,
				activeId:activeId
			},function(err,count){
				cb(err, count, 0)

			})
		}

	})//end activeModel.findOneByObj

}

var checkActiveTime = function(activeObj){
	var s = moment(activeObj.startTime)
	var e = moment(activeObj.endTime)
	var n = moment();

	if(s>n){
		return '活动还未开始'
	}
	if(e<n){
		return '活动已经结束'
	}

	return true
}



//删除重复获取range随机数的用户
obj.deleteRepeatUser = function(activeId, userId){

	activeLogModel.findByObj({
		'activeId':activeId,
		'toUserId':userId
	}, function(err, list){
		if(err) return;
		if(list.length == 0 || list.length == 1) return
		else{
			//如果有多条，则只留第一条
			list.forEach(function(item, i){
				if(i == 0) return
				activeLogModel.destroy({
					'_id':item._id
				},function(){})
			})
		}
	})

}



var overActiveList = ['wzzy_2014']
//添加一条记录
obj.addSupport = function(activeId, fromOpenId, fromUserId, toUserId, cb){
	
	if(!activeId || activeId.length != 24){
		return cb('activeId 错误')
	}
	if(!fromUserId || fromUserId.length != 24){
		return cb('fromUserId 错误')
	}
	if(!toUserId || toUserId.length != 24){
		return cb('toUserId 错误')
	}
	if(!fromOpenId){
		return cb('用户身份丢失,请重新进入')
	}

	activeModel.findOneByObj({
		_id:activeId,
		isShow:1
	},function(err,actdoc){
		if(err) return cb(err);
		if(!actdoc) return cb('没找到活动')

		var ckTime = checkActiveTime(actdoc)
		if(ckTime != true){
			return cb(ckTime)
		}
		//if(overActiveList.indexOf(doc.ename||'') != -1 ){
		//	return cb('活动已经结束了')
		//}

		userBl.getUserByOpenid(fromOpenId,function(err, uobj1){
			if(err) return cb(err);
			if(!uobj1) return cb('没找到访问用户')
			var uobj1 = uobj1.uobj
			//console.log(uobj1._id, fromUserId)
			if(uobj1._id != fromUserId) return cb('openid 和 userid 不符')

			userBl.getUserByUserId(toUserId,function(err, uobj2){
				if(err) return cb(err);
				if(!uobj2) return cb('没找到目标用户')
				
				//查找投票给这个用户的本活动的记录条数，如果是区间活动仅有一次机会
				activeLogModel.countAll({'activeId':activeId, 'toUserId':toUserId}, function(err, count){
					if(err) return cb(err)
					var toUserRecordCound = count

					//获取目前最高分数
					activeLogModel.getActiveMaxScoreList(activeId, function(err, maxDocList){
						if(err) return cb(err)
						if(!maxDocList || maxDocList.length == 0){
							var maxDocList = [0]
						}
						else{
							var maxDocList = maxDocList
						}

						var checkDeleteLog = false;

						obj.getIfHasAdd(activeId, fromOpenId, toUserId, function(err,doc){
							if(err) return cb(err)

							if(doc){
								if(actdoc.withDay == 1){//如果可以每天来支持一次的话
									var todayZero = moment().hour(0).minute(0).second(0)
									var lastWriteTime = moment(doc.writeTime)
									//审核通过，添加支持记录
									if(lastWriteTime>=todayZero){//如果最新一个支持记录在一天以内的
										return cb('不能重复支持，一天只能一次哦')
									}
				
								}
								else{
									//如果不是每天，则表示从头到位只能支持一次
									 return cb('不能重复支持')
								}
								
							}
							
							var supportScore = 0
							if(actdoc.useScore == 1){//如果是以积分的形式支持
								try{
									var scoreList = actdoc.scoreList.split(',')
								}
								catch(e){
									logger.error('actdoc.useScore split error:%s, scorelist: %s', e, scoreList)
									return cb('获取积分错误')
								}
								//分数计算

								//如果数组长度为2，则表示区间随机获取整数分数
								if(scoreList.length == 2){ 

									//如果是区间的，则限定一个活动只能支持一次
									if(toUserRecordCound>0){
										return cb('本活动仅能支持一次')
									}

									var min = scoreList[0] - 0
									var max = scoreList[1] - 0
									//支持分数为随机分数
									var randomScore = Math.ceil(Math.random()*(max-min+1)+min)
									while(true){
										//如果随机分数重复
										if(maxDocList.indexOf(randomScore) == -1 || randomScore == 1){
											break;
										}
										else{
											randomScore--
										}
									}		
									supportScore = randomScore
									checkDeleteLog = true
								}
								//如果长度不为2，则表示从数组中随机取一个数获得分数
								else{
									var pos = Math.floor(Math.random()*scoreList.length)
								
									if('undefined' == typeof scoreList[pos]){
										logger.error('actdoc.useScore get error, pos:%s, scorelist: %s', pos, scoreList)
										return cb('获取积分失败')
									}
									supportScore = scoreList[pos]
								}
								
							}


							if(actdoc.withDay == 1){
								activeLogModel.insertOneByObj({
									fromOpenId:fromOpenId,
									fromUserId:fromUserId,
									toUserId:toUserId,
									activeId:activeId,
									supportScore:supportScore,
									writeTime:new Date()
								},function(err,doc){
									cb(err,{
										supportScore:supportScore
									})
									if(checkDeleteLog){
										//检查是否有重复的条目
										obj.deleteRepeatUser(activeId, toUserId)
									}
								})
							}
							else{
								activeLogModel.createOneOrUpdate({
									fromOpenId:fromOpenId,
									fromUserId:fromUserId,
									toUserId:toUserId,
									activeId:activeId,
								},{
									fromOpenId:fromOpenId,
									fromUserId:fromUserId,
									toUserId:toUserId,
									activeId:activeId,
									supportScore:supportScore,
									writeTime:new Date()
								},function(err,doc){
									cb(err,{
										supportScore:supportScore
									})
									if(checkDeleteLog){
										//检查是否有重复的条目
										obj.deleteRepeatUser(activeId, toUserId)
									}
								})			
							}
							//end if else

						})//end getIfHasAdd

					})//end getActiveMaxScoreDoc

				})//end 获取用户活动记录条数

			})//end getUserByUserId

		})//end getUserByOpenid

	})//end findOneByObj
	
}




//获取奖品列表页我的兑奖记录
obj.getActivePrizeInfo = function(activeId, userId, cb){

	//查找奖品
	appActivePrizeModel.findByObj({
		activeId:activeId,
		isShow:1,
	},function(err, prizeList){
		if(err) return cb(err)
			//查找记录
		appActivePrizeRecordModel.findByObj({
			activeId:activeId,
			userId:userId,
		},function(err,recordList){
			if(err) return cb(err)
				//返回数据
			cb(null,{
				prizeList:prizeList,
				myPrizeList:recordList
			})
		})//end appActivePrizeRecordModel
	})//end appActivePrizeModel

}

//执行兑奖流程
obj.exchangePrize = function(qobj,cb){
	var prizeId = qobj.prizeId
	var userId = qobj.userId
	var truename = qobj.truename
	var mobile = qobj.mobile
	var appHome =qobj.appHome || ''

	if(!prizeId || prizeId.length !=24){
		return cb('prizeId 有误')
	}
	if(!userId || userId.length !=24){
		return cb('prizeId 有误')
	}
	if(!truename || truename.length >50){
		return cb('姓名输入有误')
	}
	if(!mobile || !/^[0-9]{11}$/.test(mobile)){
      return cb('手机号码输入有误')
    }

   // if(appHome && appHome != '' && !/^(\w+)#(\w+)$/.test(appHome)){
     // return cb('房号楼号输入有误')
    //}

	//获取奖品对象
	appActivePrizeModel.findOneByObj({
		_id:prizeId,
		isShow:1
	},function(err, prizeObj){
		if(err) return cb(err)
		if(!prizeObj) return cb('未找到奖品')
		var activeId = prizeObj.activeId;
		//将activeId写入qobj
		qobj.activeId = activeId;

		//获取活动对象
		activeModel.findOneByObj({
			_id:activeId,
			isShow:1
		},function(err, activeObj){
			if(err) return cb(err)
			if(!activeObj) return cb('未找到活动')

			//检查活动是否未开始或已经结束
			var ckTime = checkActiveTime(activeObj)
			if(ckTime != true){
				return cb(ckTime)
			}

			//获取兑奖记录
			appActivePrizeRecordModel.findByObj({
				activeId:activeId,
				userId:userId,
			},function(err,recordList){
				if(err) return cb(err)
				
				//获取支持数
				obj.getCountByActiveIdAndToUserId(activeId, userId, function(err, userCount, supportScore){
						if(err) return cb(err)

						//如果活动不能兑奖
						if(activeObj.isPrize == 0){
							return cb('此活动无法兑奖')
						}
						//如果没有奖品库存
						if(prizeObj.totalNumber <= prizeObj.countNum){
							return cb('此奖品已经兑换完毕')
						}
						//如果用户超过了兑奖次数限制
						if(recordList.length >= activeObj.prizeAmount){
							return cb('超过兑奖次数')
						}

						if(activeObj.useScore == 1){//如果使用积分
							var userScore = supportScore + activeObj.minSupportScore
							if(userScore < prizeObj.price){
								return cb('支持不够，无法兑换本奖品')
							}
						}
						else{//不使用积分，常规支持一条算一次
							//如果未达到兑奖奖品的支持数
							if(userCount < prizeObj.price){
								return cb('支持数不够，无法兑换本奖品')
							}
						}
						

						//达成条件去兑换奖品
						obj.savePrize(qobj, cb)

				})//end obj.getCountByActiveIdAndToUserId
			})//end appActivePrizeRecordModel
		})//end activeModel.findOneByObj
	})//end appActivePrizeModel.findOneByObj

}


//保存兑奖信息
obj.savePrize = function(qobj, cb){
	//第一步，更新奖品数量
	appActivePrizeModel.createOneOrUpdate({
		_id:qobj.prizeId
	},{
		$inc:{countNum:1},
	},function(err){
		if(err) return cb(err)
		//第二部，更新获奖记录
		//获取兑奖流水号
		guidModel.getGuid(function(err,guid){
			if(err) return cb(err)

			//写入兑奖记录
			appActivePrizeRecordModel.insertOneByObj({
				activeId:qobj.activeId,
				prizeId:qobj.prizeId,
				userId:qobj.userId,
				truename:qobj.truename,
				mobile:qobj.mobile,
				recordIp:qobj.recordIp,
				code2:qobj.appHome,
				giftId:guid,
				writeTime:new Date()
			},function(err,record){
				//写入成功回调

				//然后去修改用户的资料
				userModel.createOneOrUpdate({
					_id:qobj.userId,
				},{
					appUserName:qobj.truename,
					appUserMobile:qobj.mobile
				},function(err,obj){

					if(err) return cb(err)
					cb(null, record)

				})//end userModel.createOneOrUpdate
			})//end appActivePrizeRecordModel
		})//end guidModel.getGuid
	})//end appActivePrizeModel.createOneOrUpdate
}

obj.getActiveRangeRank = function(activeId, limit, cb){
	activeModel.findOneByObj({
		_id:activeId,
		isShow:1
	},function(err,actdoc){
		if(err) return cb(err);
		if(!actdoc) return cb('没找到活动')

		activeLogModel.getRank(activeId, limit, function(err, logList){
			if(err) return cb(err);
			if(logList.length == 0) return cb(null, logList)

			var toUserIdList = []
			logList.forEach(function(item){
				toUserIdList.push(item.toUserId)
			})

			userModel.getUserByIds(toUserIdList, function(err, userList){
				if(err) return cb(err);
				var resultList = []
				logList.forEach(function(logItem,i){
					userList.forEach(function(userItem){
						//匹配到用户
						if(logItem.toUserId == userItem.value.toString()){
							resultList.push({
								appUserName:userItem.name,
								userId:logItem.toUserId,
								name:userItem.name,
								sex:userItem.sex,
								mobile:userItem.mobile,
								wxName:userItem.wxName,
								wxAvatar:userItem.wxAvatar,
								wxAddress:userItem.wxAddress,
								supportScore:logItem.supportScore,
								pos:(i+1),
							})
						}
					})
				})
				//console.log(resultList)
				return cb(null, resultList)

			})


		})
	})

}








obj.getActiveNewMember = function(activeId, limit, cb){
	activeModel.findOneByObj({
		_id:activeId,
		isShow:1
	},function(err,actdoc){
		if(err) return cb(err);
		if(!actdoc) return cb('没找到活动')


		activeLogModel.countAll({
			'activeId':activeId
		},function(err, countNum){
			if(err) return cb(err);
		

				activeLogModel.findAll({
					'activeId':activeId
				},0,limit,function(err, logList){

						if(err) return cb(err);
						if(logList.length == 0) return cb(null, {
								'data':[],
								'count':0,
							})

						var fromUserIdList = []
						logList.forEach(function(item){
							fromUserIdList.push(item.fromUserId)
						})

						userModel.getUserByIds(fromUserIdList, function(err, userList){
							if(err) return cb(err);
							var resultList = []
							logList.forEach(function(logItem,i){
								userList.forEach(function(userItem){
									//匹配到用户
									if(logItem.toUserId == userItem.value.toString()){
										resultList.push({
											appUserName:userItem.name,
											userId:logItem.toUserId,
											name:userItem.name,
											sex:userItem.sex,
											mobile:userItem.mobile,
											wxName:userItem.wxName,
											wxAvatar:userItem.wxAvatar,
											wxAddress:userItem.wxAddress,
											supportScore:logItem.supportScore,
											pos:(i+1),
										})
									}
								})//end userList.forEach
							})//end logList.forEach

							//console.log(resultList)
							return cb(null, {
								'data':resultList,
								'count':countNum,
							})

						})//end userModel.getUserByIds


				})//end activeLogModel.findAll

		})//end activeLogModel.countAll

	})//end activeModel.findOneByObj

}




//获得某一个活动所有记录条目
obj.countActiveLog = function(activeId, cb){
	activeLogModel.countAll({
		'activeId':activeId
	}, cb)
}










//根据活动的ename，打包参与用户的头像
obj.saveAvatarAndName = function(ename, cb){


	obj.getActiveByEname(ename, function(err, aobj){
		if(err) return cb(err)
		if(!aobj) return cb('未找到活动')
		var activeId = aobj._id

		activeLogModel.findAll({
			'activeId':activeId
		}, 0, 2000, function(err, logList){
			if(err) return cb(err);
			if(logList.length == 0) return cb('还没有会员参与')

			var fromUserIdList = []
			logList.forEach(function(item){
				fromUserIdList.push(item.fromUserId)
			})

			userModel.getUserByIds(fromUserIdList, function(err, userList){
				if(err) return cb(err);
				var resultList = []
				logList.forEach(function(logItem,i){
					userList.forEach(function(userItem){
						//匹配到用户
						if(logItem.toUserId == userItem.value.toString()){
							resultList.push({
								appUserName:userItem.name,
								userId:logItem.toUserId,
								name:userItem.name,
								sex:userItem.sex,
								mobile:userItem.mobile,
								wxName:userItem.wxName,
								wxAvatar:userItem.wxAvatar,
								wxAddress:userItem.wxAddress,
								supportScore:logItem.supportScore,
								pos:(i+1),
							})
						}
					})
				})

				//将查出的用户资料数组，丢入工厂函数，去下载并打包头像
				obj._saveUserAvatar(resultList, cb)

			})


		})
	})
}








//去下载并打包头像
obj._saveUserAvatar = function(userList, cb){
	var dealFunc = []
	var saveFolder = '/tmp/avatar/'

	//先删除目录，然后创建目录
	child_process.exec('rm -rf '+saveFolder, function(error, stdout, stderr){
			console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	})
	child_process.exec('rm -rf /var/nodejs/wapp/wxmenu/manager/static/avatar.tar.gz', function(error, stdout, stderr){
			console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
	})

	setTimeout(function(){
			fs.mkdirSync(saveFolder)
			var errorCount = 0
			//循环遍历userList
			userList.forEach(function(userObj){
				//将异步方法丢入数组，供async调用
				dealFunc.push(function(callback){
					
					//保存头像
					var ws = fs.createWriteStream(saveFolder+userObj.wxName+'.jpg');
					ws.on('error', function(err) {
						errorCount++
						callback()
					});
					ws.on('end', function(err){
						callback()
					})
					request(userObj.wxAvatar).pipe(ws);

				})

			})

			async.series(dealFunc, function(err){
				if(err) return cb('保存出错了')
				//如果没出错，那么把这个文件夹打包，放入static目录下，供下载
				var cmd = 'tar -zcvf /var/nodejs/wapp/wxmenu/manager/static/avatar.tar.gz  -C '+saveFolder+' .'
				//执行shell命令打包文件夹
				child_process.exec(cmd,  function(error, stdout, stderr){
						console.log('stdout: ' + stdout);
					    console.log('stderr: ' + stderr);
					    if (error !== null) {
					      console.log('exec error: ' + error);
					    }
					    return cb(null, {
							error:errorCount,
							url:'/static/avatar.tar.gz'
						})
				})
				
			})

	}, 500)

}



module.exports = obj;