var utils = require('../lib/utils.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var wxRoute = require('../weixCl/wCl.js');



var wxAppBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var apiSpecial = require('../apiCl/apiSpecial.js');
var apiScoreSys = require('../apiCl/apiScoreSys.js');
var apiShop = require('../apiCl/apiShop.js');
var apiUser = require('../apiCl/apiUser.js');
var apiInfo = require('../apiCl/apiInfo.js');

var viewUser = require('../viewCl/viewUserCl.js');
var viewService = require('../viewCl/viewServiceCl.js');
var viewGame = require('../viewCl/viewGameCl.js');
var viewShop = require('../viewCl/viewShopCl.js');


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

	//下面是ajax控制器
	//每日签到
	app.post('/api/score/daysign',getUserMid, apiScoreSys.daySign);
	//游戏完成积分
	app.post('/api/score/game',getUserMid, apiScoreSys.game);
	//转发完成积分
	app.post('/api/score/forwarding',getUserMid, apiScoreSys.forwarding);
	//用户注册
	app.post('/api/user/binder',getUserMid, apiUser.binder);
	//用户修改资料
	app.post('/api/user/modify',getUserMid, apiUser.modify);

	//我的评论
	app.post('/api/user/mycomment',getUserMid, apiUser.mycomment);
	//我的收藏
	app.post('/api/user/myfavor',getUserMid, apiUser.myfavor);
	//进数据数据推送接口
	app.post('/api/user/activeback',getUserMid, apiUser.activeback);//to do coding

	//获取专刊中某一片文章的评论
	app.post('/api/special/getcomment',getUserMid, apiSpecial.getcomment);
	//向某一个专刊发送评论
	app.post('/api/special/sendcomment',getUserMid, apiSpecial.sendcomment);
	//收藏某一篇文章
	app.post('/api/special/sendfavor',getUserMid, apiSpecial.sendfavor);
	//取消收藏某一篇文章
	app.post('/api/special/cancelfavor',getUserMid, apiSpecial.cancelfavor);

	//获取新闻公告和专刊列表页
	app.post('/api/info/newslist',getUserMid, apiInfo.newslist);
	app.post('/api/info/speciallist',getUserMid, apiInfo.speciallist);
	
	//排行榜接口
	app.post('/api/user/scorerank',getUserMid, apiUser.scoreRank);
	//推荐用户接口
	app.post('/api/user/recommend',getUserMid, apiUser.recommend);
	//兑换商品
	app.post('/api/shop/exchangeprize',getUserMid, apiShop.exchangePrize);
	//兑换商品
	app.post('/api/shop/saleprize',getUserMid, apiShop.saleprize);

	//增加api接口
	//1、兑换商品接口
	//2、推荐用户接口，增加相应积分
	//3、排行榜接口
	//4、对某个拍品出价拍卖

	//下面是页面控制器

	//活动页面，可能是金数据投票列表页,乐活空间活动
	app.get('/view/service/activelist',getUserMid, viewService.activelist);
	//乐活空间活动
	app.get('/view/service/newsall',getUserMid, viewService.newsall);
	//物语空间公告
	app.get('/view/service/announce',getUserMid, viewService.announce);   
	   

	//乐活空间公告、物语空间公告、物语空间活动详细页面
	app.get('/view/service/newsdetail',getUserMid, viewService.newsDetail);

	//一键呼叫，预约服务
	app.get('/view/service/call',getUserMid, viewService.call);

	//专刊列表,根据type显示不同的专刊内容
	app.get('/view/service/speciallist',getUserMid, viewService.speciallist);
	//专刊详细
	app.get('/view/service/specialdetail',getUserMid, viewService.specialdetail);

	//游戏列表页
	app.get('/view/game/gamelist',getUserMid, viewGame.gamelist);
	//游戏详细页
	app.get('/view/game/gamedetail',getUserMid, viewGame.gamedetail);

	//帖子空间，ajax动态获取我的评论和收藏
	app.get('/view/user/mycomment',getUserMid, viewUser.mycomment);
	//帖子空间，ajax动态获取我的评论和收藏
	app.get('/view/user/myfavor',getUserMid, viewUser.myfavor);

	//我的订单
	app.get('/view/user/myorder',getUserMid, viewUser.myorder);
	//拍卖页面
	app.get('/view/shop/salelist',getUserMid, viewShop.salelist);
	//推荐用户页面
	app.get('/view/user/recommend',getUserMid, viewUser.recommend);
	//排行榜页面
	app.get('/view/user/scorelist',getUserMid, viewUser.scorelist);
	//积分规则
	app.get('/view/user/scorerule',getUserMid, viewUser.scorerule);
	//兑换商品页面
	app.get('/view/shop/shoplist',getUserMid, viewShop.shoplist);
	//签到页面
	app.get('/view/user/day',getUserMid, viewUser.day);

	//---未完成
	//修改资料
	app.get('/view/user/modify',getUserMid, viewUser.modify);
	//用户注册
	app.get('/view/user/regist',getUserMid, viewUser.regist);
	
	//积分查询
	//app.get('/view/user/myscore',getUserMid, viewUser.myscore);
	
	
	



	
	

	
	
	

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