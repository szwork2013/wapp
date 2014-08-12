var OAuth = require('wechat').OAuth;
var url = require('url')
var userModel = require('../dl/userModel.js'); //加载用户模型

var userBl = require('../bl/wxUser.js');
var appBl = require('../bl/wxApp.js');
var utils = require('../lib/utils.js');
var moment = require('moment');

var obj = {}
var oauth_back_url = '/oauth/back';
var oauth_oob = 'oob';
var oauth_logout = '/oauth/logout';
var oauth_state = 'wujb'



//必须使用client session
obj.OAuthMiddle = function(req,res,next){

	var pathname = url.parse(req.originalUrl).pathname || ''

	req.session['oauth_jump'] = null;
	//根据路由获取appEname
	try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return next(e)
    }
    var hasFound = appBl.getAppObjByEname(appEname);

    if(!hasFound){
        logger.error('wxAppBl.getByEname not found appObj, appEname is %s', config.appEname);
        return next('no such app')
    }
    req.wxAppObj = hasFound;

    var wxopenid = req.session[appEname+'_oauth_openid']

	//如果用户存在session，则根据session获取用户信息
	if(wxopenid && wxopenid.length > 0){
		obj.getUserByOpenId(req,res,wxopenid,function(err,userObj){
			if(err){
		
				return	res.send(500,err);
			}
			if(!userObj) return obj.jumpOAuthUrl(req,res);

			next();//如果已经有身份，则next进入下一个流程
		})
	}
	else{
		obj.jumpOAuthUrl(req,res)
	}
}

obj.jumpOAuthUrl = function(req,res){

	
	var oauth_jump_back = global.config.currentSite + oauth_back_url+'/'+req.wxAppObj.appEname;

	try{
		var oauth_jump = decodeURIComponent(global.config.currentSite+req.originalUrl);
	}
	catch(e){
		res.send(500,e)
	}
	req.session['oauth_jump'] = oauth_jump;

	//生成跳转到腾讯微信的授权url地址
	var url = req.wxAppObj.api.getAuthorizeURL(oauth_jump_back, oauth_state, req.wxAppObj.oauthScope);


	res.redirect(url)

}


obj.getUserByOpenId = function(req,res,openId, cb){ //根据openid,获取用户信息
	var openid = openId;
	var appid =  req.wxAppObj._id;

	var genReqUserObj = function(uobj){
		if(!uobj){
				return res.send(404, { error: 1,data:'未找到用户' })
		}
		var bindObj = false;
		if(uobj.bind && uobj.bind.length>0){
			uobj.bind.forEach(function(bindApp){
				if(bindApp.appId == req.wxAppObj._id){ //如果用户已经绑定了本app
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

obj.oauthJumpBack = function(app,applist){


	//赋值api
	applist.forEach(function(appObj){
		//生成多个api实例
		appObj.api = new OAuth(appObj.wxAppId.trim(), appObj.wxAppSecret.trim());
		var oauthScope = appObj.oauthScope;
		var appEname = appObj.appEname

		//如果不启用OAuth
		if(appObj.useOAuth == 0){
			return;
		}
		//测试oauth是否能正常工作地址 oob
		app.get('/oauth/'+appEname+'/'+oauth_oob, obj.OAuthMiddle, function(req,res){

		
			if(!count) count = 1;
			else count++;
		


			var count2 = req.session['count'];
			if(!count2) count2 = 1;
			else count2++;
			req.session['count'] = count2;

			//拼接用户数据，全部打印出来
			var sendObj = {

				wxuobj:req.wxuobj,
				wxBinder:req.wxBinder,
	
				count2:req.session['count'],
				oauth_user:req.session[appEname+'_oauth_user']
			} 

			var resStr = JSON.stringify(sendObj) + '<br/>'+
						'<h1>微信昵称：'+req.wxuobj.wxName+'</h1>'+
						'<h1>用户地址：'+req.wxuobj.wxAddress+'</h1>'+
						'<h1>头像：<img src="'+req.wxuobj.wxAvatar+'" /></h1>'

	
			res.send(resStr);

		})

		app.get(oauth_back_url+'/'+appEname,function(req,res){
			var code = req.query.code;
			var state = req.query.state;
			var oauth_jump = req.session['oauth_jump'] || ('/oauth/'+appEname+'/'+oauth_oob)

			var pathname = url.parse(req.originalUrl).pathname || ''

			//根据路由获取appEname
			try{
		      var appEname = pathname.split('/')[3] || ''
		      //console.log(appEname)
		    }
		    catch(e){
		      return next(e)
		    }

		    var appObj = appBl.getAppObjByEname(appEname)
		    req.wxAppObj = appObj;

		    if(!appObj){
		    	return res.send(404,'not found appEname is %s',appEname)
		    }

			req.session['oauth_jump'] = null;

			if(state != oauth_state){
			
				return res.send(403,'state error')
			}
			if(!code || code == 'authdeny'){
				
				return res.send(403,'user not authorize')
			}

			//获取access token
			appObj.api.getAccessToken(code, function(err,result){
				if(err){
				
					return res.send(403,err)
				}

				//snsapi_userinfo和snsapi_base
				//仅获取openid

				obj.getUserByOpenId(req, res, result.openid, function(err,doc){

						if(err){				
							return	res.send(500,err);
						}
						if(!doc){				
							return	res.send(500,'user get fail');
						}

						//正常处理，将openid写入session，这样下次就不会自动跳去授权了

						//生成跳转地址
						var r = obj.createJumpPath(oauth_jump, result.openid);
						if(r.error == 1){
							return res.send(500,r.data);
						}
						oauth_jump = r.data;

						//如果是仅获取openid，自动跳转的
						if(appObj.oauthScope == 'snsapi_base'){
							req.session[appEname+'_oauth_openid'] = result.openid

							return res.redirect(oauth_jump);

						}
						//获取oauth返回的结果
						var result = result.data;

						//如果是oauth获取用户详细信息的
						appObj.api.getUser(result.openid, function(err,userinfo){
							
							if(err){	
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
								if(err){
									return	res.send(500,err); 
								}
								if(!updatedoc){
									return	res.send(500,'update weixin info error'); 
								}

								req.session[appEname+'_oauth_user'] = oauth_user;
								req.session[appEname+'_oauth_openid'] = result.openid;
								//完毕跳转到指定页面
								res.redirect(oauth_jump);
							});// end userModel.createOneOrUpdate			

						});//end api.getUser

					});// end obj.getUserByOpenId

			});//end api.getAccessToken

		})//end app.get

	})

	
	app.get(oauth_logout,function(req,res){
		req.session.destroy();

		return res.send('logout')
	})
	
}



module.exports = obj;