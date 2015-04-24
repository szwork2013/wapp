
var activeBl = require('../bl/activeBl.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var smsDl = require('../dl/smsLogModel.js')
var smsBl = require('../tools/hz_must_prize.js')

var url = require('url')
var utils = require('../lib/utils.js');
var moment = require('moment')

var os = require('os')
var platForm = os.platform()

var obj = {}

//发送短信
//post ajax 参数 mobile
obj.sendSms = function(req,res){

	var pathname = url.parse(req.originalUrl).pathname || ''
	try{
      var appEname = pathname.split('/')[2] || ''
      //console.log(appEname)
    }
    catch(e){
      return res.json({error:1,data:e})
    }

    //req.session[appEname+'_oauth_openid'] = 'qwe'

  //如果是本地开发环境


	var userId = req.session[appEname+'_userid']


  if(!userId){
      logger.error('apiActive.addSupport: session lost, fromUserId: %s, appEname: %s, process.id: %s', (fromUserId||'undefined'), appEname, process.pid.toString())
      return res.send({error:1, data:'身份丢失，请重新进入'})
  }

	var mobile = req.body.mobile;

  if(!/^[0-9]{11}$/.test(mobile)){
    return res.send({error:1, data:'手机号格式有误'})
  }


  //查找用户是否存在
  userBl.getUser({'_id':userId}, function(err, doc){
      if(err){
        return res.send({error:1, data:'内部错误，请重试'})
      }

      ///console.log(doc)
      if(!doc || doc.bind.length == 0){
        logger.error('apiActive.addSupport userBl.getUser: not found doc.bind,userid: %s', userId)
        return res.send({error:1, data:'出错啦，请关闭重试'})
      }
      
      //查找此用户最新的一条记录
      smsDl.findAll({
        'userId':userId
      },0,1,function(err, doclist){
          if(err) return res.send({error:1, data:err})
          var now = Date.now()
          //如果以前存在记录，判断时间
          if(doclist.length > 0){
              var lastTs =  doclist[0].writeTime.getTime()
              if(now - lastTs <= 1000*30){//30秒内不重发
                  return res.send({error:1, data:'校验码发送太频繁'})
              }
          }

          var smsCode = utils.md5(now.toString() + now.toString()).slice(5, 11)

          var insertData = {
              'userId':userId,
              'mobileNumber':mobile,
              'smsCode':smsCode,
              'logIp':req.ips[0] || '127.0.0.1',
              'type':1,
              'writeTime':new Date()
          }

          var content = '【合众人寿】感谢您参加“十年相伴，真情回馈”合众人寿十周年客服节活动，为我们可爱的伙伴们评分，您也可以抽取精美礼品。您的邀请码是：'+smsCode+'。'
          
          smsBl.sendSms2(mobile, content, function(err, ok){
              if(err) return res.send({error:1, data:'短信发送失败，请重试'})

              smsDl.insertOneByObj(insertData, function(err, doc){
                    if(err) return res.send({error:1, data:err})
                    res.send({error:0, data:'短信发送成功'})
              })//end smsDl.insertOneByObj

          })//end smsBl.sendSms

      })//end smsDl.findAll


  })//end userBl.getUser

	
}




//检查用户id，手机号，短消息是否合法
obj.checkSms = function(userId, mobile, smsCode, cb){

    smsDl.findAll({
        'userId':userId,
        'mobileNumber':mobile,
        'smsCode':smsCode,
        'type':1,
      },0,1,function(err, doclist){
          if(err) return cb(err)
          if(doclist.length == 0){
            return cb(null, false)
          }
          else{
            var now = Date.now()
            var lastTs =  doclist[0].writeTime.getTime()
            //如果以前存在记录，判断时间
            if(doclist.length > 0){  
                if(now - lastTs > 1000*60*30){//30分钟以上的
                    return cb(null, false)
                }
            }
            smsDl.createOneOrUpdate({
                'userId':userId,
                'mobileNumber':mobile,
                'smsCode':smsCode,
            }, {
              'type':2,
            }, function(err){
                if(err) return cb(err)
                return cb(null, true)
            })
            
          }

    })
}






module.exports = obj;