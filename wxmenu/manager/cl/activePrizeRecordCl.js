var dl = require('../../dl/appActivePrizeRecordModel.js');
var dl3 = require('../../dl/appActivePrizeModel.js');
var dl4 = require('../../dl/appActiveModel.js');
var dl2 = require('../../dl/userModel.js');

var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');
var json2csv = require('json2csv')
var async = require('async')

obj.list = function(req, res){

	var filter = {}
	if(req.session.adminAppId != '1'){
		filter.appId = req.session.adminAppId 
	}
	dl4.findAll(filter,0,100000, function(err,List){
		if(err) return res.send(500,err);
		res.render('activePrizeRecord_list', {session:req.session, List:JSON.stringify(List)});
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
	
		dl4.findAll({},0,100000, function(err,activeList){
			if(err) return res.send(500,err);
			if(req.session.adminAppId != '1'){
				var activeIds = [];
				activeList.forEach(function(lo){

					if(lo.appId.toString() == req.session.adminAppId){
						activeIds.push(lo._id.toString())
						//console.log(lo.appId.toString(), req.session.adminAppId)
					}
				})



				if(filter.activeId && activeIds.indexOf(filter.activeId) == -1){
					return res.send({"Data":[],"Total":0});
				}
				if(!filter.activeId){
					filter.activeId = {'$in': activeIds}
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
		                                "activeId": obj.activeId,
		                                "prizeId": obj.prizeId,
		                                "userId": obj.userId,
		                                "truename":obj.truename,
		                                "mobile":obj.mobile,
		                                "recordIp":obj.recordIp,
		                                "giftId":obj.giftId,
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

				})//end find all
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

	var id = req.query.id;
	var ename = req.query.ename;
	if(!id){
		return res.send({error:1,data:'请传参id'});
	}
	if(!ename){
		return res.send({error:1,data:'请传参ename'});
	}


	dl.findAll({
		activeId:id
	},0,100000,function(err, recordList){
		if(err) return res.send(500,err);
		var outJson = [];
	
		dl3.findAll({
			isShow:1,
			activeId:id
		},0,100000,function(err,prizeList){
			if(err) return res.send(500,err);
			
			recordList.forEach(function(r){

				prizeList.forEach(function(p){
					
					if(p._id.toString() != r.prizeId.toString()) return;					
					outJson.push({
						"_id":r._id.toString(),
						"activeId":r.activeId.toString(),
						"prizeId":r.prizeId.toString(),
						"activeName":p.name,
						"userId":r.userId,
						"truename":r.truename,
						"mobile":r.mobile.toString(),
						"recordIp":r.recordIp,
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
				  res.attachment(ename+'.csv');
				  res.send(csv)
			});
		})
	})

}




module.exports = obj;