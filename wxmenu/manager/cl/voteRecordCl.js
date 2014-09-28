var dl = require('../../dl/voteRecordModel.js');
var dl2 = require('../../dl/userModel.js');
var dl3= require('../../dl/voteItemModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');
var json2csv = require('json2csv')

obj.list = function(req, res){
	res.render('vote_record_list', {session:req.session});
}

obj.aggressiveList = function(req, res){
	res.render('vote_aggressive_list', {session:req.session});
}

obj.aggressive = function(req, res){
	var s = req.param('stime');
	var e = req.param('etime');
	var voteId = req.param('voteid');
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

	dl3findOneByObj.({_id: voteId},function(err, voteObj){
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

			dl.aggregateOrder({
				voteId:voteId,
				s:s,
				e:e
			},function(err, orderList){
				var ids = [];
				orderList.forEach(function(orderObj){
					if(ids.indexOf(orderObj._id) == -1){
						ids.push(orderObj._id)
					}
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

						var tempList = []
						var pos = 1;
						orderList.forEach(function(orderObj){
							list.forEach(function(lo){
								if(orderObj._id.toString() == lo._id.toString()){
									tempList.push({
										_id:orderObj._id,
										title:lo.title,
										supportCount:orderObj.supportCount,
										position:pos++,
									})
								}

							})
						})//end foreach
						if(req.downloadCallback){
							return req.downloadCallback(0, tempList)
						}
						return res.json({error:0, data:tempList})

					})

				})


			})

	})


	//res.render('lottery_list', {session:req.session});
}


//下载导出
obj.download = function(req,res){

	req.downloadCallback = function(err, orderList){
		if(err){
			return res.send(500, err);
		}
		json2csv({data: orderList, fields: Object.keys(orderList[0] || {})}, function(err, csv) {
			  if(err) return res.send(500,err);
			  res.attachment(req.voteTitle+'.csv');
			  res.send(csv)
		});
	}

	obj.aggressive(req,res)
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

				doc.forEach(function(do){
					list.forEach(function(lo){
						if(lo._id.toString() == do.itemId){
							tempList.push({
								_id:do._id.toString(),
								appId:do.appId,
								voteId:do.voteId,
								itemId:do.itemId,
								itemTitle:lo.title,
								userId:do.userId,
								recordIp:do.recordIp,
								isForward:do.isForward,
								code1:do.code1,
								code2:do.code2,
								code3:do.code3,
								code4:do.code4,
								writeTime:do.writeTime
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

	dl.findAll({}, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


module.exports = obj;