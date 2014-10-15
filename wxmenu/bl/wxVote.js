var moment = require('moment');
var async = require('async');
var node_schedule = require('node-schedule');
var userBl = require('./wxUser.js'); //加载用户Bl
var guidModel = require('../dl/guidModel.js'); //guid 模型
var utils = require('../lib/utils.js');

var voteGroup = require('../dl/voteGroupModel.js'); //投票分组模型
var voteItem = require('../dl/voteItemModel.js'); //投票项模型
var vote = require('../dl/voteModel.js'); //投票模型
var voteRecord = require('../dl/voteRecordModel.js'); //投票记录模型


var obj = {}

//根据英文短名获取抽奖信息
obj.getVoteByEname = function(voteEname,cb){
	if(!voteEname) return cb('no voteEname');
	vote.findOneByObj({
		ename:voteEname,
		isShow:1,
	},function(err,doc){
		cb(err,doc)
	})
}
//根据id获取抽奖信息
obj.getVoteById = function(voteId,cb){
	if(!voteId) return cb('no voteId');
	vote.findOneByObj({
		_id:voteId,
		isShow:1,
	},function(err,doc){
		cb(err,doc)
	})
}

//获取我的投票记录分组group
obj.getUserRecordGroupByItemId = function(voteid, userid, cb){
	if(!voteid) return cb('no voteId');
	if(!userid) return cb('no userid');

	voteRecord.aggregateRecord({
		voteId:voteid,
		userId:userid,
	},function(err, recordList){
		if(err) return cb(err);
		//console.log(recordList)
		if(recordList.length == 0) return cb(null, []);
		//生成数组ids
		var ids = [];
		recordList.forEach(function(recordObj){
			ids.push(recordObj._id.toString())
		})//end voteRecord.aggregateRecord,

		var tempList = []
		voteItem.getByIds(ids,function(err,itemlist){
			if(err) return cb(err);
			recordList.forEach(function(robj){

				itemlist.forEach(function(listobj){
					if(robj._id.toString() == listobj._id.toString()){
						//放入临时数组
						tempList.push({
							_id:listobj._id.toString(),
							appId:listobj.appId,
							voteId:listobj.voteId,
							groupId:listobj.groupId,
							title:listobj.title,
							pictureThumb:listobj.pictureThumb,
							picture:listobj.picture,
							sex:listobj.sex,
							age:listobj.age,
							number:listobj.number,
							desc:listobj.desc,
							desc2:listobj.desc2,
							todayVoteNumber:listobj.todayVoteNumber,
							lastdayVoteNumber:listobj.lastdayVoteNumber,
							lastdayVoteOrder:listobj.lastdayVoteOrder,
							myNumber:robj.supportCount || 0, //我的票数
							isFreez:listobj.isFreez,
							code1:listobj.code1,
							code2:listobj.code2,
							code3:listobj.code3,
							code4:listobj.code4,
							writeTime:listobj.writeTime,
						})
					}
				})//end recordList.forEach
				
			})//end itemlist.forEach

			cb(null, tempList)//返回生成数组

		})//end voteItem.getByIds

	})
}


obj.countUsersByGroupIds = function(groupids, cb){
	var dealFuc = []
	//循环处理groupid回调
	var groupCountList = []
	groupids.forEach(function(gid){
		dealFuc.push(function(callback){
			voteItem.countAll({
				groupId:gid,
				isShow:1,
			},function(err,countNum){
				if(err) callback(err)
				groupCountList.push({
					groupId:gid,
					count:countNum
				})
				callback();
			})
		})
	})//end 处理回调

	//执行异步方法
	async.series(dealFuc, function(err){
		if(err) cb(err)
		cb(null, groupCountList)
	})

}



obj.countUserJoinByGroupIds = function(groupids, cb){
	var dealFuc = []
	//循环处理groupid回调
	var groupJoinList = []


	groupids.forEach(function(gid){
		var gid = gid.toString();

		dealFuc.push(function(callback){		
			voteItem.findByObj({
				groupId:gid,
				isShow:1,
			},function(err,itemList){
				if(err) callback(err)
				var ids = []
				var dealFunc2 = [];
				var groupJoinCount = 0

				//对这个分组下所有的被投票项进行循环
				itemList.forEach(function(itemo){

					//将处理方法写入数组
					dealFunc2.push(function(callback2){

						voteRecord.aggregateUserJoin({
							voteId:itemo.voteId
						},function(err,list){
							if(err) callback2(err)
							groupJoinCount += list.length  //累计增加分组计数
							callback2()
						})

					})
				})// end foreach

				//执行async异步方法
				async.series(dealFunc2,function(err){
					if(err) callback(err)
					groupJoinList.push({
						groupId:gid,
						groupJoinCount:groupJoinCount
					})
					callback();
				})

			})//end voteItem.findByObj
		})//end push dealFuc.push(function(callback){

	})//end 处理回调

	//执行异步方法
	async.series(dealFuc, function(err){
		if(err) cb(err)
		cb(null, groupJoinList)
	})

}



