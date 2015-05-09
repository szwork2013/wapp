var utils = require('../lib/utils.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var os = require('os')
var platForm = os.platform()

var wxRoute = require('../weixCl/wCl.js');
var oauthCl = require('../viewCl/OAuthCl.js')
var activeCl = require('../viewCl/viewActiveCl.js')
var userCl = require('../viewCl/viewUserCl.js')
var lotteryCl = require('../viewCl/viewLotteryCl.js')
var voteCl = require('../viewCl/viewVoteCl.js')
var insuranceCl = require('../viewCl/viewInsuranceCl.js')
var hzYewuyuanCl = require('../viewCl/viewHzYewuyuanCl.js')



var wxAppBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var voteBl = require('../bl/wxVote.js')
var activeBl = require('../bl/activeBl.js')

//api wx
var apiWx = require('../apiCl/apiWeixin.js');
//api active
var apiActive = require('../apiCl/apiActive.js');
//lottery
var apiLottery = require('../apiCl/apiLottery.js');
//vote
var apiVote = require('../apiCl/apiVote.js');
//sms
var apiSmsLog = require('../apiCl/apiSmsLog.js');

//console.log(global.config)
function getAllApp(callback){

	wxAppBl.getAllApp(function(err,appList){
	      if(err){
	        logger.error('getAllApp error: %s',err);
	        return process.exit(2)
	      }
	      if(appList.length == 0){
	      	logger.error('not found app data');
	        return
	      }
	      var appGlobalList = [];

	      appList.forEach(function(appObj){
      		var o = {
			      	_id:appObj._id,
			      	appId:appObj._id,
					appName:appObj.appName,
					appEname:appObj.appEname,
					appTelphone:appObj.appTelphone,
					appCustomTel:appObj.appCustomTel,
					appPicture:appObj.appPicture.split(',') || [],
					appIntro:appObj.appIntro,
					wxAppId:appObj.wxAppId,
					wxAppSecret:appObj.wxAppSecret,
					wxAppToken:appObj.wxAppToken,
					useOAuth:appObj.useOAuth,
					oauthScope:appObj.oauthScope,
					writeTime:  moment(appObj.writeTime).format('YYYY-MM-DD hh:mm:ss'),  
			      }

			appGlobalList.push(o)
	      })

	      global.appGlobalList = appGlobalList;

	      callback(appGlobalList)
	})
}




var uploadPath = path.join(__dirname,'..','upload');
if(!fs.existsSync(uploadPath)){
	fs.mkdirSync(uploadPath);
	console.log('success create log folder: %s',uploadPath)
}


var activeFrontMid = function(req, res, next){ //中间件，获取活动的信息，用以oauth认证
	var activeEname = req.param('ename');
	if(!activeEname){
		return res.send(404, 'not found ename param')
	}

	activeBl.getActiveByEname(activeEname, function(err, activeObj){
		if(err) return res.send(500, err)
		if(!activeObj) return res.send(404, 'not found active')
		req.activeObj = activeObj
		req.activeMid = true
		next()
	})

}


var getUserMid = function(req, res, next){ //中间件，获取用户信息
	var openid = req.param('wxopenid') || req.param('openid');
	var userid = req.param('wxuserid');
	var appid =  req.param('wxappid');

	//去掉缓存
	res.set({'ETag':Date.now().toString()})

	var genReqUserObj = function(uobj){
		if(!uobj){
				return res.send(404, { error: 1,data:'未找到用户' })
		}
		var bindObj = false;
		if(uobj.bind && uobj.bind.length>0){
			uobj.bind.forEach(function(bindApp){
				if(bindApp.appId == appid){ //如果用户已经绑定了本app
					bindObj = bindApp
				}
			})
		}

		delete uobj.bind
		req.wxBinder = bindObj;
		req.wxuobj = {
			  currentSite:config.currentSite,
			  _id:uobj.uobj._id,
			  appId:uobj.uobj.appId,                 //appId表示用户第一次绑定的app应用id
			  appUserName:uobj.uobj.appUserName || '未知用户',       //会员姓名
			  appUserMobile:uobj.uobj.appUserMobile,  //会员手机号
			  appUserType:uobj.uobj.appUserType,  //会员类型
			  appUserCode:uobj.uobj.appUserCode,  //会员类型
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
		
		if(userid=='0'){ //如果是分享来的,则使用用户id为0的客户id
			req.wxBinder = {
				appUserType:0
			};
			req.wxuobj = {
				  currentSite:config.currentSite,
				  _id:0,
				  appId:appid,                 //appId表示用户第一次绑定的app应用id
				  appUserName:'未知用户',       //会员姓名
				  appUserMobile:0,  //会员手机号
				  appUserSex:0, //0表示女性，1表示男性				  
				  appUserScore:0,
			};
			next();
			return;
		}
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

var checkIsReg = function(req,res,next){
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var openId = req.wxBinder.openId;
	if(req.wxBinder.appUserType == 0){
		return res.json({'error':1,'data':'非认证会员不能操作'})
	}
	next();
}


var addroute = function(app){
	var app = app;

	//先获取所有的 app开发商
	getAllApp(function(applist){

		 //定义微信的路由
		wxRoute(app,applist);
		//定义微信的OAuth接口
		oauthCl.oauthJumpBack(app,applist);


		//定义完微信接口，再定义路由
		/*
			
			//登录
			//app.get('/', loginCl.Login);


			//api路由
			app.get('/api/user/enter', getUserMid,function(req,res){
				res.json({
					wxBinder:req.wxBinder,
					wxuobj:req.wxuobj,
				})
			})

			//下面是ajax控制器
			
			//用户注册
			app.post('/api/user/binder',getUserMid, apiUser.binder);
			//用户修改资料
			app.post('/api/user/modify',getUserMid, apiUser.modify);

			//发送推荐用户
			app.post('/api/user/recommend',getUserMid, apiUser.recommend);
			//我的收藏
			app.post('/api/user/createtransac',getUserMid, apiUser.createtransac);
			
			//下面是页面控制器


			//新闻列表,不用登录
			app.get('/view/service/newsall', viewService.newsall);
			//新闻详情页面,不用登录
			app.get('/view/service/newsdetail', viewService.newsDetail);	
			//一键呼叫，预约服务,不用登录
			app.get('/view/service/call', viewService.call);


			//推荐用户
			app.get('/view/user/recommend',getUserMid, viewUser.recommend);
			//推荐记录
			app.get('/view/user/recrecord',getUserMid, viewUser.recrecord);
			//某条结佣详细信息
			app.get('/view/user/transacdetail',getUserMid, viewUser.transacDetail);
			//用户注册
			app.get('/view/user/regist',getUserMid, viewUser.regist);
			//用户中心
			app.get('/view/user/modify',getUserMid, viewUser.modify);
			

			//增加页面接口
			//1、兑换商品页面
			//2、推荐用户页面
			//3、排行榜页面
			//4、拍卖页面
		*/

		//api 微信查找此appEname下是否存在这个openid
		app.get('/api/wx/checkopenid/:appename', apiWx.checkOpenId)


		//active活动页面，需要oauth支持
		//如果是本地开发环境
    	if(platForm == 'win32'){
    		app.get('/active/:appename', activeCl.activeMiddle, activeCl.activePage)
    	}
    	else{
    		app.get('/active/:appename', activeFrontMid, oauthCl.OAuthMiddle, activeCl.activeMiddle, activeCl.activePage)
    	}
		
		app.get('/votepage/:appename/:voteename', activeCl.voteWebPage)

		app.post('/active_data/:appename/addsupport', apiActive.addSupport)
		//获取排名
		app.get('/active_data/getrank', activeCl.activeRank)
		//获取业务员平均分
		app.get('/active_data/avgscore', activeCl.avgScore)



		//获取区间活动的排名
		app.get('/active_data/getrangerank', apiActive.getActiveRangeRank)
		//active exchange prize
		app.post('/active_data/:appename/exchangeprize', apiActive.startExchangePrize);

		
		//end active
		app.post('/api/user/modify',getUserMid, userCl.modify);



		//lottery
		app.get('/lottery/:appename', getUserMid, lotteryCl.lotteryPage)
		app.get('/lottery/:appename/info', apiLottery.getLotteryInfo)
		app.post('/lottery/:appename/start', apiLottery.startLottery)
		app.post('/lottery/:appename/complete', apiLottery.improveInfo)

		//vote
		app.get('/vote/:appename', getUserMid, voteCl.votePage)//投票页面
		app.get('/vote/:appename/info', apiVote.getVoteInfo)//投票详细信息，包括分组名称，包括我的投票记录
		app.post('/vote/:appename/start', apiVote.startVote)//投某人一票，不传某人参数，表示随机
		app.get('/vote/:appename/items', apiVote.getItemsInfo)//根据分组查询所有投票项信息列表
		app.get('/vote/:appename/rank', apiVote.getRank)//根据分组或不分组，查询排名
		app.post('/vote/:appename/myrecord', apiVote.getMyRecord) //获取用户的记录
		app.get('/vote/:appename/getvoteinfo2', apiVote.getVoteInfo2) //给web投票用的获取投票信息

		//获取jsapi-ticket
		app.get('/api/:appename/jsconfig', apiWx.getJsConfig) //给web投票用的获取投票信息
		app.get('/testshare', oauthCl.testShare)

		//game insurance
		app.get('/insurance/unionlife', insuranceCl.page)
		app.get('/insurance/unionlife/getbonus', insuranceCl.getBonus)

		//合众人寿业务员名片页面
		//app.get('/view/hzyewuyuan', getUserMid, hzYewuyuanCl.hzyewuyuan_mingpian)
		//合众人寿业务员名片页面打分
		app.post('/api/hzstar', hzYewuyuanCl.hzstar)
		//获得某一个客户对业务员的打分情况
		app.get('/api/hzstarstatus', hzYewuyuanCl.hzstarstatus)
		//发送短信验证码
		app.post('/api/:appename/smscode', apiSmsLog.sendSms)

		//获得某一个客户对业务员的打分情况
		app.get('/api/hzywyinfo', hzYewuyuanCl.hzywyinfo)







		app.get('/', function(req,res){
			var count = req.session['count'];
			if(!count) count = 1;
			else count++;
			req.session['count'] = count
			res.send('welcome count: '+count.toString()+'pid id: '+ process.pid.toString());
		})

		app.get('/clear', function(req,res){
			req.session.destroy()
			req.session = null
			res.render('clear/clearCookie.ejs', {
				header:JSON.stringify(req.headers)
			})
		})
	})
}


module.exports = function(app){
	addroute(app);

	//执行每日任务
	voteBl.setSchedule()
}