var dl = require('../../dl/lotteryRecordModel.js');
var dl3 = require('../../dl/lotteryPrizeModel.js');
var dl4 = require('../../dl/lotteryModel.js');
var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var async = require('async')
var obj = {}
var salt = global.app.get('salt');
var json2csv = require('json2csv')

obj.list = function(req, res){

	var filter = {}
	if(req.session.adminAppId != '1'){
		filter.appId = req.session.adminAppId 
	}
	dl4.findAll(filter,0,100000, function(err,lotteryList){
		if(err) return res.send(500,err);
		res.render('lotteryRec_list', {session:req.session, lotteryList:JSON.stringify(lotteryList)});
	})

}




obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	async.series([
		function(callback){
			if(filter.appUserMobile || filter.appUserName){
				var userFilter = {}
				if(filter.appUserMobile){
					userFilter.appUserMobile = filter.appUserMobile
				}
				if(filter.appUserName){
					userFilter.appUserName = filter.appUserName
				}
				dl2.find(userFilter, function(err, list){
					if(err) return res.send(500,err);
					if(list.length == 0) return callback()
					var ids = []
					list.forEach(function(uo){
						ids.push(uo._id.toString())
					})
					//将查出用户列表

					filter['userId'] = {"$in":ids}
					delete filter['appUserMobile']
					delete filter['appUserName']
					callback()
				})
			}
			else{
				callback()
			}
	}], function(){

		dl4.findAll({},0,100000, function(err,lotteryList){
			if(err) return res.send(500,err);
			if(req.session.adminAppId != '1'){
				var lotteryIds = [];
				lotteryList.forEach(function(lo){
					if(lo.appId.toString() == req.session.adminAppId){
						lotteryIds.push(lo._id.toString())
					}
				})
				if(filter.lotteryId && lotteryIds.indexOf(filter.lotteryId) == -1){
					return res.send({"Data":[],"Total":0});
				}
				if(!filter.lotteryId){
					filter.lotteryId = {'$in': lotteryIds}
				}
			}

			dl.findAll(filter, skip, pageSize, function(err,doc){
				if(err) return res.send(500,err);
				if(doc.length == 0) return res.send({"Data":[],"Total":0});
				resObj["Data"] = doc;
				var ids = []
				doc.forEach(function(v){
					ids.push(v.userId)
				})

				dl2.getUserByIds(ids, function(err, userlist){
					if(err) return res.send(500,err);
					dl.countAll(filter,function(err,count){
						if(err) return res.send(500,err);

							resObj["Total"] = count
							var tmpList = []
							resObj["Data"].forEach(function(obj){
								var tmpObj = {
										"_id": obj._id,
		                                "lotteryId": obj.lotteryId,
		                                "prizeId": obj.prizeId,
		                                "userId": obj.userId,
		                                "truename":obj.truename,
		                                "mobile":obj.mobile,
		                                "recordIp":obj.recordIp,
		                                "giftId":obj.giftId,
		                                "isForward":obj.isForward,
		                                "writeTime": obj.writeTime,
		                                "appUserName":'未找到用户',
		                                'appUserMobile':'未找到用户',
		                                "code1":obj.code1,
		                                "code2":obj.code2,
		                                "code3":obj.code3,
		                                "code4":obj.code4,
									}
								userlist.forEach(function(uobj){
									if(uobj.value.toString() == tmpObj.userId){
											tmpObj['appUserName'] = uobj.text
											tmpObj['appUserMobile'] = uobj.mobile
									}
								})
								tmpList.push(tmpObj)					
							})
							resObj["Data"] = tmpList
							res.json(resObj);
						})
					})//dl2 find ids
				
			})
		})
	})//end async

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

	dl.findAll({}, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


obj.download = function(req,res){

	var lotteryId = req.query.lotteryid;
	var lotteryEname = req.query.lotteryename;
	if(!lotteryId){
		return res.send({error:1,data:'请传参lotteryId'});
	}
	if(!lotteryEname){
		return res.send({error:1,data:'请传参lotteryEname'});
	}


	dl.findAll({
		lotteryId:lotteryId,
		prizeId:{'$ne':'0'}
	},0,100000,function(err, recordList){
		if(err) return res.send(500,err);
		var outJson = [];
	
		dl3.findAll({
			isShow:1,
			lotteryId:lotteryId
		},0,100000,function(err,prizeList){
			if(err) return res.send(500,err);
			
			recordList.forEach(function(r){

				prizeList.forEach(function(p){
					
					if(p._id.toString() != r.prizeId.toString()) return;					
					outJson.push({
						"_id":r._id.toString(),
						"lotteryId":r.lotteryId.toString(),
						"prizeId":r.prizeId.toString(),
						"lotteryName":p.name,
						"userId":r.userId,
						"truename":r.truename,
						"mobile":r.mobile.toString(),
						"recordIp":r.recordIp,
						"isForward":r.isForward,
						"code1":r.code1=='1'?'已发奖':'未发奖',
						"code2":r.code2,
						"code3":r.code3,
						"code4":r.code4,
						"writeTime":r.writeTime,
					})
				})
								
			})
			

			json2csv({data: outJson, fields: Object.keys(outJson[0] || {})}, function(err, csv) {
				  if(err) return res.send(500,err);
				  res.attachment(lotteryEname+'.csv');
				  res.send(csv)
			});
		})
	})

}




module.exports = obj;