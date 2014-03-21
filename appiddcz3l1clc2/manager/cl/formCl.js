var Dl = require('../dl/formDl.js');
var utils = require('../../lib/utils.js');
var obj = {}

obj.page = function(req, res){
	Dl.distinctByFormName(function(err, nameArray){
		res.render('form_page', {session:req.session, nameArray:nameArray||[]});
	})
	
}

obj.list = function(req, res){
	var formname = req.query.formname
	if(!formname){
		return res.render('form_list', {session:req.session});
	}

	return res.render('form_list_2', {session:req.session, formname:formname});
}

obj.formatData = function(doc){
	
	var doc = doc.map(function(v){
		var obj = {
			"_id":v._id,
			"clientId":v.clientId,
			"userId":v.userId,
			"formName":v.formName,
		}
		var formData = JSON.parse(v.formData)
		var keys = Object.keys(formData);
		keys.forEach(function(key){
			obj[key] = formData[key]
		})
		return obj;		
	})
	return doc;
}

obj.getFormat = function(req, res){
	var formname = req.query.formname;
	if(!formname){
		return res.json({err:1,data:"no formname"})
	}

	Dl.lastOneByFormName(formname, function(err,doc){
		if(err) return res.json({err:1,data:err})
		try{
			var data = JSON.parse(doc.formData);
		}
		catch(e){
			return res.json({err:1,data:e})
		}
		var keys = Object.keys(data);
		var dataSource = {
			"_id":{ editable: false },
			"clientId":{ editable: false },
			"userId":{ editable: false },
			"formName":{ editable: false },
		};
		var columns = [
			{ 
				field: "_id",
				title: "表单id", 
			},
			{ 
				field: "clientId",
				title: "商业用户", 
			},
			{ 
				field: "userId",
				title: "用户Id", 
			},
			{ 
				field: "formName",
				title: "表单名称",
			},
		];
		keys.forEach(function(key){
			dataSource[key] = { editable: false };
			columns.push({
				field: key,
				title: key, 
			})
		})
		return res.json({err:0, data:{ //返回结构
			dataSource:dataSource,
			columns:columns,
		}})

	})
}

obj.read = function(req, res){
	var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
	var skip = req.body.skip || 0;
	var pageSize = req.body.pageSize || 20;
	var resObj = {"Data":[],"Total":0};

	var formname = req.query.formname;
	if(formname){
		filter.formName = formname;
	}
	

	Dl.findAll(filter, skip, pageSize, function(err,doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json(resObj);
		resObj["Data"] = doc;


		Dl.countAll(filter,function(err,count){
			if(err) return res.send(500,err);
			resObj["Total"] = count;

			if(formname){
				resObj["Data"] = obj.formatData(doc)
			}
			return res.json(resObj);
			
		})
		
	})
}

obj.update = obj.create  = function(req, res){
	var query;
	if(req.models[0]["_id"]){
		query = {"_id": req.models[0]["_id"]};
	}
	else{
		query = {"clientId":''};
	}
	delete req.models[0]["_id"];

	var formname = req.query.formname;
	if(formname){
		query.formName = formname;
	}

	Dl.createOneOrUpdate(query, req.models[0], function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])

		if(formname){
				doc = obj.formatData([doc])
			}
		res.json(doc);
	})
}

obj.destroy = function(req, res){
	var query = {"_id": req.models[0]["_id"]};

	Dl.destroy(query, function(err, doc){
		if(err) return res.send(500,err);
		if(!doc) return res.json([])
		res.json(doc);
	})
}

module.exports = obj;