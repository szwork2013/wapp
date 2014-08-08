var dl = require('../../dl/recRecordModel.js');

var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');




obj.list = function(req, res){
	res.render('rec_record_list', {session:req.session});
}

obj.success = function(req, res){
	dl.createOneOrUpdate({
		_id:req.body._id
	}, {
		recStatus:6
	}, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.fail = function(req, res){
	dl.createOneOrUpdate({
		_id:req.body._id
	}, {
		recStatus:2
	}, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}


obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};



	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc || doc.length==0) return res.json(resObj);

		var templist = []
		var userIdList = []
		doc.forEach(function(o){

			templist.push({

				_id:o._id,
				appId:o.appId,
				userId:o.userId,

				buyHouse:o.buyHouse,
				buyRoom:o.buyRoom,

				recName:o.recName,
				recSex:o.recSex,
				recTel:o.recTel,
				recArea:o.recArea,
				recPrice:o.recPrice,
				recRoom:o.recRoom,

				recStatus:o.recStatus,
				comments:JSON.stringify(o.comments),

				isCash:o.isCash,

				recCode1:o.recCode1,
				recCode2:o.recCode2,
				recCode3:o.recCode3,
				recCode4:o.recCode4,

				updateTime: o.updateTime,
				writeTime: o.writeTime,

				userFrom:''
			})
			userIdList.push(o.userId)
		})

		resObj["Data"] = templist;
		
		dl.countAll(filter,function(err,count){
				if(err) return res.send(500,err);
				if(userIdList.length == 0){
					resObj["Total"] = count				
					res.json(resObj);
					return;
				}

				dl2.getUserByIds(userIdList,function(err,lists){
					if(err) return res.send(500,err);
					//console.log(lists)
					//循环列表匹配用户id是否相等，相等则把来源赋值				
					resObj["Data"].forEach(function(resobj){
						lists.forEach(function(uobj){
							//console.log(resobj.userId, uobj.value)
							//console.log(resobj.userId == uobj.value.toString())
							if(resobj.userId == uobj.value.toString()){
								resobj.userFrom = uobj.userFrom
							}
						})
					})

					resObj["Total"] = count				
					res.json(resObj);
					return;
					
				})
				
			
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

	var tempjson = req.models[0]["comments"] || '[]';
	try{
		req.models[0]["comments"] = JSON.parse(tempjson)
	}
	catch(e){
		res.send(500,e)
	}

	//每次修改都回改变修改时间
	req.models[0]["updateTime"] = Date.now();

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





module.exports = obj;