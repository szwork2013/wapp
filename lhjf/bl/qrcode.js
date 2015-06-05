var API = require('wechat-api');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var config = require('../config/config.js')
var url = require('url')
var utils = require('../lib/utils.js');
var moment = require('moment')
var util = require('util')
var accessTokenDl = require('../dl/accessTokenModel.js');

var obj = {}
var token = 'MEAPI2014'
var appEName = config.appEname
var appid = config.wxAppId
var secret = config.wxAppSecret

var api = new API(appid, secret, function (callback) {
              // 传入一个获取全局token的方法
              accessTokenDl.findOneByObj({
                'appId':appEName,
                'type':'access_token'
              }, function(err, data){
                    if(err){
                        logger.error('API -> accessTokenDl.findOneByObj, err is %s', err)
                        return callback(err);
                     } 
                     if(!data){
                        logger.error('API -> accessTokenDl.findOneByObj, no data, appEName: %s', appEName)
                        return callback(null, null)
                     }

                    if(typeof(data.token) == 'string'){
                        try{
                            var token = JSON.parse(data.token)
                        }
                        catch(e){
                            return callback('new API parse json error, appEName: %s', appEName)
                        }
                    }
                    callback(null, token);
              })

        }, function (token, callback) {
              // console.log('**********')
              // console.log(token)
              // console.log('**********')
              // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
              // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
              accessTokenDl.createOneOrUpdate({
                'appId':appEName,
                'type':'access_token'
              }, {
                'appId':appEName,
                'type':'access_token',
                'token':JSON.stringify(token)
              }, function(err, data){

                if(err){
                    logger.error('API -> accessTokenDl.createOneOrUpdate, err is %s', err)
                    return callback(err);
                 } 
                 if(!data){
                    logger.error('API -> accessTokenDl.createOneOrUpdate, no data, appEName: %s', appEName)
                    return callback('not save data')
                 }
                 callback(null, token);

              })
              //fs.writeFile('access_token.txt', JSON.stringify(token), callback);
 })




//创建临时二维码
obj.createTempQRCode = function(qrcodeGuid, callback){

    api.createTmpQRCode(qrcodeGuid, 604800, function(err, result){
        if(err) return callback(err)
        var imgUrl = api.showQRCodeURL(titck);
        callback(null, imgUrl)
    });

}

//创建永久二维码
obj.createForverQRCode = function(qrcodeGuid, callback){

    api.createLimitQRCode(qrcodeGuid, function(err, result){
        if(err) return callback(err)
        var imgUrl = api.showQRCodeURL(titck);
        callback(null, imgUrl)
    });
   
}






module.exports = obj;