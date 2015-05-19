var dl = require('../../dl/menuModel.js');
var dlapp = require('../../dl/appModel.js');
var dlreply = require('../../dl/wxReplyModel.js');
var wechat = require('wechat')

var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('menu_list', {session:req.session});
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
	if(req.models[0]["replyKind"] && req.models[0]["replyKind"] == 1){ //如果是使用文字回复
		req.models[0]["replyPicture"] = ''
	}
	
	delete req.models[0]["_id"];
	delete req.models[0]["__v"];


	var replayIds = req.models[0]['replyId'];

	if(Array.isArray(req.models[0]['replyId'])){
		var replayIds = [];
		req.models[0]['replyId'].forEach(function(obj){
			replayIds.push(obj.value);
		})
		replayIds = replayIds.join(',') || '0';
	}

	req.models[0]['replyId'] = replayIds

	console.log(req.models[0]['replyId'])

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




obj.sync = function(req, res){
	var appid = req.body.appid;
	dlapp.findOneByObj({
		_id:appid
	},function(err,appobj){
		if(err) return res.json({result:0,msg:err});

			dl.findAll({
				appId:appid,
			},0,100,function(err,menudoc){
				if(err) return res.json({result:0,msg:err});

				var wxMenu={
					button:[]
				}

				menudoc.forEach(function(v){
					if(v.menuType != 1) return;
					var childnum = 0;
					var child = [];

					menudoc.forEach(function(v2){
						if(v2.menuType != 2) return;
						if(v2.parentId == v._id.toString()){
							if(v2.replyKey.indexOf('http') == 0){
								child.push({
								       "type":"view",
								       "name":v2.menuTitle,
								       "url":v2.replyKey.trim()
									});
							}
							else{
								child.push({
								       "type":"click",
								       "name":v2.menuTitle,
								       "key":v2.replyKey.trim()
									});
							}
							childnum++;
						}
					})
					if(childnum > 0){
						wxMenu.button.push({
							name:v.menuTitle,
							sub_button:child
						})
					}
					else{

						if(v.replyKey.indexOf('http') == 0){
							wxMenu.button.push({ //如果主菜单是跳转
								'type':'view',
								'name':v.menuTitle,
								'url':v.replyKey.trim()
							})
						}
						else{
							wxMenu.button.push({ //如果是图文回复菜单
								'type':'click',
								'name':v.menuTitle,
								'key':v.replyKey.trim()
							})
						}


						
						
					}
				})

				if(wxMenu.button > 3){
					return res.json({result:0,msg:'一级菜单必须为1-3个或'});
				}
				

				var appid = appobj.wxAppId
				var secret = appobj.wxAppSecret
				var API = wechat.API;
				var api = new API(appid, secret);
				console.log(JSON.stringify(wxMenu))
				api.createMenu(wxMenu, function(err,result){
						if(err) return res.json({result:0,msg:err});
						res.send({result:1})
					});

			})






	})

}



module.exports = obj;