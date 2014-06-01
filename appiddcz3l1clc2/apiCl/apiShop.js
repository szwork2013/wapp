var shopBl = require('../bl/wxShop.js')
var utils = require('../lib/utils.js');
var obj = {}


obj.exchangePrize = function(req,res){ //兑换商品
	var prizeId = req.body.prizeId;
	var userId = req.wxuobj._id;
}


obj.exchangePrize = function(req,res){ //兑换商品
	var prizeId = req.body.prizeId;
	var openId = req.wxuobj.openId;
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	if(!prizeId){
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



module.exports = obj;