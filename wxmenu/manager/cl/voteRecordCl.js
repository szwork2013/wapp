var dl = require('../../dl/voteRecordModel.js');
var dl2 = require('../../dl/userModel.js');
var dl3= require('../../dl/voteItemModel.js');
var dl4 = require('../../dl/voteModel.js');
var utils = require('../../lib/utils.js');
var iconv = require('iconv-lite');
var obj = {}
var salt = global.app.get('salt');
var json2csv = require('json2csv');
var moment = require('moment')

obj.list = function(req, res){
	res.render('vote_record_list', {session:req.session});
}


obj.aggressiveList = function(req, res){
	res.render('vote_aggressive_list', {session:req.session});
}

//分析用户投票细节
obj.aggressive_userDeatil= function(req, res){

	var voteId = req.param('voteid');
	var groupId = req.param('groupid');
	if(groupId == '0' || groupId == ''){
		groupId = null;
	}

	var filter = {
		'voteId':voteId,
	}
	if(groupId){
		filter.groupId = groupId
	}


	dl3.findAll(filter, 0, 100000, function(err, itemList){
		if(err) return req.downloadCallback(err)
		if(itemList.length == 0) return req.downloadCallback(null, [])
		var bigVoteItemDict = {}
		itemList.forEach(function(voteItem){
				bigVoteItemDict[voteItem._id.toString()] = voteItem
		})


		//查找所有记录
		dl.findAll(filter, 0, 100000, function(err, list){
			var bigUserDict = {}
			var userIds = []

			if(err) return req.downloadCallback(err)
			if(list.length == 0) return req.downloadCallback(null, [])
			list.forEach(function(item){
				//如果没有字典创建一个字典
				if(!bigUserDict[item.userId]){
					bigUserDict[item.userId] = {
						'lv0':'',
						'lv1':'',
						'lv2':'',
						'lv3':'',
						'lv4':'',
						'usreid':item.userId,
					}
				}

				//如果有key
				if(bigUserDict[item.userId].hasOwnProperty(item.code2)){
						var voteObj =  bigVoteItemDict[item.itemId]
						bigUserDict[item.userId][item.code2] += voteObj.code2+','
				}

				//获取唯一的用户id
				if(userIds.indexOf(item.userId) == -1){
					userIds.push(item.userId)
				}
			})

			//然后去查找用户表

			dl2.getUserByIds(userIds, function(err, userList){
				if(err) return req.downloadCallback(err)
				if(list.length == 0) return req.downloadCallback(null, [])
				var resultList = []
				userList.forEach(function(userItem){
					//如果有这个人的投票信息才返回
					if(bigUserDict[userItem.value]){
						var tempBigUserObj = bigUserDict[userItem.value]
						resultList.push({
							'name':userItem.name,
							'appUserMobile':userItem.mobile,
							'wxName':userItem.wxName,
							'lv0':tempBigUserObj.lv0,
							'lv1':tempBigUserObj.lv1,
							'lv2':tempBigUserObj.lv2,
							'lv3':tempBigUserObj.lv3,
							'lv4':tempBigUserObj.lv4,
						})//end push
					}//end if
				})//end foreach

				//完成拼接
				return req.downloadCallback(null, resultList)

			})//end userList


		})//end dl.findAll


	})//dl3.findAll
}


