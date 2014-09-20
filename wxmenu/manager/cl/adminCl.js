var dl = require('../../dl/adminModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('admin_list', {session:req.session});
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
	//console.log(req.models[0]["password"].length)
	if(req.models[0]["password"].length == 32){
		delete req.models[0]["password"]
	}
	else{
		req.models[0].password = utils.md5(req.models[0].password+salt)
	}
	
	delete req.models[0]["_id"];

	
	//console.log(req.models[0].password)
	dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
			//console.log(doc.appId)
		req.session.adminAppId = doc.appId;
		res.json([doc]);
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



var init_admin = function(){

	dl.findAll({}, 0, 100, function(err,doc){
		if(err) return console.log('init error %s',err);
		if(doc.length>0) return console.log('has init ready');

		dl.createOneOrUpdate({'admin':'admin'}, {
			admin:'admin',
			password:utils.md5('admin'+salt)
		}, function(err, doc){
			if(err || !doc) return console.log('init error %s',err);
			console.log('init success u:admin p:admin has create')
		})
		
	})

}

init_admin();

module.exports = obj;