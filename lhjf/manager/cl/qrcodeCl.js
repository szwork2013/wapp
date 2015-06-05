var dl = require('../../dl/qrcodeLogModel.js');
var qrcodeBl = require('../../bl/qrcode.js');

var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('qrcode_list', {session:req.session});
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
		
		var ids = []
		doc.forEach(function(v){
			ids.push(v.userId)
		})

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

obj.createQrcode = function(req, res){

	var s_id = req.body.s_id
	var type = req.body.type
	if(type == 1){
		qrcodeBl.createTempQRCode(s_id, function(err, qrcodeUrl){
				if(err){
					return res.send({'error':1,'result':err})
				}
				else{
					return res.send({'error':0,'result':qrcodeUrl})
				}
		})
	}
	else{
		qrcodeBl.createForverQRCode(s_id, function(err, qrcodeUrl){
				if(err){
					return res.send({'error':1,'result':err})
				}
				else{
					return res.send({'error':0,'result':qrcodeUrl})
				}
		})
	}

	
}



module.exports = obj;