var dl = require('../../dl/wxReplyModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('reply_list', {session:req.session});
}


obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		resObj["Data"]  = []

		doc.forEach(function(docObj){
			resObj["Data"].push({
				_id:docObj._id,
				appId:docObj.appId,
				replyTitle:docObj.replyTitle,
				replyUrl:docObj.replyUrl,
				replyDesc:docObj.replyDesc,
				replyType:docObj.replyType,
				replyKey:docObj.replyKey.join(','),
				replyKind:docObj.replyKind,
				replyPicture:docObj.replyPicture,
				isShow:docObj.isShow,
				writeTime:docObj.writeTime
			})
		})

		dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);
			resObj["Total"] = count
			res.json(resObj);
		})
		
	})

}
obj.update = obj.create = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {'writeTime':new Date('1970/1/1')}
	}

	
	if(req.models[0]["replyKey"] && req.models[0]["replyKey"].indexOf(',')){ //split replyKey
		//console.log(req.models[0]["replyKey"])
		req.models[0]["replyKey"] = req.models[0]["replyKey"].split(',');
		req.models[0]["replyKey"] = req.models[0]["replyKey"].filter(function(v){
				return !!v.toString().trim();
		})
	}
	else if(req.models[0]["replyKey"]){//如果只传了单个replykey，则放入数组
		req.models[0]["replyKey"] = [req.models[0]["replyKey"].trim()];
	}

	delete req.models[0]["_id"];
	delete req.models[0]["__v"];

	dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}
obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};
	dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


obj.getList = function(req, res){ //获取菜单的微信回复

	dl.findAll({appId:req.body.appId, replyType:2, isShow:1}, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


module.exports = obj;