//解析json到数据库
var activePrizeRecordModel = require('../dl/appActivePrizeRecordModel.js'); //加载模型

var moment = require('moment')


var obj = {}
var sDate = new Date('2015/1/8')
var eDate = new Date('2015/1/9')
var activeId = '54acf1013bd5b9db4f1b42e2'
console.log('#####################')

activePrizeRecordModel.findByObj({ 'activeId':activeId}, function(err, doc){
	if(err){
		console.log(err)
		return
	}
	if(doc.length == 0){
		console.log('empty')
		return
	}

	var userIdObj = {}
	var prizeObj = {}
	var delcount = 0
	var needDelCount = 0
	doc.forEach(function(dobj){
		if(!userIdObj[dobj.userId]){
			userIdObj[dobj.userId] = 0
		}
		if(!prizeObj[dobj.prizeId]){
			prizeObj[dobj.prizeId] = []
		}
		if(prizeObj[dobj.prizeId].indexOf(dobj.userId) == -1){
			prizeObj[dobj.prizeId].push(dobj.userId)
		}
		userIdObj[dobj.userId] += 1
		return;
		
		if(userIdObj[dobj.userId] > 1){
			activePrizeRecordModel.destroy({'_id': dobj._id},function(err){
				if(err) throw(err)
				delcount++
				console.log(delcount)
			})
			
		}

	})

	Object.keys(userIdObj).forEach(function(key){
		if(userIdObj[key] > 1){
			console.log('userid: '+key+'  ,count: '+userIdObj[key] )
			needDelCount += (userIdObj[key] - 1)
		}
	})

	console.log('===================')
	console.log('needDelCount count:'+needDelCount)
	console.log('===================')

	Object.keys(prizeObj).forEach(function(key){	
		console.log('prizeId: '+key+'  ,count: '+prizeObj[key].length )
	})

	return 'success'


})









