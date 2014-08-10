var utils = require('../lib/utils.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var wxRoute = require('../weixCl/wCl.js');
var oauthCl = require('../viewCl/OAuthCl.js')

var wxAppBl = require('../bl/wxApp.js');



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

var getUserMid = function(req, res, next){ //中间件，获取用户信息
	var openid = req.param('wxopenid');
	var userid = req.param('wxuserid');
	var appid =  req.param('wxappid');

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
		app.get('/', function(req,res){
			var count = req.csession['count'];
			if(!count) count = 1;
			else count++;
			req.csession['count'] = count;
			req.csflush(); 
			res.send('welcome count: '+count.toString());
		})
	})
}


module.exports = function(app){
	addroute(app);
}