//根据用户Id和投票Id查找他的记录
obj.getUserVoteRecById = function(uid, voteId, gttime, skip, pagesize, cb){ 
	var cb = cb || function(){};
	var skip = skip || 0;
	var pagesize = pagesize || 50; 

	if(!uid) return cb('no uid');
	if(gttime){
		var q = {
			userId:uid,
			voteId:voteId,
			writeTime:{'$gt': gttime}
		}
	}
	else{
		var q = {
			userId:uid,
			voteId:voteId
		}
	}


	voteRecord.findAll(q, skip, pagesize, function(err,list){
		if(err){
			return cb(err)
		}
		return cb(null, list)
	})
}

//根据voteid获取分组信息列表
obj.getGroupByVoteId = function(voteid, cb){
	var cb = cb || function(){};
	if(!voteid) return cb('no voteid');
	voteGroup.findByObj({
		voteId:voteid,
		isShow:1
	},function(err,list){
		//排序
		list = list.sort(function(a,b){
			if(a.todayVoteNumber > b.todayVoteNumber){
				return false;
			}
			return true;
		})
		cb(err,list)
	})
}




//根据itemid查找item信息
obj.getItemByItemId = function(ItemId, cb){

	voteItem.findOneByObj({
		_id:ItemId,
		isShow:1
	},function(err, itemobj){
		cb(err, itemobj)
	})

}

obj.getItemVoteCountsByIds = function(itemids, cb){
	if(itemids.length == 0) return cb(null, [])
	
	var countFn = []
	var result = []

	itemids.forEach(function(itemid){
		//放置每步的count函数
		var itemid = itemid;
		countFn.push(function(callback){

			voteRecord.countAll({
				itemId:itemid
			},function(err, count){
				if(err) return callback(err)
				result.push({
					itemId:itemid,
					count:count
				})
				callback()

			})//end countAll

		})//end push

	}) //end itemids.forEach

	async.series(countFn, function(err){
		if(err) return cb(err)
		cb(null, result)
	})


}






//根据分组groupid获取分组被投票项列表
obj.getItemByGroupId = function(voteid, groupid, cb){
	var cb = cb || function(){};

	//当不传递groupid,则表示查询所有分组的被投票项
	if(!groupid){
		var q = {
			voteId:voteid, 
			isShow:1 
		}
		var q2 = {
			voteId:voteid,
			isShow:1
		}
	} 
	else{
		var q = { 
			voteId:voteid,
			isShow:1,
			groupId:groupid
		}
		var q2 = {
			_id:groupid,
			voteId:voteid,			
			isShow:1
		}
	}

	voteItem.findByObj(q, function(err,list){
		if(err) return cb(err);
		if(list.length == 0) return cb(null, []);
		//查询分组信息
		voteGroup.findByObj(q2,function(err,grouplist){
			if(err) return cb(err);
			if(grouplist.length == 0) return cb(null, []);
			//开始筛选分组信息
			var tempList = []
			var ids = []
			list.forEach(function(listobj){

				grouplist.forEach(function(groupobj){
					if(groupobj._id.toString() == listobj.groupId){
						ids.push(listobj._id.toString())
						tempList.push({
							_id:listobj._id.toString(),
							appId:listobj.appId,
							voteId:listobj.voteId,
							groupId:listobj.groupId,
							groupName:groupobj.title,
							title:listobj.title,
							pictureThumb:listobj.pictureThumb,
							picture:listobj.picture,
							sex:listobj.sex,
							age:listobj.age,
							number:listobj.number,
							desc:listobj.desc,
							desc2:listobj.desc2,
							todayVoteNumber:listobj.todayVoteNumber,
							lastdayVoteNumber:listobj.lastdayVoteNumber,
							lastdayVoteOrder:listobj.lastdayVoteOrder,
							totalNumber:0, //总投票数
							isFreez:listobj.isFreez,
							code1:listobj.code1,
							code2:listobj.code2,
							code3:listobj.code3,
							code4:listobj.code4,
							writeTime:listobj.writeTime,
						})
					}
				})
			})//end forEach
			//将分组isshow为-1的被投票项剔除
			if(tempList.length == 0){
				 return cb(null, []);
			}

			obj.getItemVoteCountsByIds(ids, function(err, itemCountList){
				if(err) return cb(err)
				//生成totalNumber
				tempList.forEach(function(tempo){
					itemCountList.forEach(function(icounto){
						if(tempo._id == icounto.itemId){
							tempo.totalNumber = icounto.count
						}
					})
				})//end tempList.forEach

				//排序
				list = tempList.sort(function(a,b){
					if(a.totalNumber > b.totalNumber){
						return false;
					}
					return true;
				})
				cb(null,list)

			}) //end obj.getItemVoteCountsByIds

		})//end voteGroup.findByObj

	})//end voteItem.findByObj
}


