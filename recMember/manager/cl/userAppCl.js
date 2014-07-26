var dl = require('../../dl/userAppModel.js');
var dl2 = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('user_list', {session:req.session});
}

obj.bindlist = function(req, res){
	res.render('user_bind_list', {session:req.session});
}

obj.bindcheck = function(req, res){
	res.render('user_bind_check_list', {session:req.session});
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

			dl2.getUserByIds(ids,function(err,idsary){ //获得用户id和用户名对应关系
				if(err) return res.json(err)
				var dary=[]

				//console.log(resObj["Data"])

				resObj["Data"].forEach(function(v){

					  var uname = v.userId
					  var sex = 1
					  var mobile = ''
					  idsary.forEach(function(v2){
					  	  if(v2.value == v.userId){
					  	  	uname = v2.text;
					  	  	sex = v2.sex
					  	  	mobile = v2.mobile
					  	  }
					  }) 
					  dary.push({
					  		  _id:v._id.toString(),	 
							  userId:uname, 				   //此用户在数据库中的_id
							  userMobile:mobile,
							  userSex:sex,
						      openId:v.openId,
						      appId:v.appId,
						      appUserCity:v.appUserCity,
						      appUserCommunity:v.appUserCommunity,
						      appUserBuilding:v.appUserBuilding,
						      appUserRoom:v.appUserRoom,
						      appCardNumber:v.appCardNumber,
						      appUserType:v.appUserType,
						      isNewSubmit:v.isNewSubmit,
						      lastActiveTime:v.lastActiveTime,
							  writeTime: v.writeTime,
					  })
				})

				resObj["Total"] = count
				resObj["Data"] = dary
				res.json(resObj);
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

	

	dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.update2 = obj.create2 = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {'writeTime':new Date('1970/1/1')}
	}
	
	delete req.models[0]["_id"];
	delete req.models[0]["userId"];
	delete req.models[0]["openId"];
	delete req.models[0]["appId"];
	

	dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}



obj.success = function(req, res){
	if(!req.models[0]["_id"]) return res.send(500)
	var query;
	query = {"_id": req.models[0]["_id"]};	

	dl.createOneOrUpdate(query, {
		appUserType:2,
		isNewSubmit:0
	}, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

obj.fail = function(req, res){
	if(!req.models[0]["_id"]) return res.send(500)
	var query;
	query = {"_id": req.models[0]["_id"]};	

	dl.createOneOrUpdate(query, {
		isNewSubmit:2
	}, function(err, doc){
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