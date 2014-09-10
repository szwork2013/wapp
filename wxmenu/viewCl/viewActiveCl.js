var userBl = require('../bl/wxUser.js');
var appBl = require('../bl/wxApp.js');
var activeBl = require('../bl/activeBl.js');
var url = require('url')

var utils = require('../lib/utils.js');
var moment = require('moment')
var obj = {}


//互动的中间件
obj.activeMiddle = function(req,res,next){
	var toUserId = req.query.touserid;
	var activeEname = req.query.ename;

	var pathname = url.parse(req.originalUrl).pathname || ''
	try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return res.send(500,e)
    }

    //req.session[appEname+'_oauth_openid'] = '123'

	var openId = req.session[appEname+'_oauth_openid'] 


	if(!openId){
		return res.send(500,'not have openId Auth fail')
	}

	appBl.getByEname(appEname, function(err,appObj){
		if(err){
			return res.send(500,err)
		}
		if(!appObj){
			return res.send(500,'not found user')
		}

			userBl.getUserByOpenid(openId,function(err,uobj){
				if(err){
					return res.send(500,err)
				}
				if(!uobj){
					return res.send(500,'not found user')
				}
				

				//根据ename，查找活动
				activeBl.getActiveByEname(activeEname, function(err, aObj){
					if(err) return res.send(500,err) 
					if(!aObj) return res.send(500,'not found active')

					if(!toUserId){//重新加载本页
						res.redirect(req.originalUrl+'&touserid='+uobj.uobj._id)
						return;
					}
					//如果定义了跳转，则直接跳转到指定页面
					var redirect_url = aObj.url.trim()
					if(redirect_url){
						//增加openid参数
						if(redirect_url.indexOf('?') == -1){
							redirect_url = redirect_url + '?openid='+openId
						}
						else{
							redirect_url = redirect_url + '&openid='+openId
						}
						//跳转
						res.redirect(redirect_url)
						return;
					}


					userBl.getUserByUserId(toUserId,function(err,toUserObj){
						if(err) return res.send(500,err) 
						if(!toUserObj) return res.send(500,'not found toUserObj')
						//console.log(toUserObj)
						//console.log(uobj)
						//console.log(aObj)
						req.toUserObj = toUserObj.uobj;
						req.appId = appObj._id;
						req.appEname = appEname;
						req.fromUserObj = uobj.uobj;
						req.activeObj = {
							appEname:appEname,
							openId:openId,
							activeObj:aObj
						}
						return next()



					})

				})//end getActiveByEname
				
			})
	})
	
}



obj.activePage = function(req,res){ //活动页面展示

		var toUserId = req.query.touserid;
		var activeEname = req.query.ename;
		var openId = req.activeObj.openId
		var fromUserId = req.fromUserObj._id
		var templateName = req.activeObj.activeObj.ename
		var acitveId = req.activeObj.activeObj._id
/*
		if(!toUserId){//重新加载本页
			res.redirect(req.originalUrl+'&touserid='+fromUserId)
			return
		}
*/

		var toUserObj = {}
		var isMyPage = false
		if(toUserId == fromUserId){//如果是自己的页面
			isMyPage = true;
			toUserObj = req.fromUserObj
		}
		else{
			toUserObj = req.toUserObj
		}

		if(toUserObj.appUserName == '未认证会员'){
				toUserObj.appUserName = ''
		}
		if(toUserObj.appUserMobile.length != 11){
			toUserObj.appUserMobile = ''
		}

		activeBl.getIfHasAdd(acitveId, openId, toUserId, function(err, hasObj){
			if(err) return res.send(500,err)
			var  hasAdd = false
			if(hasObj) hasAdd = true

			activeBl.getCountByActiveIdAndToUserId(acitveId, toUserId, function(err,count){
				if(err) return res.send(500,err)


				res.render('active/'+templateName+'.ejs',{
						'appId':req.appId,
						'appEname':req.appEname,
						'toUserObj':toUserObj,           //是否是自己的活动页面
						'isMyPage':isMyPage,
						'toUserId':toUserId,     //目标用户的用户id
						'fromUserId':fromUserId, //来源用户的用户id
						'fromOpenId':openId,    //来源用户的openid
						'activeId':acitveId,   //活动id
						'supportCount':count,  //目前这个用户，这个互动支持的数量
						'hasAdd':hasAdd 	//是否已经支持过
					})

			})//end getCountByActiveIdAndToUserId

		})//end getIfHasAdd

}



obj.activeRank = function(req,res){

	var ename = req.query.ename
	if(!ename){
		return res.json({error:0,data:'缺少参数ename'})
	}
	activeBl.getRankByEname(ename,100,function(err,list){
		if(err) return res.json({error:1,data:err})
		res.json({error:0,data:list})
	})


}


obj.addSupport = function(req,res){

	var pathname = url.parse(req.originalUrl).pathname || ''
	try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return res.json({error:1,data:e})
    }

    //req.session[appEname+'_oauth_openid'] = 'qwe'

	var activeId = req.body.activeId;
	var fromOpenId = req.session[appEname+'_oauth_openid']
	var fromUserId = req.body.fromUserId;
	var toUserId = req.body.toUserId;


	activeBl.addSupport(activeId, fromOpenId, fromUserId, toUserId, function(err,doc){
		if(err) return res.json({error:1,data:err})
		res.json({error:0,data:doc})
	})

	
}

module.exports = obj;