//解析json到数据库
var voteItemModel = require('../dl/voteItemModel.js'); //加载模型
var voteGroupModel = require('../dl/voteGroupModel.js'); //加载模型
var voteModel = require('../dl/voteModel.js'); //加载模型
var appModel = require('../dl/appModel.js'); //加载模型

var async = require('async')
var utils = require('../lib/utils.js');
var obj = {}
var memberJson = require('./gen.json')

var voteEname = 'unionlife_vote_2014'
var appEname = 'unionlife'

var appId, voteId, groupList

console.log('start parse')
async.series([
	//查询app
	function(callback){
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
		voteGroupModel.findByObj({
			voteId:voteId
		}, function(err,list){
			if(err) callback(err)
			groupList = list
			callback()
		})
	},
],function(err){
	if(err) throw err
	console.log('get complete')
	appVoteBack()
})




var appVoteBack = function(){

	var dealFunc = []
	memberJson.forEach(function(memObj){
		var groupName = memObj[0]
		var groupId;
		groupList.forEach(function(groupObj){
			if(groupObj.title == groupName){
				groupId = groupObj._id.toString()
			}
		})
		if(!groupId){
			return false;
		}
		dealFunc.push(function(callback){
			voteItemModel.insertOneByObj({
				appId:appId,
				voteId:voteId,
				groupId:groupId,
				title:memObj[1],
				pictureThumb:'http://piccvote.qiniudn.com/face/'+memObj[6]+'.jpg',
				picture:'http://piccvote.qiniudn.com/face/'+memObj[6]+'.jpg',
				desc:memObj[4],
				desc2:memObj[5],
				code2:memObj[2],
				code3:memObj[3],
			},function(err){
				callback(err)
			})
		})
		//end delfunc push
	})

	async.series(dealFunc, function(err){
		if(err) throw err
		console.log('all import done')
	})

}