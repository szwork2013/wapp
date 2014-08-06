var OAuth = require('wechat').OAuth;
var api = new OAuth(global.config.wxAppId, global.config.wxAppSecret);
var userModel = require('../dl/userModel.js'); //加载用户模型

var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var moment = require('moment');

var obj = {}
var oauth_back_url = '/oauth/back';
var oauth_oob = '/oauth/oob';
var oauth_logout = '/oauth/logout';

//必须使用client session
obj.OAuthMiddle = function(req,res,next){
	req.session['oauth_jump'] = null;
	var wxopenid = req.session['oauth_openid'] //|| req.csession['oauth_openid'] //|| req.query.wxopenid;

	//如果用户存在session，则根据session获取用户信息
	if(wxopenid && wxopenid.length > 0){
		req.csession['oauth_openid'] = wxopenid;
		obj.getUserByOpenId(req,res,wxopenid,function(err,userObj){
			if(err){
				req.csflush();
				return	res.send(500,err);
			}
			if(!userObj) return obj.jumpOAuthUrl(req,res);
			req.csflush();
			next();//如果已经有身份，则next进入下一个流程
		})
	}
	else{
		obj.jumpOAuthUrl(req,res)
	}
}

obj.jumpOAuthUrl = function(req,res){

	
	var oauth_jump_back = global.config.currentSite + oauth_back_url;

	try{
		var oauth_jump = decodeURIComponent(global.config.currentSite+req.originalUrl);
	}
	catch(e){
		res.send(500,e)
	}
	req.session['oauth_jump'] = oauth_jump;

	//生成跳转到腾讯微信的授权url地址
	var url = api.getAuthorizeURL(oauth_jump_back,'wujb',global.config.oauthScope||'snsapi_base');

	req.csflush();
	res.redirect(url)

}


obj.getUserByOpenId = function(req,res,openId, cb){ //根据openid,获取用户信息
	var openid = openId;
	var appid =  global.wxAppObj._id;

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
			  wxName:uobj.uobj.wxName,//用户微信昵称
			  wxAvatar:uobj.uobj.wxAvatar,//用户微信头像
			  wxAddress:uobj.uobj.wxAddress,//用户地址
			  appId:uobj.uobj.appId,                 //appId表示用户第一次绑定的app应用id
			  appUserName:uobj.uobj.appUserName || '未知用户',       //会员姓名
			  appUserMobile:uobj.uobj.appUserMobile,  //会员手机号
			  appUserSex:uobj.uobj.appUserSex, //0表示女性，1表示男性
			  appUserBirth: moment(uobj.uobj.appUserBirth).format('YYYY-MM-DD'), //会员生日
			  appUserScore:uobj.uobj.appUserScore,
			  isShow:uobj.uobj.isShow, //是否启用这个用户,1表示启用，0表示未启用
			  writeTime: moment(uobj.uobj.writeTime).format('YYYY-MM-DD hh:mm:ss'),   //写入时间
		};
		cb(null, req.wxuobj);
	}


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

obj.createJumpPath = function(path,openid){

	try{
		path = decodeURIComponent(path)
	} 
	catch(e){
		return {error:1,data:e}
	}

	if(path.indexOf('?') == -1){
		path +=  '?wxopenid='+openid
	}
	else{
		path +=  '&wxopenid='+openid
	}

	return {error:0,data:path}
}

obj.oauthJumpBack = function(app){


	//测试oauth是否能正常工作地址 oob
	app.get(oauth_oob, obj.OAuthMiddle, function(req,res){

		var count = req.csession['count'];
		if(!count) count = 1;
		else count++;
		req.csession['count'] = count;


		var count2 = req.session['count'];
		if(!count2) count2 = 1;
		else count2++;
		req.session['count'] = count2;

		//拼接用户数据，全部打印出来
		var sendObj = {
			csession:req.csession,
			wxuobj:req.wxuobj,
			wxBinder:req.wxBinder,
			count:req.csession['count'],
			count2:req.session['count'],
			oauth_user:req.session['oauth_user']
		} 

		var resStr = JSON.stringify(sendObj) + '<br/>'+
					'<h1>微信昵称：'+req.wxuobj.wxName+'</h1>'+
					'<h1>用户地址：'+req.wxuobj.wxAddress+'</h1>'+
					'<h1>头像：<img src="'+req.wxuobj.wxAvatar+'" /></h1>'

		req.csflush();
		res.send(resStr);

	})

	app.get(oauth_logout,function(req,res){
		req.session.destroy();
		req.csession['oauth_openid'] = null
		return res.send('logout')
	})

	app.get(oauth_back_url,function(req,res){
		var code = req.query.code;
		var state = req.query.state;
		var oauth_jump = req.session['oauth_jump'] || oauth_oob;

		req.session['oauth_jump'] = null;

		if(state != 'wujb'){
			req.csflush();
			return res.send(403,'state error')
		}
		if(!code || code == 'authdeny'){
			req.csflush();
			return res.send(403,'user not authorize')
		}

		//获取access token
		api.getAccessToken(code, function(err,result){
			if(err){
				req.csflush();
				return res.send(403,err)
			}

			//snsapi_userinfo和snsapi_base
			//仅获取openid

			obj.getUserByOpenId(req, res, result.openid, function(err,doc){

					if(err){
						req.csflush();					
						return	res.send(500,err);
					}
					if(!doc){
						req.csflush();					
						return	res.send(500,'user get fail');
					}

					//正常处理，将openid写入session，这样下次就不会自动跳去授权了
					req.csession['oauth_openid'] = result.openid

					//生成跳转地址
					var r = obj.createJumpPath(oauth_jump, result.openid);
					if(r.error == 1){
						req.csflush();
						return res.send(500,r.data);
					}
					oauth_jump = r.data;

					if(global.config.oauthScope == 'snsapi_base'){
						req.csflush();
						return res.redirect(oauth_jump);
					}
					
					//如果是oauth获取用户详细信息的
					api.getUser(result.openid, function(err,userinfo){
						
						if(err){
							req.csflush();				
							return	res.send(500,err);
						}

						//将用户信息写入sessoin
						var oauth_user = {
							openid:userinfo.openid,
							nickname:userinfo.nickname,
							sex:userinfo.sex,
							province:userinfo.province ||'',
							city:userinfo.city ||'',
							country:userinfo.country ||'',
							headimgurl:userinfo.headimgurl || '',
						};

						//更新用户的微信属性
						userModel.createOneOrUpdate({
							_id:doc._id
						},{
							 wxName:userinfo.nickname,                   //微信用户昵称
							 wxAvatar:userinfo.headimgurl,                //微信用户头像
							 wxAddress:userinfo.country+','+userinfo.province+','+userinfo.city
						},function(err,updatedoc){

							//处理完异常
							req.csflush();
							if(err){
								return	res.send(500,err); 
							}
							if(!updatedoc){
								return	res.send(500,'update weixin info error'); 
							}

							req.session['oauth_user'] = oauth_user;
							req.session['oauth_openid'] = req.csession['oauth_openid'];
							//完毕跳转到指定页面
							res.redirect(oauth_jump);
						});// end userModel.createOneOrUpdate			

					});//end api.getUser

				});// end obj.getUserByOpenId

		});//end api.getAccessToken

	})//end app.get

}



module.exports = obj;