//根据voteid和groupid查找item排行
obj.getRankByVoteIdGroupId=  function(voteid, groupid, cb){
	var cb = cb || function(){};
	var query = {
		voteId:voteid
	};
	if(groupid){
		query.groupId = groupid;
	}
	//分组计算
	voteRecord.aggregateOrder(query, function(err,list){
			if(err) return cb(err);
			var itemsIds = [];
			list.forEach(function(listobj){
				itemsIds.push(listobj._id.toString());
			})
			//根据items的id查找item的信息
			voteItem.getByIds(itemsIds, function(err, ilist){
				if(err) return cb(err);
				list.forEach(function(listobj){
					ilist.forEach(function(iobj){
						if(listobj._id.toString() == iobj._id.toString()){
							listobj.itemName = iobj.title;
						}
					})//end iobj.forEach
				})//end list.forEach

				cb(null, list)

			})//end voteItem.getByIds
	})//end voteRecord.aggregateOrder

}



//根据voteid查找所有分组在 lastTimeStamp 之后的投票数量
obj.getGroupCountByVoteId = function(voteid, lastTimeStamp, cb){
	var cb = cb || function(){};
	if(!voteid) return cb('no voteid');
	if(!lastTimeStamp){
		var lastTimeStamp = Date.now() - 24*3600*1000;
	}
	if('number' != typeof lastTimeStamp ){
		return cb('lastTimeStamp error')
	}
	var lastTime = new Date(moment(lastTimeStamp).format('YYYY/MM/DD HH:mm:ss'));

	obj.getGroupByVoteId(voteid, function(err, grouplist){
		if(err) return cb(err);
		var groupIds = []
		grouplist.forEach(function(gobj){
			groupIds.push(gobj._id.toString());
		})
		var groupCountArray = []

		var groupCountFn = function(groupid, cb2){
			voteItem.find({
				groupId:groupid
			},function(err, ilist){
				if(err) return cb2(err)
				var itemIds = []
				ilist.forEach(function(iobj){
					itemIds.push(iobj._id.toString());
				})//end ilist.forEach

				voteRecord.countByItemIds(itemIds, lastTime, function(err,count){
					if(err) return cb2(err)
					groupCountArray.push({
						groupid:groupid,
						count:count
					})
					cb2();//执行回调函数
				})// end voteGroup.countByItemIds
			})//end voteItem.find
		}

		//拼凑异步方法数组
		var fnList = [];
		//groupids循环
		groupIds.forEach(function(groupid){
			var groupid = groupid;
			fnList.push(function(callback){
				groupCountFn(groupid, callback)
			})
		})
		//利用异步库
		async.series(fnList, function(err){
			if(err) return cb(err)
			cb(null, groupCountArray)
		})

	})//end obj.getGroupByVoteId

}




