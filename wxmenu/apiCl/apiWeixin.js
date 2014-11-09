var appBl = require('../bl/wxApp.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');

var url = require('url')
var utils = require('../lib/utils.js');
var moment = require('moment')


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

module.exports = obj;