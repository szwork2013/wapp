var Dl = require('../dl/puzzlePrizeRecordDl.js');
var utils = require('../../lib/utils.js');
var obj = {}
obj.list = function(req, res){
	res.render('puzzle_prize_record_list', {session:req.session});
}
obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	Dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		resObj["Data"] = doc;

		Dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);
			resObj["Total"] = count
			res.json(resObj);
		})
		
	})
}

obj.update = obj.create  = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {"clientId":''};
	}
	delete req.models[0]["_id"];
	if(!req.models[0]["voteId"]){
		req.models[0]["voteId"] = '0'
	}
	if(!req.models[0]["interval"]){
		req.models[0]["interval"] = 0
	}
	Dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};
	Dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.getGroup = function(req, res){
	var filter =  utils.kendoToMongoose({},req.session.clientId);
	filter["voteId"] = "0";
	Dl.findAll(filter, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

module.exports = obj;