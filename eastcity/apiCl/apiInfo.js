var infoBl = require('../bl/wxInfo.js')
var utils = require('../lib/utils.js');
var obj = {}


//获取专刊中某一片文章的评论
obj.newslist = function(req,res){

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;

	//to do
}

//向某一个专刊发送评论
obj.speciallist = function(req,res){ 

	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var appId = global.wxAppObj._id;

	//to do
}



module.exports = obj;