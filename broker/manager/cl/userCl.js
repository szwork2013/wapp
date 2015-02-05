var dl = require('../../dl/userModel.js');
var dlapp = require('../../dl/userAppModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');
var json2csv = require('json2csv');

obj.list = function(req, res){
	res.render('user_list', {session:req.session});
}

var userStatus = ['未认证','认证','vip会员']
var userSex= ['女','男']

obj.csv = function(req,res){
	dl.findAll({},0,100000,function(err, ulist){
		if(err) return res.send(500,err);
		dlapp.findAll({},0,100000,function(err, applist){
			if(err) return res.send(500,err);
			var userJson = [];
			var appLen = applist.length;

			ulist.forEach(function(uobj){

				for(var i=0;i<appLen;i++){

					if(uobj._id.toString() == applist[i].userId){
						userJson.push({
							"userId":uobj._id.toString(),
							"openId":applist[i].openId,
							"appUserName":uobj.appUserName,
							"appUserMobile":uobj.appUserMobile.toString(),
							"appUserSex":userSex[uobj.appUserSex],
							"userFrom":uobj.userFrom,
							"appUserCity":applist[i].appUserCity,
							"appUserCommunity":applist[i].appUserCommunity,
							"appUserBuilding":applist[i].appUserBuilding,
							"appCardNumber":applist[i].appCardNumber,
							"appUserType":userStatus[applist[i].appUserType],
							"writeTime":applist[i].writeTime,
						})
						return;
					}
				}
			})
			
			var title = [
				'用户id','openid','姓名',
				'电话','性别','来源',
				'城市','小区','楼号','房号',
				'会员卡号','会员状态','注册时间'
			]

			json2csv({data: userJson, fields: Object.keys(userJson[0])}, function(err, csv) {
				  if(err) return res.send(500,err);
				  res.attachment('user.csv');
				  res.send(csv)
			});


		})
	})


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
			d2.push({
				  _id:v._id+'',
				  appId:v.appId,
				  appUserName:v.appUserName,
				  appUserMobile:v.appUserMobile,
				  appUserSex:v.appUserSex,
				  appUserBirth:v.appUserBirth,
				  appUserScore:v.appUserScore,
				  isShow:v.isShow,
				  userFrom:v.userFrom,
				  code1:v.code1,
				  code2:v.code2,
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
	delete req.models[0]["__v"];


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


obj.getOne = function(req, res){
	var id = req.body.id;

	dl.findOneByObj({
		_id:id
	}, function(err, doc){
		if(err) return res.json({'error':1,data:err})
		if(!doc) return res.json({'error':1,data:'未找到信息'})
		res.json(
			{
				'error':0,
				data:{
					appUserName:doc.appUserName,
					appUserMobile:doc.appUserMobile
				}
		});
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