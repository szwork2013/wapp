var lotteryBl = require('../bl/wxLottery.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var obj = {}

var os = require('os')
var platForm = os.platform()

obj.getLotteryInfo = function(req,res){
	//先获取用户id
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	//如果是本地开发环境
    if(platForm == 'win32'){
		req.session[appEname+'_userid'] = '552e69a151a8d2bfc651d9af'
	}

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

	//如果是本地开发环境
    if(platForm == 'win32'){
		req.session[appEname+'_userid'] = '552e69a151a8d2bfc651d9af'
	}

	var userid = req.session[appEname+'_userid'];
	if(!userid){
		res.send({error:1,data:'用户身份丢失，请重新进入'})
		return;
	}


	userBl.getUserByUserId(userid, function(err, userobj){

			if(err){
				return res.send(500)
			}
			if(!userobj){
				return res.send({error:1,data:'未找到用户'})
			}
			var userobj = userobj.uobj

			var mobile = userobj.appUserMobile
			var lotteryId = req.body.lotteryId
			var isforward = parseInt(req.body.isforward) || 0;
			var recordIp = req.ips[0] || '127.0.0.1'
			var ywy_mobile = req.body.ywy_mobile

			if(!userobj.appUserCode || userobj.appUserCode == ''){
				return res.send({error:1,data:'未认证用户无法抽奖'})
			}
			if(!userobj.appUserType == 2){
				return res.send({error:1,data:'业务员无法抽奖'})
			}


			lotteryBl.startLottery(userid, lotteryId, recordIp, isforward, function(err,result){
				if(err){
			        return res.send({error:1,data:err}) 
		     	}
		     	if(result.prizeId && result.prizeId != '0'){		
		     		return res.send({error:0,data:result});
		     	}
		     	else{
		     		return res.send({error:0,data:result});
		     	}
			}, mobile, ywy_mobile)
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