//用户ajax开始投票，要对其做各种约束
obj.startVote = function(itemid, userid, ip, isforward, cb){
	//判断itemid和userid是否合法
	if(!itemid || itemid.length != 24){
		return cb('error itemid')
	}
	if(!userid || userid.length != 24){
		return cb('error userid')
	}

	//查找itemid是否存在
	obj.getItemByItemId(itemid, function(err, itemobj){
		if(err) return cb(err)
		//如果没有找到itemobj对象
		if(!itemobj) return cb('未找到投票对象')
		var voteid = itemobj.voteId
		var groupid = itemobj.groupId
		var appid = itemobj.appId
		//获取vote信息
		obj.getVoteById(voteid, function(err, voteobj){
			if(err) return cb(err)
			if(!voteobj) return cb('未找到投票活动')
			//获取分组信息
			voteGroup.findOneByObj({
				_id:groupid,
				isShow:1
			},function(err,groupobj){
				if(err) return cb(err)
				if(!voteobj) return cb('未找到所在分组')

				//首先判断活动是否已经结束或未开始
				var now = Date.now();
				var s = Date.parse(voteobj.startTime)
				var e = Date.parse(voteobj.endTime)
				if(now < s) return cb('活动还没开始')
				if(now > e) return cb('活动已经结束')
				//end

				//判断分组是否冻结
				if(groupobj.isFreez == 1) return cb('投票已经冻结')
				//end

				//判断被投票项是否已经冻结
				if(itemobj.isFreez) return cb('投票已冻结')
				//end

				//判断是否使用isforward转发，但是本活动未开启转发功能
				if(isforward && voteobj.forwardTimes<=0) return cb('本活动无法增加抽奖次数')
				//end

				//抽奖次数判断，先定义可以抽奖的次数
				if(voteobj.forwardTimes > 0){
					var limit = voteobj.intervalTimes + voteobj.forwardTimes;
				}
				else{
					var limit = voteobj.intervalTimes;
				}
				//end


				//是否按自然天来分割投票的间隙控制
				var interval = voteobj.interval*60*60*1000; //将小时转换成毫秒
				var isDay = false;
				if(voteobj.interval >= 24){ 
				//当后台设置时间间隔大于等于24小时，则表示按自然天来计算
					isDay = true;
				}

				//这个用户，最新的limit条查找记录
				voteRecord.findAll({
					userId:userid,
					voteId:voteid
				},0,limit,function(err,recList){
					if(err) return cb(err)
					//如果记录为0，则表示此用户从未投票过，则直接进入投票成功函数
					if(recList.length == 0) return obj.voteSuccessProcess(appid, voteid, groupid, itemid, userid, ip, isforward, cb)

					if(recList.length >= limit){

						//否则要做一些limit的限制
						//1、是否超过投票间隔限制判断
						var pos = limit - 1;
						var olderRec = recList[pos];
						var olderTimestamp = Date.parse(olderRec.writeTime);
						var now = Date.now();
						//如果时间超过24小时，表示自然天间隔
						if(isDay){
							var olderMoment = moment(olderRec.writeTime).hour(0).minute(0).second(0);
							//将moment对象转换为unix时间戳
							olderTimestamp = olderMoment.unix()*1000;
						}
						//如果在这个间隔时间段内，已经超过最多参与次数了
						if(now - olderTimestamp <= interval){
							return cb('超过最大投票次数')
						}
						//end 1 判断
					}

					//2、判断是否对某一个人在间隔时间次数投票过多
					var count = 0;
					recList.forEach(function(recobj){
						if(isforward && recobj.itemId == itemid && recobj.isForward == 1){
							 count++
						}
						else if(!isforward && recobj.itemId == itemid){
							 count++
						} 
					})

					if(voteobj.intervalPerUserTimes > 0 && count >= voteobj.intervalPerUserTimes){
						return cb('不能重复投票')
					}
					//end 2 判断

					//所有判断都通过，开始进入成功后的流程
					return obj.voteSuccessProcess(appid, voteid, groupid, itemid, userid, ip, isforward, cb)

				})//end voteRecord.findAll
			})//end voteGroup.findOneByObj
		})//end obj.getVoteById
	})//end obj.getItemByItemId
}



obj.voteSuccessProcess = function(appid, voteid, groupid, itemid, userid, ip, isforward, cb){

	var insertObj = {
		appId:appid,
		voteId:voteid,
		itemId:itemid,
		userId:userid,
		recordIp:ip,
		isForward:isforward || 0,
		writeTime:new Date()
	}
	//插入流水
	voteRecord.insertOneByObj(insertObj, function(err, record){
		if(err){
			logger.error('voteRecord.insertOneByObj insert error: ', err);
			return cb(err);
		}


		//更新item数据
		voteItem.createOneOrUpdate({
			_id:itemid
		},{
			'$inc':{todayVoteNumber:1}
		}, function(err,itemobj){
			if(err){
				logger.error('voteItem.createOneOrUpdate error and recordid: ', err, record._id.toString());
				return cb(err);
			}
			//更新成功，返回记录
			obj.checkIsCheat(voteid, itemid, ip)
			cb(null, record)
		})//end voteItem.createOneOrUpdate
	})//end voteRecord.insertOneByObj
}




