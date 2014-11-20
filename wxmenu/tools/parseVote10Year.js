//解析json到数据库
var voteItemModel = require('../dl/voteItemModel.js'); //加载模型
var voteGroupModel = require('../dl/voteGroupModel.js'); //加载模型
var voteModel = require('../dl/voteModel.js'); //加载模型
var appModel = require('../dl/appModel.js'); //加载模型

var async = require('async')
var utils = require('../lib/utils.js');
var obj = {}
var memberJson = require('./gen2.json')

var voteEname = 'unionlife_10year'
var appEname = 'unionlife'
var groupEname = 'tenyear'

var appId, voteId, groupId



memberJson.forEach(function(memObj){
	memObj[4] = memObj[4].replace(/\s+/g, '<br/>')
	memObj[5] = memObj[5].replace(/\s+/g, '<br/>')

	memObj[4] = memObj[4].split('<br/>').map(function(text){
		if(text.trim() == '') return ''
		return '<p>'+text.trim()+'<p>'
	}).join('')

	memObj[5] = memObj[5].split('<br/>').map(function(text){
		if(text.trim() == '') return ''
		return '<p>'+text.trim()+'<p>'
	}).join('')
})


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
	//查询所有group
	function(callback){
		voteGroupModel.findByObj({
			ename:groupEname
		}, function(err,list){
			if(err) return callback(err)
			if(list.length==0) return callback('empty group')
			groupId = list[0]._id
			callback()
		})
	},
],function(err){
	if(err) throw err
	console.log('get complete')
	console.log(appId, voteId, groupId)
	appVoteBack()
})




var appVoteBack = function(){

	var dealFunc = []
	memberJson.forEach(function(memObj){

		var code3 = memObj[4].match(/^\<p\>(.+)\<\p\>$/)
		code3 = code3[1]
		console.log(code3)


		dealFunc.push(function(callback){
			voteItemModel.insertOneByObj({
				appId:appId,
				voteId:voteId,
				groupId:groupId,
				title:memObj[3],
				pictureThumb:'',
				picture:'',
				code2:memObj[1],
				code3:code3,
				code4:memObj[0],
				desc2:memObj[7],
				number:memObj[6],
				desc:memObj[2],
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