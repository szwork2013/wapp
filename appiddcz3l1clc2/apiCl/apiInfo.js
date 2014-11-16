var infoBl = require('../bl/wxInfo.js')
var kdBl = require('../bl/wxKd.js')
var utils = require('../lib/utils.js');
var obj = {}


obj.sendReCommend = function(req,res){ //发送推荐信息

	var coId = req.body.coId;
	var userId = req.wxuobj._id;
	var openId = req.wxuobj.openId;
	var recName = req.body.recName;
	var recSex =  req.body.recSex;
	var recTel =  req.body.recTel;
	var appId = global.wxAppObj._id;

	if(!coId || coId.length != 24){
		return res.send({error:1,data:'所在小区错误'})
	}
	if(!recName){
		return res.send({error:1,data:'请填写推荐人姓名'})
	}
	if(recSex != '0' && recSex != '1'){
		return res.send({error:1,data:'请填写推荐人性别'})
	}
	if(!recTel){
		return res.send({error:1,data:'请填写推荐人电话'})
	}

	infoBl.getOneCoById(coId,function(err,doc){ //查找coId是否存在
		if(err){
	        logger.error('infoBl.getOneCoById error, error: %s',config.appEname,err);
	        return res.send(500)
     	}
     	if(!doc || doc.length == 0){
     		return res.send({error:1,data:'未找到所在小区'})
     	}

     	infoBl.sendReCommend({ //插入数据库
     		  appId:appId,
		      coId:coId,
		      userId:userId,
		      openId:openId,
		      recName:recName,
		      recSex:recSex,
		      recTel:recTel,   
     	},function(err,doc){
     		if(err){
		        logger.error('infoBl.sendReCommend error, error: %s',config.appEname,err);
		        return res.send(500) 
	     	}
	     	res.send({error:0,data:''});
     	})

	})

}


obj.kdSearch = function(req,res){ 

	var companyEname = req.query.company
	var kdNumber = req.query.number
	if(!companyEname || !kdBl.companyDict[companyEname]){
		return res.send({error:1, data:'快递公司无效'})
	}
	if(!kdNumber){
		return res.send({error:1, data:'快递单号无效'})
	}

	
	kdBl.startKd(companyEname, kdNumber, function(err, result){
		if(err) return res.send({error:1, data:err})
		return res.send({error:0, data:result})
	})

}


module.exports = obj;