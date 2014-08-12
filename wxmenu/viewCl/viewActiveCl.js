var userBl = require('../bl/wxUser.js');
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

    //req.session[appEname+'_oauth_openid'] = 'qwe'

	var openId = req.session[appEname+'_oauth_openid'] 


	if(!openId){
		return res.send(500,'not have openId Auth fail')
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

			//console.log(uobj)
			//console.log(aObj)

			req.fromUserObj = uobj.uobj;
			req.activeObj = {
				appEname:appEname,
				openId:openId,
				activeObj:aObj
			}
			return next()
		})//end getActiveByEname
		
	})


}



obj.activePage = function(req,res){ //活动页面展示

		var toUserId = req.query.touserid;
		var activeEname = req.query.ename;
		var openId = req.activeObj.openId
		var fromUserId = req.fromUserObj._id
		var templateName = req.activeObj.activeObj.ename
		var acitveId = req.activeObj.activeObj._id

		if(!toUserId){//重新加载本页
			res.redirect(req.originalUrl+'&touserid='+fromUserId)
			return
		}

		var myObj = false
		if(toUserId == fromUserId){//如果是自己的页面
			myObj = req.fromUserObj
		}

		activeBl.getIfHasAdd(acitveId, openId, toUserId, function(err, hasAdd){
			if(err) return res.send(500,err)
			var  hasAdd = false
			if(hasAdd) hasAdd = true

			activeBl.getCountByActiveIdAndToUserId(acitveId, toUserId, function(err,count){
				if(err) return res.send(500,err)

				res.render('active/'+templateName+'.ejs',{
						'myObj':myObj,           //是否是自己的活动页面
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