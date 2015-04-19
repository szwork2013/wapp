var dl = require('../../dl/voteItemModel.js');
var groupDl = require('../../dl/voteGroupModel.js');
var bl = require('../../bl/wxVote.js');
var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('vote_item_list', {session:req.session});
}


obj.select = function(req, res){

	groupDl.findAll({}, 0, 1000, function(err, list){
		if(err) return res.send(err)
		res.render('vote_item_list', {
			session:req.session,
			groupList:list
		});
	})
	
}



obj.hide = function(req, res){
	var ids = req.body.ids
	var idList = ids.split(',')
	if(idList.length == 0){
		return res.send({error:0, data:'ok'})
	}

	dl.createOneOrUpdate({"_id":{
			"$in":idList
		}}, {
		'isShow':0,
	}, function(err, list){
		if(err) return res.send({error:1, data:err})
		res.send({error:0, data:'ok'})
	})


}





obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
	
		var tempList = []
		var ids = []
		doc.forEach(function(v){
			ids.push(v._id.toString())

			tempList.push({
				_id:v._id.toString(),
				appId:v.appId,
				voteId:v.voteId,
				groupId:v.groupId,

				title:v.title,
				pictureThumb:v.pictureThumb,
				picture:v.picture,
				sex:v.sex,
				age:v.age,
				number:v.number,

				desc:v.desc,
				desc2:v.desc2,
				todayVoteNumber:v.todayVoteNumber,
				lastdayVoteNumber:v.lastdayVoteNumber,
				lastdayVoteOrder:v.lastdayVoteOrder,
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

				bl.getItemVoteCountsByIds(ids, function(err,countList){
					if(err) return res.send(500,err);

					//循环匹配获取totalCount
					tempList.forEach(function(tempo){
						var vid = tempo.voteId

							countList.forEach(function(obj){
									if(obj.itemId == tempo._id){
										tempo.totalCount = obj.count
									}
							})
					})


					resObj["Total"] = count
					resObj["Data"] = tempList;
					res.json(resObj);


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
	//console.log(req.models[0])
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


module.exports = obj;