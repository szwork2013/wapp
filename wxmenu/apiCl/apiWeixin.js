var API = require('wechat-api');
var appBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');

var url = require('url')
var utils = require('../lib/utils.js');
var moment = require('moment')
var util = require('util')
var accessTokenDl = require('../dl/accessTokenModel.js');

var obj = {}
var token = 'MEAPI2014'

obj.checkOpenId = function(req,res){
    var appename = req.param('appename')
    var openId = req.query.openid || '';
    var sign = req.query.sign || '';
    if(!openId){
      return res.send({'error':1, 'data':'no openid'})
    }
    //对比签名
    var mysign = utils.md5(openId+token)
    if(sign.toLocaleLowerCase() != mysign.toLocaleLowerCase()){
      return res.send({'error':1, 'data':'sign error'})
    }

    appBl.getByEname(appename, function(err, appObj){
        if(err) return res.send({'error':1, 'data':err})
        if(!appObj) return res.send({'error':1, 'data':'not found app'})
        appId = appObj._id.toString()

        userBl.getUserByOpenid(openId, function(err, userObj){
            if(err) return res.send({'error':1, 'data':err})
            if(!userObj) return res.send({'error':1, 'data':'not found openid'})
            return res.send({'error':0, 'data':'ok'})
        })
    })
}

obj.jsStr = 'window.jsticket_error="%s";window.jsconfig=%s;'
obj.createJsStr = function(dict){
    
    return util.format(obj.jsStr, dict['jsticket_error'], dict['jsconfig'])

}



obj.getJsConfig = function(req,res){
    

    //console.log(requestedUrl)
    //增加响应头
    res.set('Content-Type', 'text/javascript')
    res.set('Cache-Control', 'no-cache')
    res.set('ETag', Date.now().toString())

    //console.log(req.get('Referer'))

    var meUrl = req.query.url || req.get('Referer')


    if(!meUrl){
        return res.send(obj.createJsStr({'jsticket_error':1, 'jsconfig':'not have url param'}))
    }
    try{
        meUrl = decodeURIComponent(meUrl)
    }
    catch(e){
        return res.send(obj.createJsStr({'jsticket_error':1, 'jsconfig':'invalid url param'}))
    }



    var appename = req.param('appename')
    appBl.getByEname(appename, function(err, appObj){
        if(err) return res.send(obj.createJsStr({'jsticket_error':1, 'jsconfig':err}))
        if(!appObj) return res.send(obj.createJsStr({'jsticket_error':1, 'jsconfig':'not found app'}))

        var curApi = obj['wxApi'][appename]

        var param = {
             debug: false,
             jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
             url: meUrl
            };



        //获取js的config文件
        curApi.getJsConfig(param, function(err, result){
            if(err){
                //console.log(err)
                logger.error('obj.getJsSign -> curApi.getJsConfig error,err is %s, appename %s', err, appename)
                return res.send(obj.createJsStr({'jsticket_error':1, 'jsconfig':err}))
            }

            //console.log(result)

            return res.send(obj.createJsStr({'jsticket_error':0, 'jsconfig':JSON.stringify(result)}))

        });
       
    })

}









obj.wxApi = {}

obj.ApiInit = function(){


    //初始化所有app的api和jsapi
    appBl.getAllApp(function(err,list){
        if(err){
            throw(err)
            return
        }
        list.forEach(function(item){

                var ename = item.appEname
                var appid = item.wxAppId
                var secret = item.wxAppSecret

                
                //声明api
                obj['wxApi'][ename] = new API(appid, secret, function (callback) {
                      // 传入一个获取全局token的方法
                      accessTokenDl.findOneByObj({
                        'appId':appid,
                        'type':'access_token'
                      }, function(err, data){
                            // console.log('^^^^^^^^^^^')
                            // console.log(err, data)
                            if(err) return callback(err);
                            if(!data) return callback(null, '{}')
                            callback(null, JSON.parse(data.token));
                      })

                }, function (token, callback) {
                            // console.log('**********')
                            // console.log(token)
                            // console.log('**********')
                      // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
                      // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
                      accessTokenDl.createOneOrUpdate({
                        'appId':appid,
                        'type':'access_token'
                      }, {
                        'appId':appid,
                        'type':'access_token',
                        'token':JSON.stringify(token)
                      }, callback)
                      //fs.writeFile('access_token.txt', JSON.stringify(token), callback);
                });
                
                //注册ticket处理函数
                obj['wxApi'][ename].registerTicketHandle(function(type, callback){

                        accessTokenDl.findOneByObj({
                            'appId':appid,
                            'type':'js_ticket'
                          }, function(err, data){
                            // console.log('&&&&&&&&&&&&&&&')
                            // console.log(err, data)
                                if(err) return callback(err);
                                if(!data) return callback(null, '')
                                callback(null, data.ticket);
                          })

                        // settingModel.getItem(type, {key: 'weixin_ticketToken'}, function (err, setting) {
                        //    if (err) return callback(err);
                        //    callback(null, setting.value);
                        //  });


                }, function(type, ticketToken, callback){

                            // console.log('########')
                            // console.log(ticketToken)
                            // console.log('#####')
                        accessTokenDl.createOneOrUpdate({
                            'appId':appid,
                            'type':'js_ticket'
                          }, {
                            'appId':appid,
                            'type':'js_ticket',
                            'ticket':JSON.stringify(ticketToken)
                          }, callback)

                        // settingModel.setItem(type, {key:'weixin_ticketToken', value: ticketToken}, function (err) {
                        //    if (err) return callback(err);
                        //    callback(null);
                        //  });

                });

                console.log(util.format('app %s api ready', item.appEname))
        })


    })

        


}

setTimeout(function(){
    obj.ApiInit()
},1000)



module.exports = obj;