//分析投票
obj.aggressive = function(req, res){
	var s = req.param('stime');
	var e = req.param('etime');
	var voteId = req.param('voteid');
	var groupId = req.param('groupid');
	if(groupId == '0' || groupId == ''){
		groupId = null;
	}


	if(!s){
		if(req.downloadCallback){
			return req.downloadCallback('开始时间未填写')
		}
		return res.json({error:1, data:'开始时间未填写'})
	}
	if(!e){
		if(req.downloadCallback){
			return req.downloadCallback('结束时间未填写')
		}
		return res.json({error:1, data:'结束时间未填写'})
	}
	if(!voteId || voteId.length !== 24){
		if(req.downloadCallback){
			return req.downloadCallback('未选择投票项')
		}
		return res.json({error:1, data:'未选择投票项'})
	}

	dl4.findOneByObj({_id: voteId},function(err, voteObj){
		if(err){
				if(req.downloadCallback){
					return req.downloadCallback(err)
				}
				return res.json({error:1, data:err})
		}
		if(!voteObj){
				if(req.downloadCallback){
					return req.downloadCallback('未找到投票活动')
				}
				return res.json({error:1, data:'未找到投票活动'})
		}
		req.voteTitle = voteObj.title;

		var queryObj = {
				voteId:voteId,
				s:new Date(moment(s).format('YYYY/MM/DD HH:mm:ss')),
				e:new Date(moment(e).format('YYYY/MM/DD HH:mm:ss')),
				groupId:groupId
			}

		dl.aggregateUserJoin(queryObj, function(err, joinUserList){
			if(err){
					if(req.downloadCallback){
						return req.downloadCallback(err)
					}
					return res.json({error:1, data:err})
			}

			var userJoinNumber = joinUserList.length;

			dl.aggregateOrder(queryObj,function(err, orderList){
				//console.log(err, orderList)
				if(err){
						if(req.downloadCallback){
							return req.downloadCallback(err)
						}
						return res.json({error:1, data:err})
				}
				if(orderList.length == 0){
					if(req.downloadCallback){
							return req.downloadCallback(null,[])
					}
					return res.json({error:0, data:[]})
				}
				var ids = [];
				var tempList = []
				orderList.forEach(function(orderObj){
					if(ids.indexOf(orderObj._id) == -1){
						ids.push(orderObj._id)
					}
				})//end orderList.forEach
				
				dl3.getByIds(ids, function(err, list){
					if(err){
							if(req.downloadCallback){
								return req.downloadCallback(err)
							}
							return res.json({error:1, data:err})
					}
					if(list.length==0){
							if(req.downloadCallback){
								return req.downloadCallback(0, [])
							}
							return res.json({error:0, data:[]})
					}

					
					var pos = 1;
					var totalVoteNumber = 0;
					//console.log(orderList)
					orderList.forEach(function(orderObj){
						list.forEach(function(lo){
							if(orderObj._id.toString() == lo._id.toString()){
								tempList.push({
									_id:orderObj._id,
									title:lo.title,
									supportCount:orderObj.supportCount,
									position:pos++,
									groupId:orderObj.groupId,
									groupName:orderObj.groupName,
								})
								totalVoteNumber += orderObj.supportCount
							}

						})
					})//end foreach
					if(req.downloadCallback){
						return req.downloadCallback(0, tempList)
					}
					
			


					return res.json({error:0, data:{
						totalVoteNumber:totalVoteNumber,
						userJoinNumber:userJoinNumber,
						data:tempList}
					})

				})//end dl3.getByIds

				


			})//dl.aggregateOrder

		})//end dl.aggregateUserJoin

	})
//res.render('lottery_list', {session:req.session});
}


//下载导出
obj.download = function(req,res){

	req.downloadCallback = function(err, orderList){
		if(err){
			return res.send(500, err);
		}
		if(orderList.length == 0){
			json2csv({data: [], fields:{}}, function(err, csv) {
				  if(err) return res.send(500,err);
				  res.attachment(req.voteTitle+'.csv');
				  res.send(csv)
			});
			return;
		}
		json2csv({data: orderList, fields: Object.keys(orderList[0] || {})}, function(err, csv) {
			  if(err) return res.send(500,err);
			  res.attachment(req.voteTitle+'.csv');
			  res.send(csv)
		});
	}

	obj.aggressive(req,res)
}


obj.down_deatil = function(req, res){

	req.downloadCallback = function(err, orderList){
		if(err){
			return res.send(500, err);
		}
		if(orderList.length == 0){
			
			return res.send('未找到相关记录')
		}
		json2csv({data: orderList, fields: Object.keys(orderList[0] || {})}, function(err, csv) {
			    if(err) return res.send(500,err);
			    try{
			  	  var buf = iconv.encode(csv, 'gbk');
			    }
				catch(e){
				  	res.send(e)
				}


			   res.attachment(req.voteTitle+'.csv');
			   res.send(buf)

		});
	}

	obj.aggressive_userDeatil(req,res)


}

obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		resObj["Data"] = doc;
		var ids = []
		doc.forEach(function(v){
			ids.push(v.itemId)
		})


		dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);
			resObj["Total"] = count
			if(ids.length == 0){			
				res.json(resObj);
				return;
			}
			
			dl3.getByIds(ids,function(err, list){
				if(err) return res.send(500,err);
				if(list.length == 0){
					res.json(resObj);
					return;
				}
				var tempList = [];

				doc.forEach(function(dobj){
					list.forEach(function(lo){
						if(lo._id.toString() == dobj.itemId){
							tempList.push({
								_id:dobj._id.toString(),
								appId:dobj.appId,
								voteId:dobj.voteId,
								itemId:dobj.itemId,
								itemTitle:lo.title,
								userId:dobj.userId,
								recordIp:dobj.recordIp,
								isForward:dobj.isForward,
								code1:dobj.code1,
								code2:dobj.code2,
								code3:dobj.code3,
								code4:dobj.code4,
								writeTime:dobj.writeTime
							})
						}
					})
				})
				resObj["Data"] = tempList;
				res.json(resObj);
				return;

			})
			
		})
		
	})

}
obj.update = obj.create = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {'writeTime':new Date('1970/1/1')}
	}
	
	delete req.models[0]["_id"];
	delete req.models[0]["__v"];

	dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};
	dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


obj.getList = function(req, res){

	dl.findAll({}, 0, 100000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.aggressiveCount = function(req, res){
	var voteid = req.body.voteid;

	dl.countAll({
		voteId:voteid
	},function(err, count1){
		if(err) return res.send(500,err);
		dl.aggregateUser({
			voteId:voteid
		},function(err,list){
			if(err) return res.send(500,err);
			return res.send({
				error:0,
				data:{
					voteCount:count1,
					voteMemberCount:list.length
				}
			})
		})
	})

}


module.exports = obj;