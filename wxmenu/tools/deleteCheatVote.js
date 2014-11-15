//解析json到数据库
var voteItemModel = require('../dl/voteItemModel.js'); //加载模型
var voteGroupModel = require('../dl/voteGroupModel.js'); //加载模型
var voteModel = require('../dl/voteModel.js'); //加载模型
var voteRecordModel = require('../dl/voteRecordModel.js'); //加载模型
var appModel = require('../dl/appModel.js'); //加载模型
var moment = require('moment')


var startDate = new Date('2010/1/1')

var obj = {}
var checkVoteEname = ['unionlife_vote_2014']
obj.startDel = function(){
	checkVoteEname.forEach(function(ename){
		voteModel.findOneByObj({
			ename:ename
		}, function(err,voteObj){
			if(err || !voteObj) {
				console.log('not found ename vote '+ename)
				return
			}
			if(voteObj.interval!=24){
				console.log(ename+'not support not eq 24')
				return 
			}
			if(voteObj.intervalPerUserTimes != 1){
				console.log(ename+'not support intervalPerUserTimes not eq 1')
				return 
			}
			obj.delCheck(voteObj)
		})
	})
}

obj.delCheck = function(voteObj){
	console.log('start deal '+voteObj.ename)

	var voteObj = voteObj;
	var intervalHour = voteObj.interval*3600
	var yestodyStart = (moment().hour(0).minute(0).second(0).unix() - intervalHour)*1000;
	var yestodyEnd = (moment().hour(23).minute(59).second(59).unix() - intervalHour)*1000;

	var statTime = new Date(yestodyStart)
	var endTime = new Date(yestodyEnd)

	voteRecordModel.findByObj({
		voteId:voteObj._id.toString(),
		writeTime:{'$gte': statTime, '$lt':endTime}
	}, function(err, list){
		if(err) return console.log(err)
		console.log('start anylistic length is: '+list.length)

		var hasVoteUser = []
		var delIds = []
		var countUserId = {}
		list.forEach(function(lo){
			var uniqueStr = lo.itemId+lo.userId
			if(hasVoteUser.indexOf(uniqueStr) == -1){//没找到
				hasVoteUser.push(uniqueStr)
			}
			else{
				if(!countUserId[lo.userId]){
					countUserId[lo.userId] = {
						count:0,
						userid:lo.userId
					}
				}
				countUserId[lo.userId]['count']++
				delIds.push(lo._id.toString())
			}
		})
		if(delIds.length == 0) return console.log('no del record')

		var templist = []
		Object.keys(countUserId).forEach(function(key){
			templist.push(countUserId[key])
		})

		templist = templist.sort(function(a,b){
			if(a.count-b.count>=0) return -1
			return 1
		})

		templist.length = 100

		//console.log(delIds)
		console.log('************')
		console.log(templist)
		console.log('************')
		console.log(delIds.length)
		return
		/*
		voteRecordModel.destroy({
			_id:{$in:delIds}
		}, function(err){
			if(err) return console.log(err)
			console.log('success del number :'+delIds.length)

		})
		*/
	})

}


module.exports = obj

obj.startDel()








