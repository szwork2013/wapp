var Dl = require('../dl/platUserDl.js');
var utils = require('../../lib/utils.js');
var obj = {}
obj.list = function(req, res){
	res.render('platuser_list', {session:req.session});
}
obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	Dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		doc.forEach(function(v){
			if(v.bindingAppUserId){
				v.bindingAppUserId = JSON.stringify(v.bindingAppUserId)
			}
			else{
				v.bindingAppUserId = '[]'
			}
		})
		resObj["Data"] = doc;

		Dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);
			resObj["Total"] = count;
			res.json(resObj);
		})
		
	})

}
obj.update = obj.create = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {"mobile": ''};
	}
	delete req.models[0]["_id"];
	var obj = req.models[0];
	if(!obj.bindingAppUserId) obj.bindingAppUserId = '[]';
	try{
		var ary = JSON.parse(obj.bindingAppUserId);
	}
	catch(e){
		return res.send(500,e);
	}
	obj.bindingAppUserId = ary;
	
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


module.exports = obj;