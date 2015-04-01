/**
 * Created by chent696 on 2015/2/7.<br>/common/weixin.js
 */
/*
 拼接微信红包xml串
 */
/*
option
 var options={
    min_value:randomVal,
    max_value:randomVal,
    total_amount:randomVal,
    re_openid:openId,
    total_num:1,
    showName:menuDoc.moneyActName,
    luckyMoneyWishing:menuDoc.moneyWishing,
    clientIp:appDoc.moneyIp,
    mch_id:appDoc.moneyMchId,
    wxappid:appDoc.wxAppId,
    wxkey:appDoc.wxAppSecret,
    appEname:appDoc.appEname,
    }
 */
var xmlreader = require('xmlreader');  //需要安装 xmlreader包
var fs = require('fs');
var path = require('path')
var https = require('https');
var MD5=require('blueimp-md5').md5;
 
var fnCreateXml = function(json){
 
    var _xml = '';
    for(var key in json) {
        _xml+= '<'+key+'>'+json[key]+'</'+key+'>';
    }
    return _xml;
}
 
/*
 生成url串用于微信md5校验
 */
var fnCreateUrlParam = function(json){
 
    var _str = '';
    var _arr = []
    for(var key in json){
        _arr.push(key+'='+json[key]);
    }
    return _arr.join('&');
}
 
 
/*
 生成微信红包数据
 */
var fnGetWeixinBonus = function(option){
 
    var _option = option || {};
    var _min_value = _option.min_value || -1, //红包最小金额
        _max_value = _option.max_value || -1, //红包最大金额
        _total_amount = _option.total_amount || -1, //红包总金额
        _re_openid = _option.re_openid || '', //红包发送的目标用户
    _total_num = _option.total_num || 0; //红包个数
 
    var _now = new Date();
    var _showName = option.showName || '';
    var _clientIp = option.clientIp;
    var _wishing = option.luckyMoneyWishing || '';

    var _mch_id = option.mch_id;
    var _wxappid = option.wxappid,
        _wxkey = option.wxkey;
 
    var _date_time = _now.getFullYear()+''+(_now.getMonth()+1)+''+_now.getDate();
    var _date_no = (_now.getTime() +'').substr(-8); //生成8为日期数据，精确到毫秒
    var _random_no = Math.floor(Math.random()*99);
    if(_random_no<10){ //生成位数为2的随机码
        _random_no = '0'+_random_no;
    }
    var _muc_id =  _mch_id;
    var _xmlTemplate = '<xml>{content}</xml>';
    var _contentJson = {};
    _contentJson.act_name = _showName;// '新年红包';
    _contentJson.client_ip = _clientIp;
 
    _contentJson.max_value = _max_value;//'100';
    _contentJson.mch_billno =_muc_id +_date_time+ _date_no+_random_no; //订单号为 mch_id + yyyymmdd+10位一天内不能重复的数字; //+201502041234567893';
    _contentJson.mch_id =_muc_id;
    //_contentJson.logo_imgurl = '';
    _contentJson.min_value = _min_value;// '100';
    _contentJson.nick_name = _showName;
    _contentJson.nonce_str = '50780e0cca98c8c8e814883e5caa672e';
    _contentJson.re_openid = _re_openid;// 'omNdNuCzOuYOm5aBr1-B5hhUS1JI'; //涛子的openid // 'onqOjjmM1tad-3ROpncN-yUfa6uI';
    _contentJson.remark = _wishing;
    _contentJson.send_name =_showName;//
    //_contentJson.share_content = '';
    //_contentJson.share_share_url = '';
    //_contentJson.share_share_imageurl = '';
    _contentJson.total_amount = _total_amount;// '100';
    _contentJson.total_num = _total_num ;//1;
    _contentJson.wishing = _wishing;//'恭喜发财';
    _contentJson.wxappid = _wxappid;// 'wxbfca079a0b9058d3';
    
    _contentJson.key = _wxkey;
    var _contentStr = fnCreateUrlParam(_contentJson);
    //console.log('content='+_contentStr);
 
    _contentJson.sign =  MD5(_contentStr).toUpperCase();
    //删除 key (key不参与签名)
    //console.log(_contentJson)

    delete _contentJson.key;
    var _xmlData = fnCreateXml(_contentJson);
 
    var _sendData = '<xml>'+_xmlData+'</xml>'; //_xmlTemplate.replace(/{content}/)
    
    return _sendData;
    //console.log('xml='+_sendData);
}
 
var fnSendMoney = function(data,callback){
    var keyPath = path.join(__dirname, '..', 'moneryConfig')

    var _host = 'api.mch.weixin.qq.com';
    var _path = '/mmpaymkttransfers/sendredpack';
    try{
        var opt = {
            host:_host,
            port:'443',
            method:'POST',
            path:_path,
            key: fs.readFileSync(path.join(keyPath, data.appEname+'_key.pem')), //将微信生成的证书放入 cert目录下
            cert: fs.readFileSync(path.join(keyPath,data.appEname+'_cert.pem'))
        }
    }
    catch(e){
        callback(e)
        return;
    }
    var body = '';
    opt.agent = new https.Agent(opt);
    var req = https.request(opt, function(res) {
        //console.log("Got response: " + res.statusCode);
        res.on('data',function(d){
            body += d;
        }).on('end', function(){
            // console.log(res.headers);
            // console.log('微信返回消息');
            // console.log(body);

            //解析响应的xml文件
            fnParseReceivedXML(body, function(err, ret){
                    var ret = ret
                    //如果回调存在就执行回调函数
                    if(typeof callback == 'function'){
                        if(err){
                            return callback(body)
                        }
                        else{
                            return callback(null, ret);
                        }           
                    }
            });//end fnParseReceivedXML
        });//end .on('end'
    }).on('error', function(e) {
        //console.log("Got error: " + e.message);
        //请求出错记录日志
        logger.error('fnSendMoney request get error:%s', e.message)
    });
 
 
    //发送请求
    var _sendData = fnGetWeixinBonus(data);
    req.write(_sendData);
    req.end();
}
 
/*
    解析微信传回来得消息
 */
var fnParseReceivedXML = function(xmlData, cb){
 
    try {
        xmlreader.read(xmlData, function (errors, response) {
            if (null !== errors) {
                logger.error('fnParseReceivedXML xmlreader.read error:%s', errors)
                //console.log(errors);
                return cb(errors);
            }
            // console.log( response.xml );
            if(response && response.xml && response.xml.return_code) {
                var resCode = (response.xml.return_code.text()||'').toLowerCase()

                // console.log('###########')
                // console.log(resCode)
                // console.log('###########')

                if(resCode == 'success'){
                    return  cb(null, 'success');
                }
                else return cb(resCode);
            }
            logger.error('fnParseReceivedXML xmlreader.read not have return_code')
            return cb('not have return_code');
        });
    }catch(e){
        logger.error('fnParseReceivedXML xmlreader.read try-catch error:%s', e)
        return cb(e);
        //console.log('weixin sendmoney error'+ e.message);
    }
}
 
module.exports = fnSendMoney;