var shopBl = require('../bl/wxShop.js')
var utils = require('../lib/utils.js');
var obj = {}


obj.exchangePrize = function(req,res){ //兑换商品
	var prizeId = req.body.prizeId;
	var openId = req.wxuobj.openId;
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	if(!prizeId || prizeId.length != 24){
		return  res.send({error:1,data:'缺少商品Id'}) 
	}
	
	shopBl.obtainPrize({
		prizeId:prizeId,
		userId:userId,
		openId:openId,
		appId:appId
	},function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
		})
}

obj.saleprize = function(req,res){ //出价某个商品
	var saleid = req.body.saleid;
	var score =req.body.score;
	var openId = req.wxuobj.openId;
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	if(!saleid || saleid.length != 24){
		return  res.send({error:1,data:'缺少拍品Id'}) 
	}
	if(!score || (score != parseInt(score))){
		return  res.send({error:1,data:'竞拍价格无效'})
	}

	shopBl.saleprize(saleid, userId, score, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
		})
}




module.exports = obj;