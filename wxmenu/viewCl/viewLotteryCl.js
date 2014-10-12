var utils = require('../lib/utils.js');
var lotteryBl = require('../bl/wxLottery.js');
var appBl = require('../bl/wxApp.js');
var obj = {}


obj.lotteryPage = function(req,res){ //活动页面展示
	var wxuobj = req.wxuobj;

	var lotteryEname = req.query.ename;
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}

	var appEname = appobj.data;

	//req.session[appEname+'_userid'] = '53ecb609e00fd324efd7302d'
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}

	if(!appEname){
		return res.send(404)
	}

	//先去查找抽奖活动记录
	lotteryBl.getLotteryByEname(lotteryEname,function(err,lotteryObj){
		if(err){
			return res.send(err)
		}
		if(!lotteryObj){
			return res.send(404)
		}

		appBl.getByEname(appEname,function(err,appObj){
			if(err){
				return res.send(err)
			}
			if(!appObj){
				return res.send(404)
			}


			res.render('lottery/'+lotteryEname+'.ejs', {
				lotteryObj:lotteryObj,
				lotteryEname:lotteryEname,
				appEname:appEname,
				appId:appObj._id,
				userid:userid,
				wxuobj:wxuobj
			});

		})


	})

	

	

	
}


module.exports = obj;