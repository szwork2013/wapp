var shopBl = require('../bl/wxShop.js')
var utils = require('../lib/utils.js');
var obj = {}


obj.exchangePrize = function(req,res){ //兑换商品
	var prizeId = req.body.prizeId;
	var mobile = req.body.mobile || req.wxuobj.appUserMobile;
	var openId = req.wxuobj.openId;
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	if(!prizeId || prizeId.length != 24){
		return  res.send({error:1,data:'缺少商品Id'}) 
	}

	if(!/^1[0-9][0-9]\d{4,8}$/.test(mobile)){
		return res.send({error:1,data:'手机号格式有误'}) 
	}
	
	shopBl.obtainPrize({
		prizeId:prizeId,
		userId:userId,
		openId:openId,
		appId:appId
	},mobile,function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
		})
}

obj.saleprize = function(req,res){ //出价某个商品
	var saleid = req.body.saleid;
	var score = req.body.score;
	var mobile = req.body.mobile;

	var openId = req.wxuobj.openId;
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;

	if(!/^1[0-9][0-9]\d{4,8}$/.test(mobile)){
		return res.send({error:1,data:'手机号格式有误'}) 
	}
	if(!saleid || saleid.length != 24){
		return  res.send({error:1,data:'缺少拍品Id'}) 
	}
	if(!score || (score != parseInt(score))){
		return  res.send({error:1,data:'竞拍价格无效'})
	}
	if(score > req.wxuobj.appUserScore){
		return  res.send({error:1,data:'竞拍积分大于当前积分'})
	}



	shopBl.saleprize(saleid, userId, score, mobile, function(err,doc){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
		})
}




module.exports = obj;