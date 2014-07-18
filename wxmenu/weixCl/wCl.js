var wechat = require('wechat');
var utils = require('../lib/utils.js')
var wxReplyDl = require('../dl/wxReplyModel.js');
var wxMenuDl = require('../dl/menuModel.js');
var wxAppBl = require('../bl/wxApp.js');
var crypto = require('crypto')

var ERR_REPLY = '系统错误，请您重试';
var UNKNOW_REPLY = '未知操作'


var currentSite = global.config.currentSite;


var wxGenSingleObj = function(replyObj,openId,appId){
    var Obj = {}
    Obj.title = replyObj.replyTitle.trim()  || '';
    Obj.description = replyObj.replyDesc.trim()  || '';
    Obj.picurl = currentSite + replyObj.replyPicture.trim()  || ''; //拼接静态图片url地址
    Obj.url = replyObj.replyUrl.trim()  || '';

    if(replyObj.replyUrl.indexOf('?') != -1){ //增加 url 参数
        Obj.url = replyObj.replyUrl+'&wxopenid='+openId+'&wxappid='+appId;
    }
    else{
        Obj.url = replyObj.replyUrl+'?wxopenid='+openId+'&wxappid='+appId;
    }

    return Obj;
}

var wxGenReplyObj = function(replyObj,openId,appId){ //生成 回复 对象

    var replyObj = replyObj;
    var wxObj;

    if(replyObj.length == 1){ //如果数组只有一个
       replyObj = replyObj[0];
    }

    if(Array.isArray(replyObj)){ //如果传入的是数组
        var r = replyObj.some(function(v){
            return replyObj.replyKind == 2;
        });
        if(r){
          wxObj = replyObj[0].replyDesc;
        }
        else{
          wxObj = [];
          replyObj.forEach(function(v){
            wxObj.push(wxGenSingleObj(v,openId,1)); //生成单个回复对象
          })
        }
    }
    else{ //如果传入的是对象
      if(replyObj.replyKind == 2){
          wxObj = replyObj.replyDesc;
      }
      else{
          wxObj = [wxGenSingleObj(replyObj,openId)];        
      }
    }
    //console.log(wxObj)
    return wxObj;
}

var checkSign = function(req,res,next){
  console.log(11111111111111111)
  console.log(req.query)

  if(req.query["signature"] &&  req.query["timestamp"] && req.query["nonce"]){
      //如果有随机数，表示验证
      var signature = req.query["signature"].toLowerCase();
      var timestamp = req.query["timestamp"];
      var nonce = req.query["nonce"];
      var echostr = req.query["echostr"];

      var token = req.wxAppObj.wxAppToken;

      var temparray = [token, timestamp, nonce].sort();
      var tempstr = temparray.join('');
      var sha1str = crypto.createHash('sha1').update(tempstr).digest('hex');


      console.log(sha1str, signature);

      if(signature == sha1str){
          res.end(echostr)
      } 
      else{
          res.end('signature error')
      }
      return;
  }

  //如果没有随机数则下一步
  return next();
}



var getAppInfo = function(req,res,next){

    try{
      var appEname = req.param('appename') || ''
      //console.log(appEname)
    }
    catch(e){
      return next(e)
    }

    wxAppBl.getByEname(appEname,function(err,appObj){
      if(err){
        logger.error('wxAppBl.getByEname get error,ename is %s, error: %s',config.appEname,err);
        return next('no such app')
      }
      if(!appObj){
        logger.error('wxAppBl.getByEname not found appObj, appEname is %s', config.appEname);
        return next('no such app')
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
        wxAppToken:appObj.wxAppToken,
        writeTime:  moment(appObj.writeTime).format('YYYY-MM-DD hh:mm:ss'),  
      }

      req.wxAppObj = appObj2;
      console.log(req.wxAppObj)
      next();
    })


}


