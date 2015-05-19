var dl = require('../../dl/scoreGetModel.js');
var dl2 = require('../../dl/userModel.js');
var guidModel = require('../../dl/guidModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('score_list', {session:req.session});
}

obj.consume_list = function(req, res){
	res.render('score_cosume_list', {session:req.session});
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
	var isadd = false;
	var addDoc = function(cb){

		if(!req.models[0]["scoreGuid"]){ //如果没有传guid
			guidModel.getGuid(function(err,guid){
				if(err) res.send(500,err);
				req.models[0]["scoreGuid"] = guid;
				dl.createOneOrUpdate(query, req.models[0], function(err, doc){
					if(err) return res.send(500,err);
					if(!doc) return res.json([])
					res.json(doc);
				})

			})
		}
		else{
			dl.createOneOrUpdate(query, req.models[0], function(err, doc){
				if(err) return res.send(500,err);
				if(!doc) return res.json([])
				res.json(doc);
			})
		}
	}


	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		isadd = true
		query = {'writeTime':new Date('1970/1/1')}
	}
	
	delete req.models[0]["_id"];
	delete req.models[0]["__v"];

	if(isadd){
		dl2.findOneByObj({
			_id:req.models[0]["userId"]
		},function(err,userdoc){
			if(err) return res.send(500,err);
			if(!userdoc) return res.json(500,'未找到用户')
			var rate = req.models[0]["scoreType"] == 1 ? 1 : -1;

				if(rate<0 && userdoc.appUserScore < (req.models[0]["scoreDetail"]-0)){
					return res.json(500,'用户积分不够')
				}

				dl2.createOneOrUpdate({ //增加或减少用户积分
                   _id:req.models[0]["userId"]
                },{
                   $inc:{appUserScore: rate*(req.models[0]["scoreDetail"]-0)} //手工增加或减少积分
                },function(err,udoc){
                	if(err) return res.send(500,err);
                	addDoc()
                })


		})


	}
	else{
		addDoc()
	}





}


obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};
	dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}





module.exports = obj;