var dl = require('../../dl/investigateLogModel.js');

var dl2 = require('../../dl/investigateModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
	res.render('investigate_log_list', {session:req.session});
}

obj.result = function(req, res){
	res.render('investigateResult', {session:req.session});
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

obj.info = function(req, res){
	var investigateId = req.body.investigateId

	dl2.findOneByObj({'_id':investigateId}, function(err, invesDoc){
		if(err){
			return res.send({'error':1, data:err})
		}
		if(!invesDoc){
			return res.send({'error':1, data:'未找到调查'})
		}
		try{
			var questionDoc = JSON.parse(invesDoc.questionJson)
		}
		catch(e){
			return res.send({'error':1, data:'调查题库错误'})
		}
		var questionReturnList = []
		questionDoc.forEach(function(qitem){
			var tempDict = {
				'question':qitem
				'answer':[]
			}
			item.forEach(function(iitem, i){
				var tempDoc = {
					'pos':i,
					'title':iitem,
					'count':0
				}
				tempDict['answer'].push(tempDoc)
			})
			questionReturnList.push(tempDict)
		})


		dl.findAll({
			'investigateId':investigateId,
		},0,1000000,function(err, recordList){
			if(err) return res.send({'error':1, data:err})
			if(list.length == 0) return res.send({'error':0, data:questionReturnList, total:0})

			recordList.forEach(function(recordItem){

				try{
					var resultDoc = JSON.parse(recordItem.investigateResultJson) 
					for(var i=0;i<recordItem.length;i++){
						for(var j=0;j<recordItem[i].length;j++)
							var questionPos = recordItem[i][j]
							questionReturnList[i][questionPos]['count'] += 1
						}
					}

				catch(e){
					return res.send({'error':1, data:'解析数组出错'})
				}

				return res.send({'error':0, data:questionReturnList, total:recordList.length})

			})//end recordList.forEach


		})//end dl.findAll


	})//end dl2.findOneByObj
}





module.exports = obj;