var Dl = require('../dl/puzzleRecordDl.js');
var utils = require('../../lib/utils.js');
var obj = {}
obj.list = function(req, res){
	res.render('puzzle_record_list', {session:req.session});
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
			resObj["Total"] = count;

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

obj.detroyIdle = function(){
	var now = Date.now();
	var time = new Date(now - now % 1000*3600*24*2);//昨天的时间戳
	var query = {"status":{"$ne":1}, "endTime":'', "startTime":{"$lte": time}};
	Dl.destroy(query, function(err, doc){
		if(err) return console.log(err);
		console.log('delete idle record success');
		console.log(doc);
	})
}

obj.detroyIdle();
setInterval(function(){
	obj.detroyIdle();
},1000*3600*24)


module.exports = obj;