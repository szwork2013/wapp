var dl = require('../../dl/voteGroupModel.js');
var bl = require('../../bl/wxVote.js');
var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var async = require('async')
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('vote_group_list', {session:req.session});
}




obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		
		var ids = []
		var voteIds = [];
		var tempList = [];
		var groupList = {};
		var oldTime = Date.parse('1980/01/01');

		doc.forEach(function(v){
			if(voteIds.indexOf(v.voteId) == -1){
				voteIds.push(v.voteId)
			}
			ids.push(v._id.toString())

			tempList.push({
				_id:v._id.toString(),
				appId:v.appId,
				voteId:v.voteId,
				ename:v.ename,
				title:v.title,
				isFreez:v.isFreez,
				isShow:v.isShow,
				code1:v.code1,
				code2:v.code2,
				code3:v.code3,
				code4:v.code4,
				totalCount:0,
				writeTime:v.writeTime,
			})
		})

		dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);

				//生成异步操作函数数组
				var dealFunc = []
				voteIds.forEach(function(vid){
					var vid = vid
					dealFunc.push(function(callback){
						bl.getGroupCountByVoteId(vid, oldTime, function(err, groupCountList){
							if(err) callback(err)
							groupList[vid] = groupCountList
							callback()
						})
					})
				})


				//执行异步
				async.series(dealFunc, function(err){
					if(err) return res.send(500,err);

					//循环匹配获取totalCount
					tempList.forEach(function(tempo){
						var vid = tempo.voteId
						if(groupList[vid] && groupList[vid].length >0){
								groupList[vid].forEach(function(groupobj){
										if(groupobj.groupid == tempo._id){
											tempo.totalCount = groupobj.count
										}
								})
						}
					})

					//改分组被投票人的数量
					bl.countUsersByGroupIds(ids, function(err, groupUserCountList){
							if(err) return res.send(500,err);
							tempList.forEach(function(tempo){
								groupUserCountList.forEach(function(guo){
									if(tempo._id == guo.groupId){
										tempo.userCount = guo.count
									}
								})
							})

						//改分组参与投票的用户数量
						bl.countUserJoinByGroupIds(ids, function(err, groupUserJoinCountList){
							//console.log(groupUserJoinCountList)
							if(err) return res.send(500,err);
							tempList.forEach(function(tempo){
								groupUserJoinCountList.forEach(function(guo){
									if(tempo._id == guo.groupId){
										tempo.userJoinCount = guo.groupJoinCount
									}
								})
							})

							resObj["Total"] = count
							resObj["Data"] = tempList;
							res.json(resObj);

						})//end bl.countUserJoinByGroupIds

					})//end bl.countUsersByGroupIds
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
	var voteid = req.body.voteid;
	if(voteid){
		var q = { voteId:voteid}
	}
	else{
		var q = {}
	}
	dl.findAll(q, 0, 100000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


module.exports = obj;