//检查改被投票项是否作弊
obj.checkIsCheat = function(voteid, itemid, ip){
	//如果ip未捕获到，则不检查
	//if(ip == '127.0.0.1') return;

	voteRecord.countAll({
		voteId:voteid,
		itemId:itemid,
		recordIp:ip
	},function(err, countNum){
		if(err) return;
		if(countNum == 0) return;
		obj.getVoteById(voteid, function(err, voteobj){
			if(err) return;
			if(!voteobj) return;
			var now = Date.now();
			var s = Date.parse(voteobj.startTime)
			var interval = voteobj.interval*60*60*1000;
			var intervalTimes = voteobj.intervalTimes;
			var gapTimes = Math.ceil((now - s) / interval)
			//console.log(gapTimes)
			//判断是否可能存在作弊
			if(countNum >= gapTimes*intervalTimes*3){
				//更新item记录，做出警告
				voteItem.createOneOrUpdate({
						_id:itemid
					},{
						code1:'同一ip投票超过正常3倍'
					}, function(err,itemobj){
						if(err) return cb(err);
					})//end voteItem.createOneOrUpdate
			}
			return;
		})
	})


}






obj.scheduleJob = function(){
	var nowS = Date.now();
	var s = new Date(moment().add(-1, 'days').startOf('day').format('YYYY/MM/DD HH:mm:ss'));
	var e = new Date(moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'));

	//循环处理item的update
	var updateItem = function(itemid, count, pos , callback){
		voteItem.createOneOrUpdate({
			_id:itemid
		},{
			todayVoteNumber:0,
			lastdayVoteNumber:count,
			lastdayVoteOrder:pos
		},function(err, itemobj){
			if(err) return callback(err)
			callback();
		})

	}

	//循环处理voteid的aggregate
	var dealAgg = function(voteid, callback){
		var q = {
			s:s,
			e:e,
			voteId:voteid
		}
		//进行分组计算
		voteRecord.aggregateOrder(q, function(err, agglist){
			if(err) return callback(err)
			//如果没有记录，直接返回
			if(agglist.length == 0) return callback();
			var updateItemList = [];

			//获取itemid的数组
			var itemIdsArray = [];
			agglist.forEach(function(aggObj){
				itemIdsArray.push(aggObj._id.toString())
			})


			//根据获取的itemid数组，获取item数组
			voteItem.getByIds(itemIdsArray, function(err, itemArray){
					if(err) return callback(err)
					//获取groupid分组
				    var groupObjectKey = {}
					itemArray.forEach(function(iobj){
						//获得keys数组，看有没有被分配了
						var keys = Object.keys(groupObjectKey)
						if(keys.indexOf(iobj.groupId) == -1){
							groupObjectKey[iobj.groupId] = {
								list:[],
								rank:[]
							}
						}
						groupObjectKey[iobj.groupId].list.push(iobj._id.toString())
					})
					//生成带group的 groupObjectKey 对象

					//循环生成修改item项的函数，生成 series 工作函数数组
					var keys2 = Object.keys(groupObjectKey)
					agglist.forEach(function(aggObj, i){
						var itemid = aggObj._id.toString();
						var count = aggObj.supportCount;

						keys2.forEach(function(key2){
							groupObjectKey[key2].list.forEach(function(iobjId){
								if(iobjId == itemid){ //如果找到并且匹配
									groupObjectKey[key2].rank.push(itemid);
									var pos = groupObjectKey[key2].rank.length;
									updateItemList.push(function(cb){
										updateItem(itemid, count, pos, cb)
									})//end update
								}
							})//end groupObjectKey[key2].list.forEach
						})//end keys2.forEach
					})//end agglist.forEach

					//执行series异步序列化
					async.series(updateItemList, function(err){
						if(err) return callback(err)
						callback();
					})//end async.series

			})//end voteItem.getByIds

		})//end voteRecord.aggregateOrder
	
	}//end dealAgg


	//查找所有有效的vote活动
	vote.findByObj({
		isShow:1
	},function(err, voteList){
		if(err) return err;

		//分组计算的函数数组
		var voteIdsFn = []
		voteList.forEach(function(vo){
			//生成series函数数组
			var voteid = vo._id.toString()

			voteIdsFn.push(function(cb){
				dealAgg(voteid, cb)
			})
		})

		async.series(voteIdsFn, function(err){
			if(err){
				return logger.error('scheduleJob execute error: ',err);
			}
			//完成，打印工作时间
			var nowE = Date.now();
			var gap =  nowE - nowS;
			logger.error('scheduleJob execute custom time(ms): ',gap.toString())
			
		})//end async.series

	})//end vote.findByObj

}

//定义定时器
obj.setSchedule = function(){
	//定义规则
	var rule = new node_schedule.RecurrenceRule();
	rule.dayOfWeek = [new node_schedule.Range(0, 6)];
	rule.hour = 0;
	rule.minute = 0;
	var j = node_schedule.scheduleJob(rule, function(){
			//执行定时计划
		   obj.scheduleJob()
	});
	//马上执行一次
	obj.scheduleJob()
}





module.exports = obj;