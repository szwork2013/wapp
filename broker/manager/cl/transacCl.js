var dl = require('../../dl/recBankTransac.js');
var dl2 = require('../../dl/userModel.js');
var dl3 = require('../../dl/recRecordModel.js');

var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('rec_bank_transac_list', {session:req.session});
}


obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		resObj["Data"] = doc;
		var ids = []
		doc.forEach(function(v){
			ids.push(v.userId)
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
	
	delete req.models[0]["_id"];

	if(req.models[0]["status"] == 4){//如果状态为4，表示已经发放佣金
		
		//先查找是否含有推荐记录
		dl3.findByObj({
			_id:req.models[0]["recRecords"]
		},function(err,list){
			if(err) return res.send(500,err);
			if(!list || list.length==0 || list.length !=1) return  res.send(500,'未找到相关推荐记录');


			//如果有推荐记录，更改佣金状态
			dl.createOneOrUpdate(query, req.models[0], function(err, doc){
				if(err) return res.send(500,err);
				if(!doc) return res.json([])

				if(list[0].isCash == 1){
					console.log('重复修改推荐记录')
					res.json(doc);
					return;
				}
				//更改推荐记录状态
				dl3.createOneOrUpdate({
					_id:req.models[0]["recRecords"]
				},{isCash:1},function(err,o){
					if(err) return res.send(500,err);
					res.json(doc);
				})//end dl3.createOneOrUpdate
				
			})//end dl.createOneOrUpdate

		})//end dl3.findByObj


	}
	else{
		dl.createOneOrUpdate(query, req.models[0], function(err, doc){
			if(err) return res.send(500,err);
			if(!doc) return res.json([])
			res.json(doc);
		})
	}
}


obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};
	dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}





module.exports = obj;