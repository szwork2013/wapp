var Dl = require('../dl/lotteryPrizeDl.js');
var utils = require('../../lib/utils.js');
var obj = {}
obj.list = function(req, res){
	res.render('lottery_prize_list', {session:req.session});
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

obj.getRandomPriceNum = function(s,e){//声称s到e的随机数
	    var c = e-s+1;  
	    return Math.floor(Math.random() * c + s);
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

	var clientId = req.models[0]["clientId"];
	var lotteryId = req.models[0]["lotteryId"];

	Dl.findAll({
		"clientId":clientId,
		"lotteryId":lotteryId,
	},0,1000,function(err,priceArray){
		if(err) return res.send(500,err);

		if(!priceArray || priceArray.length==0){//如果是第一个
			if(req.models[0].priceNum == 0){
					req.models[0].priceNum = obj.getRandomPriceNum(req.models[0].rate*0.5, req.models[0].rate)
			}
			Dl.createOneOrUpdate(query, req.models[0], function(err, doc){	
				if(err) return res.send(500,err);
				if(!doc) return res.json([])
				res.json(doc);
			})
		}
		else{
			var priceNumAry=[]
			priceArray.forEach(function(v){
				priceNumAry.push(v.priceNum);
			})

			if(req.models[0].priceNum == 0){
				var nextPriceNum;
				do{
					var s = req.models[0].rate*0.5;
					var e = req.models[0].rate;
					nextPriceNum = obj.getRandomPriceNum(s,e);
				}while(priceNumAry.indexOf(nextPriceNum) != -1);
				req.models[0].priceNum = nextPriceNum;
			}
			Dl.createOneOrUpdate(query, req.models[0], function(err, doc){	
				if(err) return res.send(500,err);
				if(!doc) return res.json([])
				res.json(doc);
			})
		}
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