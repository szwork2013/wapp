var lotteryBl = require('../bl/wxLottery.js')
var utils = require('../lib/utils.js');
var obj = {}



obj.startLottery = function(req,res){ //用户进入抽奖页面点击抽奖程序
	var userId = req.wxuobj._id;
	var lotteryId = req.body.lotteryId
	var recordIp = req.ips[0] || '127.0.0.1'

	lotteryBl.startLottery(userId, lotteryId, recordIp, function(err,result){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:result});

	})

}


obj.improveInfo = function(req,res){ //抽奖完成,完善姓名和手机
	var recordId = req.body.recordId
	var truename = req.body.truename
	var mobile = req.body.mobile

	if(!recordId || !truename || !mobile){
		return res.send({error:1,data:'请填写完整信息'})
	}

	lotteryBl.improveInfo(recordId, truename, mobile, function(err,result){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	res.send({error:0,data:''});
	})

}


module.exports = obj;