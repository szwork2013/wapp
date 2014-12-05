//解析json到数据库
var voteItemModel = require('../dl/voteItemModel.js'); //加载模型
var voteGroupModel = require('../dl/voteGroupModel.js'); //加载模型
var voteModel = require('../dl/voteModel.js'); //加载模型
var voteRecord = require('../dl/voteRecordModel.js'); //加载模型
var appModel = require('../dl/appModel.js'); //加载模型

var json2csv = require('json2csv'); 
var async = require('async')
var utils = require('../lib/utils.js');
var fs = require('fs')
var moment = require('moment')

var obj = {}


var voteEname = 'unionlife_vote_2014'
var appEname = 'unionlife'
var startTime = moment("2014/11/13 00:00:00");
var endTime = moment("2014/12/1 00:00:00");
//var groupEname = 'tenyear'

var appId, voteId, groupList, itemList, csvList = []


console.log('start parse')
async.series([
	//查询app
	function(callback){
		appModel.findOneByObj({
			appEname:appEname
		}, function(err,obj){
			if(err) return callback(err)
			if(!obj) return callback('empty app')
			appId = obj._id.toString()
			callback()
		})
	},
	//查询vote
	function(callback){
		voteModel.findOneByObj({
			ename:voteEname
		}, function(err,obj){
			if(err) return callback(err)	
			if(!obj) return callback('empty vote')		
			voteId = obj._id.toString()
			callback()
		})
	},
	//查询分组
	function(callback){
		voteGroupModel.findByObj({
			voteId:voteId
		}, function(err,list){
			if(err) return callback(err)	
			if(!obj) return callback('empty gourp')		
			groupList = list
			callback()
		})
	},
	//查询所有成员
	function(callback){
		voteItemModel.findByObj({
			voteId:voteId
		}, function(err,list){
			if(err) return callback(err)
			if(list.length==0) return callback('empty itme list')
			itemList = list
			callback()
		})
	},
],function(err){
	if(err) throw err
	console.log('get complete')
	console.log(appId, voteId)
	console.log('member count is :' + itemList.length)
	appVoteBack()
})







var perItemDealCheat = function(callback1, voteItem, gourpTitle){

	var itemRecordList = []

	console.log('start deal member: '+voteItem.title)

	voteRecord.find({
		itemId:voteItem._id.toString()
	}, function(err, recodlist){
		if(err) return callback1(err)
		if(recodlist.length == 0){
			console.log('empty vote member: '+voteItem.title)
			return callback1()
		}



		
		//开始处理,先处理IP
		console.log('start deal ip: ' + voteItem.title)
		var itemIpKeys = {
			'127.0.0.1':[]
		}
		recodlist.forEach(function(recordObj){
			if(recordObj.recordIp == '127.0.0.1'){
				console.log('not found ip: '+voteItem.title)
				itemIpKeys['127.0.0.1'].push(recordObj)
			}
			//如果没有找到ip为key的数组
			else if(!itemIpKeys[recordObj.recordIp]){
				itemIpKeys[recordObj.recordIp] = []
				itemIpKeys[recordObj.recordIp].push(recordObj)
			}
			//如果有这个key的数组直接push
			else{
				itemIpKeys[recordObj.recordIp].push(recordObj)
			}

		})
		//循环处理
		var ipDealRecordList= []//ip处理结束的数组
		var iKeys = Object.keys(itemIpKeys)
		//循环ip数组
		iKeys.forEach(function(ikey){
			if(iKeys == '127.0.0.1' || itemIpKeys[ikey].length <= 16){
				itemIpKeys[ikey].forEach(function(o){
					ipDealRecordList.push(o)
				})
				return
			}
			if(itemIpKeys[ikey].length > 16){
				console.log('find ip upper 16 length:'+ itemIpKeys[ikey].length +'  ' + voteItem.title)

				itemIpKeys[ikey].forEach(function(o,i){
					if(i<16){
						ipDealRecordList.push(o)
					}	
				})
				return
			}
		})

		//console.log(ipDealRecordList.length)

		//开始处理当日票数，当日投票量超过1000票的，则分析每小时投票量，若某小时投票量超过30票，则记为30票。
		//将 ipDealRecordList 根据每日分组
		console.log('start deal day: ' + voteItem.title)

		var curMoment = moment(startTime) 
		var perDayObj = {}

		while( curMoment < endTime){
			var nextDay = moment(curMoment).add(1, 'd')
			var key = curMoment.toString()
			perDayObj[key] = []

			ipDealRecordList.forEach(function(obj){						
				
				var objMoment = moment(obj.writeTime)
				
				if(objMoment >= curMoment && objMoment < nextDay){
					
					perDayObj[key].push(obj)
				}

			})

			curMoment.add(1, 'day')
		}

		//console.log(perDayObj);return;

		//循环判断当天是否超过1000票，如果超过则按小时算，是否超过30
		var dayDealList = []
		var dKeys = Object.keys(perDayObj)
		dKeys.forEach(function(dkey){
			if(perDayObj[dkey].length <= 1000){
				perDayObj[dkey].forEach(function(o){
					dayDealList.push(o)
				})
				return
			}
			else{

				console.log('find day upper 1000 length:'+ perDayObj[dkey].length +'  ' + voteItem.title)

				var curMoment = moment(dkey)
				var nextDay = moment(curMoment).add(1, 'd')

				while(curMoment<nextDay){
					var nextHour = moment(curMoment).add(1, 'h')
					var curHourList = []
					perDayObj[dkey].forEach(function(o,i){
						var oMoment = moment(o.writeTime)
						//取这个小时的前30个数据
						if(oMoment>=curMoment && oMoment<nextHour && i<30){
							dayDealList.push(o)
						}
					})
					curMoment.add(1, 'h')

				}
				return
			}


		})//end dKeys.forEach



		var itemCount = dayDealList.length
		var tmp = {
			'被投票人': voteItem.title,
			'所在省份': gourpTitle,
			'有效票数': itemCount
		}

		csvList.push(tmp)


		console.log('member deal end: ', tmp)

		callback1()


	})//end voteRecord.find


}







var appVoteBack = function(){

	//开始每个投票项的筛查
	var dealFunc_1 = []
	itemList.forEach(function(voteItem){

		for(var i=0; i<groupList.length; i++){
			if(groupList[i]._id.toString() == voteItem.groupId){
				dealFunc_1.push(function(callback1){
					perItemDealCheat(callback1, voteItem, groupList[i].title)
				})
				return;
			}	
		}
	})


	async.series(dealFunc_1, function(err){
		if(err) throw err
		console.log('all deal done')

		//生成CSV
		console.log('start gen csv')
		//排序
		csvList = csvList.sort(function(a,b){
			if(a.itemCount >= b.itemCount){
				return -1
			}
			return 1
		})

		json2csv({data: csvList, fields: Object.keys(csvList[0] || {})}, function(err, csv) {
			  if(err) return res.send(500,err);
			  console.log('start write file')
			  var ok = fs.writeFileSync('voteRecord_all_member.csv', csv)
			  console.log('write error: %s', ok)
		});
	})

}



