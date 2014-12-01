//解析json到数据库
var voteItemModel = require('../dl/voteItemModel.js'); //加载模型
var voteGroupModel = require('../dl/voteGroupModel.js'); //加载模型
var voteModel = require('../dl/voteModel.js'); //加载模型
var voteRecord = require('../dl/voteRecordModel.js'); //加载模型
var appModel = require('../dl/appModel.js'); //加载模型
var userAppModel = require('../dl/userAppModel.js');//加载用户模型
var json2csv = require('json2csv'); 
var async = require('async')
var utils = require('../lib/utils.js');
var fs = require('fs')
var moment = require('moment')
var obj = {}


var voteEname = 'unionlife_vote_2014'
var appEname = 'unionlife'


var appId, voteId, groupList
var errorRecord = []


var provinceDeal = function(groupObj, callback2){

	 var itemList, itemIdList=[], recordList, userList, csvList=[]

	console.log('###############################')
	console.log('-------------- '+groupObj.title+' -------------')
	console.log('###############################')
	console.log('start get')

	async.series([
		function(callback){
			console.log('start voteItemModel')
			voteItemModel.findByObj({
				groupId:groupObj._id.toString()
			}, function(err,list){
				if(err) callback(err)
				itemList = list
				itemList.forEach(function(itemDoc){
					itemIdList.push(itemDoc._id.toString())
				})
				callback()
			})
		},
		function(callback){
			console.log('start voteRecord')
			voteRecord.findByObj({
				itemId:{$in:itemIdList}
			}, function(err,list){
				if(err) callback(err)
				recordList = list
				callback()
			})
		},
	],function(err){
		if(err) throw err
		console.log('get complete')
		

		console.log('start parse')
		if(recordList.length == 0) return console.log('empty recordList')


		var dealFunc = []

		recordList.forEach(function(recordDoc){
			dealFunc.push(function(callback3){
					itemList.forEach(function(itemDoc){
						if(recordDoc.itemId == itemDoc._id.toString()){
							groupList.forEach(function(groupDoc){
								if(itemDoc.groupId == groupDoc._id.toString()){

									userAppModel.findOneByObj({
										userId:recordDoc.userId
									}, function(err, userDoc){
										if(err) callback3(err)
										if(!userDoc) {
											errorRecord.push(recordDoc)
											return callback3()
										}
										csvList.push({
												'投票Id':recordDoc._id.toString(),
												'所属省份':groupDoc.title,
												'候选人名字':itemDoc.title,
												'投票人Id':recordDoc.userId,
												'投票人微信Id':userDoc.openId,
												'投票人Ip':recordDoc.recordIp,
												'投票时间':moment(recordDoc.writeTime).format('YYYY-MM-DD HH:mm:ss')
											})
										callback3()
									})
								}
							})
						}
					})

			})
		})
		

		async.series(dealFunc, function(err){
				if(err) return callback2(err)
				console.log('end parse')
				//生成CSV
				console.log('start gen csv')
				json2csv({data: csvList, fields: Object.keys(csvList[0] || {})}, function(err, csv) {
					  if(err) return res.send(500,err);
					  console.log('start write file')
					  var ok = fs.writeFileSync('voteRecord_'+groupObj.title+'.csv', csv)
					  console.log('write : %s', ok)
					  callback2()
				});
	
		})

	})

}







	async.series([
		//查询app
		function(callback){
			console.log('start appModel')
			appModel.findOneByObj({
				appEname:appEname
			}, function(err,obj){
				if(err) callback(err)		
				appId = obj._id.toString()

				callback()
			})
		},
		//查询vote
		function(callback){
			console.log('start voteModel')
			voteModel.findOneByObj({
				ename:voteEname
			}, function(err,obj){
				if(err) callback(err)		
				voteId = obj._id.toString()
				callback()
			})
		},
		//查询所有group
		function(callback){
			console.log('start voteGroupModel')
			voteGroupModel.findByObj({
				voteId:voteId
			}, function(err,list){
				if(err) callback(err)
				groupList = list
				callback()
			})
		},
		//查询所有group
		function(callback){
			console.log('start voteGroupModel')
			voteGroupModel.findByObj({
				voteId:voteId
			}, function(err,list){
				if(err) callback(err)
				groupList = list
				callback()
			})
		},
		],function(err){


			var dealFunc2 = []
			groupList.forEach(function(groupDoc){
				dealFunc2.push(function(cb){
					provinceDeal(groupDoc, cb)
				})	
			})

			async.series(dealFunc2, function(err){
				if(err) return console.error(err)
				console.log('all done')
				console.log('errorRecord list:')
				console.log(errorRecord)
			})
		})