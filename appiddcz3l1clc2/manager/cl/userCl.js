var dl = require('../../dl/userModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('user_list', {session:req.session});
}


obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		var d2 = []
	

		doc.forEach(function(v){
			var wxLoc2 = '经度:'+v.wxLoc[0]+' | 纬度:'+ v.wxLoc[1]
			d2.push({
				  _id:v._id+'',
				  appId:v.appId,
				  openId: v.openId,
				  wxName:v.wxName,
				  wxAvatar:v.wxAvatar,
				  wxLoc: wxLoc2,
				  wxGroup:v.wxGroup,
				  appLoginName:v.appLoginName,
				  appLoginPassword:v.appLoginPassword,
				  appUserName:v.appUserName,
				  appUserMobile:v.appUserMobile,
				  appUserSex:v.appUserSex,
				  appUserBirth:v.appUserBirth,
				  appUserScore:v.appUserScore,
				  isShow:v.isShow,
				  writeTime: v.writeTime,			
			})			
		})

		resObj["Data"] = d2;

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
	 

	if(!req.models[0]["_id"]){
		req.models[0]["wxLoc"] = [119.95, 31.79]
	}
	else{
		delete req.models[0]["wxLoc"]
	}

	if(!req.models[0]["appUserSex"]){
		delete req.models[0]["appUserSex"]
	}
	if(!req.models[0]["isShow"]){
		delete req.models[0]["isShow"]
	}
	

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


obj.getList = function(req, res){
	var uidlist = req.body.uidlist;
	if(!uidlist){
		res.json([]);
		return;
	}
	uidlist = uidlist.split(',');

	uidlist.filter(function(v){
		return !!v
	})

	dl.findAll({
		"_id":{
			"$in":uidlist
		}
	}, 0, 1000, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		var jsonary = []
		doc.forEach(function(v){
			jsonary.push({
				text:v.appUserName,
				value:v._id,
				name:v.appUserName,
				sex:v.appUserSex,
				mobile:v.appUserMobile,
				
			})
		})
		res.json(jsonary);
	})
}


module.exports = obj;