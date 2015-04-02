var userBl = require('../bl/wxUser.js');

var utils = require('../lib/utils.js');
var yewuyuan = require('../tools/hz_yewuyuan.js')

var moment = require('moment')
var obj = {}





//业务员名片的页面
obj.hzyewuyuan_mingpian = function(req,res){ 
	var wxuobj = req.wxuobj;
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var openId = req.wxBinder.openId;
	var workNum = req.query['worknum']


	//表示进入的是业主名片页面
	if(workNum){
		var yewuyuanResult = yewuyuan.get_yewuyuan(workNum)
		if(!yewuyuanResult){
			return res.send('未找到工号，请检查工号是否输入有误')
		}
		//如果是第二次进入
		if(wxuobj.appUserType == 2){
			return res.send('进入名片页面')
		}
		//如果是第一次进入
		userBl.modify(userId, null, {'appUserType':2}, function(err){
			if(err) return res.send(err)
			return res.send('进入名片页面')
		})

	}
	else{
	//表示进入的是分享页面
		var toUserId = req.query.touserid
		if(!toUserId){
			return res.send('无效的 toUserId')
		}

		return res.send('进入转发页面')

	}


	
	
}


//ajax
obj.hzstar = function(req,res){ 
	var wxuobj = req.wxuobj;
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var toUserId = req.query.touserid
	var score = req.query.score
	
	if(!toUserId){
			return res.send({error:1,data:'无效的 toUserId'}) 
	}
	if(!score || score != parseInt(score) || parseInt(score) <= 0|| parseInt(score) > 3){
		return res.send({error:1,data:'无效的 score'}) 
	}

	//数据检查是否存在


	userBl.dealStar(userId, toUserId, score, function(err, doc){
			if(err){
				return res.send({error:1,data:err}) 
			}
			return res.send({error:0,data:'ok'})
	})





}






module.exports = obj;