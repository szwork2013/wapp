var dl = require('../../dl/appActiveLogModel.js');

var dl2 = require('../../dl/userModel.js');
var dl3 = require('../../dl/appActiveModel.js');
var utils = require('../../lib/utils.js');
var bl = require('../../bl/activeBl.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('active_log_list', {session:req.session});
}


obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc || doc.length==0) return res.json(doc);

		var templist = doc


		resObj["Data"] = templist;
		
		dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);

				resObj["Total"] = count
				
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
		query = {'writeTime':new Date('1970/1/1')}
	}
	
	delete req.models[0]["_id"];

	var tempjson = req.models[0]["comments"] || '[]';
	try{
		req.models[0]["comments"] = JSON.parse(tempjson)
	}
	catch(e){
		res.send(500,e)
	}


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



obj.ranklist = function(req, res){
	res.render('active_log_rank_list', {session:req.session});
}


obj.getrank =  function(req, res){

	var ename = req.body.activeEname;

	bl.getRankByEname(ename, 1000, function(err,list){
		if(err) return res.json({error:1,data:err})
		return res.json({error:0,data:list})
	})


}



module.exports = obj;