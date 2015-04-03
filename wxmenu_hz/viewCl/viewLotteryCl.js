var utils = require('../lib/utils.js');
var lotteryBl = require('../bl/wxLottery.js');
var userBl = require('../bl/wxUser.js');
var appBl = require('../bl/wxApp.js');
var os = require('os')
var platForm = os.platform()
var obj = {}


obj.lotteryPage = function(req,res){ //活动页面展示

	res.set('Cache-Control', 'no-cache')
    res.set('ETag', Date.now().toString())
    var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;

	var wxuobj = req.wxuobj;

	var lotteryEname = req.query.ename;
	//业务员用户id
	var ywy_userid = req.query.ywy_userid;
	if(!ywy_userid){
		return res.send('缺少参数 ywy_userid')
	}


	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}

	var appEname = appobj.data;
	//如果是本地开发环境
    if(platForm == 'win32'){
		req.session[appEname+'_userid'] = '53ecc71816eafb68369b4920'
	}
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}

	if(!appEname){
		return res.send(404)
	}



	//获取业务员的信息
	userBl.getUserByUserId(ywy_userid, function(err, ywyObj){
		if(err){
			return res.send(err)
		}
		if(!ywyObj){
			return res.send('未找到业务员')
		}

		if(ywyObj.uobj.appUserType != 2){
			return res.send('业务员类型有误')
		}
		
		var ywy_userid = ywyObj.uobj._id
		var ywy_mobile = ywyObj.uobj.appUserMobile

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

				var timeError = 0
				var now = moment()
				var startTime = moment(lotteryObj.startTime)
				var endTime = moment(lotteryObj.endTime)
				if(now<startTime || now>endTime){
					timeError = 1
				}

				res.render('lottery/'+lotteryEname+'.ejs', {
					lotteryObj:lotteryObj,
					lotteryEname:lotteryEname,
					appEname:appEname,
					appId:appObj._id,
					userid:userid,
					wxuobj:wxuobj,
					timeError:timeError,
					ywy_userid:ywy_userid,
					ywy_mobile:ywy_mobile,
					jsurl:encodeURIComponent(requestedUrl)
				}); //end render


			})//end appBl.getByEname(appEname,function(err,appObj){


		})//end lotteryBl.getLotteryByEname(lotteryEname,function(err,lotteryObj){


	})//end userBl.getUserByUserId(ywy_userid, function(err, ywyObj){

	

	

	
}


module.exports = obj;