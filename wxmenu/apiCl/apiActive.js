var activeBl = require('../bl/activeBl.js');
var userBl = require('../bl/wxUser.js');
var appBl = require('../bl/wxApp.js');
var utils = require('../lib/utils.js');

var wxCl = require('../weixCl/wCl.js')
var url = require('url')
var utils = require('../lib/utils.js');
var moment = require('moment')
var ccapCl = require('../viewCl/ccapCl.js')

var obj = {}

//支持用户
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
	var fromUserId = req.session[appEname+'_userid']


  if(!fromUserId){
      logger.error('apiActive.addSupport: session lost, fromUserId: %s, appEname: %s, process.id: %s', (fromUserId||'undefined'), appEname, process.pid.toString())
      return res.send({error:1, data:'身份丢失，请重新进入'})
    }

	var fromUserId = req.body.fromUserId;
	var toUserId = req.body.toUserId;
  var reqIp = req.ips[0] || '127.0.0.1';


  userBl.getUser({'_id':fromUserId}, function(err, doc){
    if(err){
      return res.send({error:1, data:'内部错误，请重试'})
    }
    if(!doc){
      return res.send({error:1, data:'未找到用户，请重试'})
    }
    if(doc.bind.length == 0){
      logger.error('apiActive.addSupport userBl.getUser: not found doc.bind,userid: %s', fromUserId)
      return res.send({error:1, data:'出错啦，请关闭重试'})
    }
    var fromOpenId = doc.bind[0].openId

    activeBl.addSupport(activeId, fromOpenId, fromUserId, toUserId, function(err,doc){
      if(err) return res.json({error:1,data:err})
      
      res.json({error:0,data:doc})
    },reqIp)
  })


	

	
}





//兑换奖品
obj.startExchangePrize = function(req,res){

	var pathname = url.parse(req.originalUrl).pathname || ''
	try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return res.json({error:1,data:e})
    }

    //真实需注释
    //req.session[appEname+'_userid'] = '53ecbe65e00fd324efd73032'

    var fromUserId = req.session[appEname+'_userid'];

    if(!fromUserId){
      logger.error('apiActive.startExchangePrize: session lost, fromUserId: %s, appEname: %s, process.id: %s', (fromUserId||'undefined'), appEname, process.pid.toString())
    	return res.send({error:1, data:'身份丢失，请重新进入'})
    }
    var toUserId = req.body.toUserId;
    if(fromUserId !== toUserId){
    	return res.send({error:1, data:'必须在自己的主页才能兑换奖品'})
    }

   

  qobj = {}
	qobj.prizeId = req.body.prizeId
	qobj.userId = req.body.toUserId
	qobj.truename = req.body.truename
  qobj.appHome = req.body.appHome
	qobj.mobile = req.body.mobile 
  qobj.recordIp = req.ips[0] || '127.0.0.1'

	//开始兑换
	activeBl.exchangePrize(qobj, function(err, recobj){
		if(err) return res.send({error:1, data:err})
		res.send({error:0, data:recobj})
	})
}


//获取一次活动只能支持一次获取分数一次的分数排名，前最多100名
obj.getActiveRangeRank = function(req,res){

    var activeId = req.query.activeid;
    var limit = (req.query.limit-0) || 10
    //最多查找100个rank
    if(limit > 100){
        limit = 100
    }

    activeBl.getActiveRangeRank(activeId, limit, function(err,doc){
        if(err) return res.json({error:1,data:err})
        var doc = doc.slice(0, 100)
        res.json({error:0,data:doc})
    })

}



//获取最新参加活动的100个人
obj.getActiveNewMember = function(req,res){

    var activeId = req.query.activeid;
    var limit = (req.query.limit-0) || 10
    //最多查找100个rank
    if(limit > 2000){
        limit = 2000
    }

    activeBl.getActiveNewMember(activeId, limit, function(err,doc){
        if(err) return res.json({error:1,data:err})
        res.json({error:0,data:doc})
    })

}

obj.getMoney = function(req,res){

    var pathname = url.parse(req.originalUrl).pathname || ''
    try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return res.json({error:1,data:e})
    }

    var userId = req.session[appEname+'_userid'];
    //没有身份的用户记录错误日志，应该是直接抛接口
    if(!userId){
      logger.error('apiActive.startExchangePrize: session lost, userId: %s, appEname: %s, process.id: %s', (userId||'undefined'), appEname, process.pid.toString())
      return res.send({error:1, data:'身份丢失，请重新进入'})
    }

    var replayEname = req.body.replayEname
    var activeId = req.body.activeId
    var capVal = req.body.capVal

    var ccapCheck = ccapCl.ccapCheck(req,res,capVal)
    if(!capVal || !ccapCheck){
          res.send({error:1, data:'验证码错误'})
          return
    }


    userBl.getUser({'_id':userId}, function(err, doc){
          if(err){
            return res.send({error:1, data:'内部错误，请重试'})
          }
          if(doc.bind.length == 0){
            logger.error('apiActive.addSupport userBl.getUser: not found doc.bind,userid: %s', doc)
            return res.send({error:1, data:'出错啦，请关闭重试'})
          }
          var openId = doc.bind[0].openId
          var wxAddress_new = doc.uobj.wxAddress_new

          var userCity = ''
          if(wxAddress_new){
              userCity = (wxAddress_new.split(',')[2] || '').toLocaleLowerCase()
          }

          appBl.getByEname(appEname, function(err, appObj){

              if(err) return res.send({error:1, data:err})
              var appId = appObj._id.toString()


              activeBl.getActiveById(activeId, function(err, activeDoc){
                  if(err) return res.send({error:1, data:err})
                  //检查活动是否已经开始或者未开始
                  var isValid = activeBl.checkActiveTime(activeDoc)
                  if(isValid !== true){
                      return res.send({error:1, data:isValid})
                  }


                  activeBl.getReplyDocByEname(replayEname, function(err, replyDoc){
                       if(err) return res.send({error:1, data:err})
                       if(replyDoc.replyKind != 3){
                            return res.send({error:1, data:'invalid replayEname'})
                       }


                       //检查mustCity是否陪陪
                       var mustCity = replyDoc.moneyMustCity.split(',')
                       if(mustCity.length>0 && userCity==''){
                          //城市不匹配
                          return res.send({error:1, data:'对不起，红包已经领完了'})
                       }
                       //如果需要匹配城市
                       if(mustCity.length>0){
                          var hasFound = 0
                          for(var x=0; x<mustCity.length; x++){
                              if(mustCity[x] == userCity){
                                  hasFound++
                              }
                          }
                          //城市不匹配
                          if(hasFound==0){
                            return res.send({error:1, data:'对不起，红包已经发放完毕'})
                          }
                       }
                       
                       //验证通过发放红包
                       wxCl.moneySend(req, {}, openId, replyDoc, appId, function(err, moneyVal){
                            if(err) return res.send({error:1, data:err})
                            res.send({error:0, data:moneyVal})

                       })//end wxCl.moneySend

                  })//end activeBl.getReplyDocByEname

              })//end activeBl.getActiveById

          })//end appBl.getByEname

    })//end userBl.getUser
}



module.exports = obj;