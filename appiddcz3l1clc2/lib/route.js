var utils = require('../lib/utils.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var wxRoute = require('../weixCl/wCl.js');



var wxAppBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var apiInfo = require('../apiCl/apiInfo.js');
var apiLottery = require('../apiCl/apiLottery.js');
var apiScoreSys = require('../apiCl/apiScoreSys.js');
var apiShop = require('../apiCl/apiShop.js');
var apiSuggest = require('../apiCl/apiSuggest.js');
var apiUser = require('../apiCl/apiUser.js');

var viewUser = require('../viewCl/viewUserCl.js');
var viewService = require('../viewCl/viewServiceCl.js');
var viewSuggest = require('../viewCl/viewSuggestCl.js');
var viewInfo = require('../viewCl/viewInfo.js');



//console.log(global.config)
wxAppBl.getByEname(config.appEname,function(err,appObj){
      if(err){
        logger.error('wxAppBl.getByEname get error,ename is %s, error: %s',config.appEname,err);
        return
      }
      if(!appObj){
      	logger.error('wxAppBl.getByEname not found appObj, appEname is %s', config.appEname);
        return
      }
      appObj2 = {
      	_id:appObj._id,
		appName:appObj.appName,
		appEname:appObj.appEname,
		appTelphone:appObj.appTelphone,
		appCustomTel:appObj.appCustomTel,
		appPicture:appObj.appPicture.split(',') || [],
		appIntro:appObj.appIntro,
		wxAppId:appObj.wxAppId,
		wxAppSecret:appObj.wxAppSecret,
		writeTime:  moment(appObj.writeTime).format('YYYY-MM-DD hh:mm:ss'),  
      }

      global.wxAppObj = appObj2;
})

var uploadPath = path.join(__dirname,'..','upload');
if(!fs.existsSync(uploadPath)){
	fs.mkdirSync(uploadPath);
	console.log('success create log folder: %s',uploadPath)
}

var getUserMid = function(req, res, next){ //中间件，获取用户信息
	var openid = req.param('wxopenid');
	var userid = req.param('wxuserid');
	var appid =  global.wxAppObj._id

	var genReqUserObj = function(uobj){
		if(!uobj){
				return res.send(404, { error: 1,data:'未找到用户' })
		}
		var bindObj = false;
		if(uobj.bind && uobj.bind.length>0){
			uobj.bind.forEach(function(bindApp){
				if(bindApp.appId == global.wxAppObj._id){ //如果用户已经绑定了本app
					bindObj = bindApp
				}
			})
		}

		delete uobj.bind
		req.wxBinder = bindObj;
		req.wxuobj = {
			  _id:uobj.uobj._id,
			  appId:uobj.uobj.appId,                 //appId表示用户第一次绑定的app应用id
			  wxName:uobj.uobj.wxName,                   //微信用户昵称
			  wxAvatar:uobj.uobj.wxAvatar,             //微信用户头像
			  wxLoc: uobj.uobj.wxLoc,    //用户最近一次经纬度保存
			  wxGroup:uobj.uobj.wxGroup,                //用户分组，默认是cf常发
			  appLoginName:uobj.uobj.appLoginName,       //登录名
			  appLoginPassword:uobj.uobj.appLoginPassword,       //密码
			  appUserName:uobj.uobj.appUserName,       //会员姓名
			  appUserMobile:uobj.uobj.appUserMobile,  //会员手机号
			  appUserSex:uobj.uobj.appUserSex, //0表示女性，1表示男性
			  appUserBirth: moment(uobj.uobj.appUserBirth).format('YYYY-MM-DD'), //会员生日
			  appUserScore:uobj.uobj.appUserScore,
			  isShow:uobj.uobj.isShow, //是否启用这个用户,1表示启用，0表示未启用
			  writeTime: moment(uobj.uobj.writeTime).format('YYYY-MM-DD hh:mm:ss'),   //写入时间
		};
		next();
	}


	if(openid){//优先通过openid来查找用户
		userBl.getUserByOpenid(openid,function(err,uobj){
			if(err){
				logger.error('getUserMid userBl.getUserByOpenid error,openid is %s, error is %s', openid, err)
				return res.send({error: 1,data:err})
			}
			if(!uobj || uobj.length == 0){ //如果没有找到用户，则执行enter方法，去数据库注册一个用户
				userBl.enter(openid, appid, function(err,uobj2){
					if(err) return res.send({error: 1,data:err});
					return genReqUserObj(uobj2)
				})
			}
			else{
				return genReqUserObj(uobj)
			}
		})
	}
	else if(userid){//如果没有传openid，则使用userid
		userBl.getUserByUserId(userid,function(err,uobj){
			if(err){
				logger.error('getUserMid userBl.getUserByUserId error,openid is %s, error is %s', openid, err)
				return res.send({error: 1,data:err})
			}

			return genReqUserObj(uobj)
		})
	}
	else{
		res.send(403, { error: 1,data:'no openid or userid' });
	}
	
}




var addroute = function(app){
	wxRoute(app); //定义微信的路由
	
	//登录
	//app.get('/', loginCl.Login);


	//api路由
	app.get('/api/user/enter', getUserMid,function(req,res){
		res.json({
			wxBinder:req.wxBinder,
			wxuobj:req.wxuobj,
		})
	})

	app.post('/api/info/sendrecommend', getUserMid, apiInfo.sendReCommend);
	app.get('/api/info/startkd', getUserMid, apiInfo.kdSearch);

	app.post('/api/lottery/startlottery',getUserMid, apiLottery.startLottery);
	app.post('/api/lottery/improveinfo',getUserMid, apiLottery.improveInfo);

	app.post('/api/score/daysign',getUserMid, apiScoreSys.daySign);

	app.post('/api/shop/exchangeprize',getUserMid, apiShop.exchangePrize);

	app.post('/api/suggest/sendSuggest',getUserMid, apiSuggest.sendSuggest);
	app.post('/api/suggest/sendService',getUserMid, apiSuggest.sendService);
	app.post('/api/suggest/sendMessage',getUserMid, apiSuggest.sendMessage);
	app.post('/api/suggest/sendOrder',getUserMid, apiSuggest.sendOrder);

	app.post('/api/user/binder',getUserMid, apiUser.binder);
	app.post('/api/user/modify',getUserMid, apiUser.modify);


	//view router
	//user center
	//用户绑定和会员卡
	app.get('/view/user/binder',getUserMid, viewUser.binder);
	app.get('/view/user/card',getUserMid, viewUser.card);
	//app.get('/view/user/day',getUserMid, viewUser.day);
	//app.get('/view/user/shop',getUserMid, viewUser.shop);
	//service center
	//小区列表
	app.get('/view/service/colist',getUserMid, viewService.coList);
	app.get('/view/service/codetail',getUserMid, viewService.coDetail);
	//新闻动态优惠
	app.get('/view/service/copromotion',getUserMid, viewService.coPromotion);
	app.get('/view/service/coact',getUserMid, viewService.coAct);
	app.get('/view/service/newsall',getUserMid, viewService.newsAll);
	app.get('/view/service/newsdetail',getUserMid, viewService.newsDetail);
	//物业服务和周边配套
	app.get('/view/service/coservicelist',getUserMid, viewService.coservicelist);
	app.get('/view/service/coservice',getUserMid, viewService.coService);
	app.get('/view/service/conear',getUserMid, viewService.coNear);

	app.get('/view/service/appdetail',getUserMid, viewService.appDetail);

	//一键呼叫
	app.get('/view/service/call',getUserMid, viewService.coCall);

	//在线留言
	app.get('/view/suggest/reqmessage',getUserMid, viewSuggest.reqMessage);
	//推荐新客户
	app.get('/view/suggest/recommend',getUserMid, viewSuggest.reCommend);
	
	//app.get('/view/service/appdetail',getUserMid, viewService.appDetail);
	//app.get('/view/service/colist',getUserMid, viewService.coList);
	//app.get('/view/service/coservice',getUserMid, viewService.coService);
	//app.get('/view/service/codetail',getUserMid, viewService.coDetail);
	//app.get('/view/service/conear',getUserMid, viewService.coNear);
	//app.get('/view/service/newsall',getUserMid, viewService.newsAll);
	//app.get('/view/service/colist',getUserMid, viewService.coList);
	//app.get('/view/service/conews',getUserMid, viewService.coNews);
	//app.get('/view/service/coact',getUserMid, viewService.coAct);
	//
	//app.get('/view/service/newsdetail',getUserMid, viewService.newsDetail);
	//suggest center
	//app.get('/view/suggest/recommend',getUserMid, viewSuggest.reCommend);
	//app.get('/view/suggest/custom',getUserMid, viewSuggest.custom);
	//app.get('/view/suggest/reqservice',getUserMid, viewSuggest.reqService);
	//app.get('/view/suggest/reqcomplaints',getUserMid, viewSuggest.reqComplaints);
	//app.get('/view/suggest/reqmessage',getUserMid, viewSuggest.reqMessage);
	//app.get('/view/suggest/myreply',getUserMid, viewSuggest.myReply);
	//app.get('/view/suggest/ordersearch',getUserMid, viewSuggest.orderSearch);


	app.get('/', function(req,res){ //验证token有效性
		if(!req.query.nonce || !req.query.signature || !req.query.timestamp || !req.query.echostr){
			return res.send('param wrong')
		}
		//console.log(req.query)
		var signature = (req.query.signature || '').toLowerCase();
		var echostr = req.query.echostr;

		var sha1Array = [req.query.nonce,req.query.timestamp,config.wxAppToken].sort();
		var mySign = utils.sha1(sha1Array.join('')).toLowerCase();

		if(signature == mySign){
			res.send(echostr)
		}
		else{
			res.send('signature:'+signature+' != mySign:' +mySign)
		}

	})

}


module.exports = function(app){
	addroute(app);
}