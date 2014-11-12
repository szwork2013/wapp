var prizeDl = require('./dl/appActivePrizeRecordModel.js')
var recordDl = require('./dl/appActiveLogModel.js')

var async = require('async')
var activeId = '545c2bbc3bd5b9db4f17b59d'
var needSupport = 5

//检查重复中奖的用户id
console.log('start check')
prizeDl.checkRepeatUser(activeId, function(err,list){
	if(err) return console.log(err)
	if(list.length == 0) return console.log('empty list')
	var warnUserIds = []
	var commonUserIds = []
	console.log('get prize user list length: '+list.length)
	//找到有问题用户id数组
	list.forEach(function(o){
		if(o.supportCount > 1){
			console.log('************')
			console.log('find more than one times get prize user')
			console.log(o)
			warnUserIds.push(o._id.toString())
			console.log('************')
		}
		commonUserIds.push(o._id.toString())
	})
	console.log('end check repeat get prize user')

	if(warnUserIds.length == 0){
		console.log('no supportCount')
	}
	//查看每个用户的流水记录，是否都是至少n次
	var dealFunc = []
	var countList = []
	commonUserIds.forEach(function(uid){
		dealFunc.push(function(callback){
			var uid = uid;
			recordDl.countAll({
				activeId:activeId,
				toUserId:uid
			}, function(err, num){
				if(err) return callback(err)
				countList.push({
					uid:uid,
					count:num
				})
				callback()
			})//end count

		})//end push

	})//end for each

	countList.forEach(function(countObj){
		if(countObj.count < needSupport){
			console.log('************')
			console.log('found cheat user')
			console.log(countObj)
			console.log('************')
		}
	})

	console.log('check not need support end')


})