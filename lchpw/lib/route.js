var utils = require('../lib/utils.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var wxRoute = require('../weixCl/wCl.js');
var guidDl = require('../dl/guidModel.js')


var wxAppBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var apiUser = require('../apiCl/apiUser.js');


var viewUser = require('../viewCl/viewUserCl.js');
var viewService = require('../viewCl/viewServiceCl.js');

var defaultGuidNum = 120;
guidDl.setGuidFromNum(defaultGuidNum,function(err,doc){
	if(err) return console.log('set guid to '+defaultGuidNum+'error, '+err)
	console.log('set guid to default num '+defaultGuidNum)
})

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
			  currentSite:config.currentSite,
			  _id:uobj.uobj._id,
			  appId:uobj.uobj.appId,                 //appId表示用户第一次绑定的app应用id
			  appUserName:uobj.uobj.appUserName || '未知用户',       //会员姓名
			  appUserMobile:uobj.uobj.appUserMobile,  //会员手机号
			  appUserSex:uobj.uobj.appUserSex, //0表示女性，1表示男性
			  appUserBirth: moment(uobj.uobj.appUserBirth).format('YYYY-MM-DD'), //会员生日
			  appUserScore:uobj.uobj.appUserScore,
			  isShow:uobj.uobj.isShow, //是否启用这个用户,1表示启用，0表示未启用
			  code1:uobj.uobj.code1,
			  code2:uobj.uobj.code2,
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
				  appId:global.wxAppObj._id,                 //appId表示用户第一次绑定的app应用id
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
	var appId = global.wxAppObj._id;
	var openId = req.wxBinder.openId;
	if(req.wxBinder.appUserType == 0){
		return res.json({'error':1,'data':'非认证会员不能操作'})
	}
	next();
}

var v2_mid = function(req,res,next){
	req.is_v2 = true;
	next();
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

	//下面是ajax控制器
	
	//用户注册
	app.post('/api/user/binder',getUserMid, apiUser.binder);
	//用户修改资料
	app.post('/api/user/modify',getUserMid, apiUser.modify);

	//发送推荐用户
	app.post('/api/user/recommend',getUserMid, apiUser.recommend);
	//申请结佣
	app.post('/api/user/createtransac',getUserMid, apiUser.createtransac);
	//ajax检查是否有推荐状态消息
	app.post('/api/user/getrecnews',getUserMid, apiUser.getrecnews);
	
	//下面是页面控制器


	//新闻列表,不用登录
	app.get('/view/service/newsall', getUserMid, viewService.newsall);
	//新闻详情页面,不用登录
	app.get('/view/service/newsdetail', getUserMid, viewService.newsDetail);
	//直接查看推荐说明
	app.get('/view/service/newsdetail2', getUserMid, viewService.newsDetail2);	
	//一键呼叫，预约服务,不用登录
	app.get('/view/service/call', getUserMid, viewService.call);


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
	
	//v2 路由
	//新闻详细页v2
	app.get('/view/service/newsdetail_v2', v2_mid, getUserMid, viewService.newsDetail);
	//推荐用户v2
	app.get('/view/user/recommend_v2', v2_mid, getUserMid, viewUser.recommend);
	//推荐记录v2
	app.get('/view/user/recrecord_v2', v2_mid, getUserMid, viewUser.recrecord);
	//用户注册
	app.get('/view/user/regist_v2', v2_mid, getUserMid, viewUser.regist);
	//用户修改资料
	app.get('/view/user/modify_v2', v2_mid, getUserMid, viewUser.modify);
	//用户登录后主页
	app.get('/view/user/index_login_v2', v2_mid, getUserMid, viewUser.index_login_v2);
	//用户未登录主页
	app.get('/view/user/index_nologin_v2', v2_mid, getUserMid, viewUser.index_nologin_v2);
	//封面页
	app.get('/view/user/cover_v2', v2_mid, getUserMid, viewUser.cover_v2);
	//入口页
	app.get('/view/enter_v2', v2_mid, getUserMid, viewUser.enter_v2);

	//我的经纪人
	app.get('/view/user/myagent', v2_mid, getUserMid, viewUser.myagent)

	//增加页面接口
	//1、兑换商品页面
	//2、推荐用户页面
	//3、排行榜页面
	//4、拍卖页面

	app.get('/', function(req,res){
		var count = req.csession['count'];
		if(!count) count = 1;
		else count++;
		req.csession['count'] = count;
		req.csflush(); 
		res.send('welcome count: '+count.toString());
	})

}


module.exports = function(app){
	addroute(app);
}