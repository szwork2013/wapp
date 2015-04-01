var lotteryBl = require('../bl/wxLottery.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var obj = {}

obj.getLotteryInfo = function(req,res){
	//先获取用户id
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	//req.session[appEname+'_userid'] = '53ecbe65e00fd324efd73032'

	var userid = req.session[appEname+'_userid'];
	//如果用户身份丢失
	if(!userid){
		res.send({error:0,data:'用户身份丢失，请重新进入'})
		return;
	}
	//获取抽奖活动的ename
	var lotteryEname = req.query.ename;
	if(!lotteryEname){
		res.send({error:0,data:'缺少ename参数'})
		return;
	}
	//根据ename获取抽奖活动的对象
	lotteryBl.getLotteryByEname(lotteryEname,function(err,lotteryObj){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(!lotteryObj){
     		return res.send({error:1,data:'未找到抽奖活动'}) 
     	}
     	//获取该用户的抽奖记录
     	lotteryBl.getUserLotteryRecById(userid, lotteryObj._id.toString(), 0, 1000, function(err,recordList){
     		if(err){
		        return res.send({error:1,data:err}) 
	     	}
	     	//将结果返回给前端
	     	return res.send({error:0,data:{
	     		lottery:lotteryObj,
	     		record:recordList
	     	}}) 

     	})
	})

}


//用户点击了抽奖按钮
obj.startLottery = function(req,res){ //用户进入抽奖页面点击抽奖程序
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		res.send({error:0,data:'用户身份丢失，请重新进入'})
		return;
	}

	var lotteryId = req.body.lotteryId
	var isforward = parseInt(req.body.isforward) || 0;
	var recordIp = req.ips[0] || '127.0.0.1'

	lotteryBl.startLottery(userid, lotteryId, recordIp, isforward, function(err,result){
		if(err){
	        return res.send({error:1,data:err}) 
     	}
     	if(result.prizeId && result.prizeId != '0'){
     		//根据奖品id拿奖品信息
     		lotteryBl.getPrizeById(result.prizeId, function(err,po){
     			if(err){
     				return res.send({error:1,data:err});
     			}
     			if(!po){
     				return res.send({error:1,data:'奖品未找到'});
     			}
     			result.prizeObj = po;
     			return res.send({error:0,data:result});
     		})
     	}
     	else{
     		return res.send({error:0,data:result});
     	}
	})

}


//完善资料
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