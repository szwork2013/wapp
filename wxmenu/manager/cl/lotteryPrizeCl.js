var dl = require('../../dl/lotteryPrizeModel.js');

var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('lotteryPrize_list', {session:req.session});
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
	
	

	var createAndUpdate = function(){
		
		delete req.models[0]["_id"];
		delete req.models[0]["__v"];

		dl.createOneOrUpdate(query, req.models[0], function(err, doc){
			if(err) return res.send(500,err);
			if(!doc) return res.json([])
			res.json(doc);
		})
	}

	if(req.models[0]["prizeLotteryType"] == 1){ //如果设定为概率，则把次数调整为0
		req.models[0]["priceNum"] = 0
	}

	if('undefined' != typeof req.models[0]["lotteryId"] && 'undefined' != typeof req.models[0]["priceNum"] && 2 == req.models[0]["prizeLotteryType"]){
		dl.findByObj({
			lotteryId:req.models[0]["lotteryId"],
			prizeLotteryType:2
		},function(err,prList){
			if(err) return res.send(500,err);
			if(prList.length == 0) return createAndUpdate();

			var hasEq = 0;
			prList.forEach(function(p){
				if(p._id ==  req.models[0]["_id"]) return;
				if(p.priceNum == 0) return;
				if(p.priceNum == req.models[0]["priceNum"]){

					console.log(p._id)
					console.log(req.models[0]["_id"])
					hasEq++
				}
			})

			if(hasEq>0){
				return res.send(500,'计次抽奖时，计次数不能重复');
			}
			else{
				return createAndUpdate();
			}
		})
	}
	else{
		return createAndUpdate()
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


obj.getList = function(req, res){

	dl.findAll({}, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


module.exports = obj;