var wxFunction = function(app){
    var wxAppId = config.wxAppId;
    var wxAppSecret =  config.wxAppSecret;
    var wxAppToken =  config.wxAppToken;
    var appEname = config.appEname;

    app.use('/wechat', getAppInfo);
    app.use('/wechat', checkSign);
    app.use('/wechat', wechat(wxAppToken, wechat.text(function (message, req, res, next) {
            // message 为文本内容
            // { ToUserName: 'gh_d3e07d51b513',
            // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
            // CreateTime: '1359125035',
            // MsgType: 'text',
            // Content: 'http',
            // MsgId: '5837397576500011341' }

          //console.log(message)
          


          var appId = req.wxAppObj._id;

          wxReplyDl.findByObj({ //查找自动回复，有没有匹配的
                    appId:appId,
                    isShow:1,
                    replyType:1,
                    replyKey:{
                      $in:[message.Content.trim()]
                    }
                },function(err, menuDoc){
                     if(err){
                          logger.error('wxReplyDl.findOneByObj get error, replyType is 1, message.Content is %s, error: %s',message.Content.trim(),err);
                          res.reply(ERR_REPLY);
                          return;
                      }
                      if(menuDoc.length>0){ //如果找到匹配项
                         res.reply(wxGenReplyObj(menuDoc, message.FromUserName, appId)); //创建回复对象
                         return;
                      }

                      wxReplyDl.findOneByObj({ //如果没有找到匹配项，去查找默认回复
                          appId:appId,
                          isShow:1,
                          replyType:4,
                      },function(err, menuDoc){
                           if(err){
                                logger.error('wxReplyDl.findOneByObj get error, replyType is 4, message.Content is %s, error: %s',message.Content.trim(),err);
                                res.reply(ERR_REPLY);
                                return;
                            }
                            if(menuDoc){ //找到默认回复
                               res.reply(wxGenReplyObj(menuDoc, message.FromUserName, appId)); //创建回复对象
                               return;
                            }
                            else{ //什么都没找到
                              //res.reply(UNKNOW_REPLY); //创建回复对象
                              return;
                            }

                        })//end wxReplyModel.findOneByObj

                })//end wxReplyModel.findOneByObj

      }).event(function (message, req, res, next) { //菜单事件点击
        
        // message为事件内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125022',
        // MsgType: 'event',
        // Event: 'LOCATION',
        // Latitude: '23.137466',
        // Longitude: '113.352425',
        // Precision: '119.385040',
        // MsgId: '5837397520665436492' }
        
            var appId = req.wxAppObj._id;
            message.Event = message.Event.toLowerCase()

            var appId = req.wxAppObj._id;
            if(message.Event == 'click'){ //如果是点击事件
              var EventKey = message.EventKey;
              //如果key没找到，或者key不是mongodb  _id，表示非菜单点击

             

              wxMenuDl.findAll({
                replyKey:EventKey
              },0,100,function(err,menuobj){
                  if(err){
                        logger.error('wxMenuDl.findAll get error, menu click,menu key is %s, error: %s',EventKey,err);
                        res.reply(ERR_REPLY);
                        return;
                  }

                  if(!menuobj || menuobj.length == 0){
                        return res.reply(UNKNOW_REPLY);
                  }

                  var replyId = menuobj[0].replyId
                  var replyIdAry = replyId.split(',');

                  if(replyIdAry.indexOf('0') != -1 || replyIdAry.indexOf('-1') != -1){
                      return res.reply(UNKNOW_REPLY);
                  }

                  wxReplyDl.findByObj({
                        '_id':{
                          '$in':replyIdAry
                        },
                        isShow:1,
                      },function(err, menuDoc){
                        if(err){
                            logger.error('wxReplyDl.findByObj get error, replyType is 2, menu click,menu key is %s, error: %s',EventKey,err);
                            res.reply(ERR_REPLY);
                            return;
                        }
                        if(!menuDoc || menuDoc.length == 0){ //如果没有找到菜单
                            logger.info('wxReplyDl.findByObj not found, replyType is 2, menu click, menu key is %s',EventKey);
                            return res.reply(UNKNOW_REPLY);
                        }
                        
                        res.reply(wxGenReplyObj(menuDoc, message.FromUserName, appId)); //创建回复对象

                  })
                })

            }
            if(message.Event =='subscribe'){ //用户第一次订阅

                wxReplyDl.findOneByObj({ //查找此 appid 下的关注回复
                        appId:appId,
                        isShow:1,
                        replyType:3,
                      },function(err, replyDoc){
                        if(err){
                            logger.error(' wxReplyDl.findOneByObj message.Event ==subscribe, error: %s',err);
                            res.reply(ERR_REPLY);
                            return;
                        }
                        if(!replyDoc){ //如果没有则不返回
                           return;
                        }

                        res.reply(wxGenReplyObj(replyDoc, message.FromUserName, appId)); //创建回复对象

                  })
                
            }
     
      })

      /*
      .image(function (message, req, res, next) {
        // message为图片内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359124971',
        // MsgType: 'image',
        // PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
        // MediaId: 'media_id',
        // MsgId: '5837397301622104395' }
      }).voice(function (message, req, res, next) {
        // message为音频内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125022',
        // MsgType: 'voice',
        // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
        // Format: 'amr',
        // MsgId: '5837397520665436492' }
      }).video(function (message, req, res, next) {
        // message为视频内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125022',
        // MsgType: 'video',
        // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
        // ThumbMediaId: 'media_id',
        // MsgId: '5837397520665436492' }
      }).location(function (message, req, res, next) {
        // message为位置内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125311',
        // MsgType: 'location',
        // Location_X: '30.283950',
        // Location_Y: '120.063139',
        // Scale: '15',
        // Label: {},
        // MsgId: '5837398761910985062' }
      }).link(function (message, req, res, next) {
        // message为链接内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125022',
        // MsgType: 'link',
        // Title: '公众平台官网链接',
        // Description: '公众平台官网链接',
        // Url: 'http://1024.com/',
        // MsgId: '5837397520665436492' }
      }).event(function (message, req, res, next) {
        // message为事件内容
        // { ToUserName: 'gh_d3e07d51b513',
        // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
        // CreateTime: '1359125022',
        // MsgType: 'event',
        // Event: 'LOCATION',
        // Latitude: '23.137466',
        // Longitude: '113.352425',
        // Precision: '119.385040',
        // MsgId: '5837397520665436492' }
      })
      */


    ));

}



module.exports = wxFunction