var Dl = require('../dl/puzzleQuesstionDl.js');
var utils = require('../../lib/utils.js');
var obj = {}
obj.list = function(req, res){
	res.render('puzzle_quesstion_list', {session:req.session});
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

			resObj.Data.map(function(v){
				v.tips = JSON.stringify(v.tips);
				v.key = JSON.stringify(v.key);
				v.tags = JSON.stringify(v.tags);
				return v;
			});

			res.json(resObj);
		});
		
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
	try{
		req.models[0].tips = req.models[0].tips.split(',');
		req.models[0].key = req.models[0].key.split(',');
		req.models[0].tags = req.models[0].tags.split(',');
	}
	catch(e){
		console.log(e)
		return res.send(500,e)
	}

	Dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json({Data:[doc]});
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



module.exports = obj;