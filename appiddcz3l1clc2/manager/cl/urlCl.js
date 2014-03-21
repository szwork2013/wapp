var voteDl = require('../dl/voteDl.js');
var puzzleDl = require('../dl/puzzleDl.js');
var lotteryDl = require('../dl/lotteryDl.js');
var clientDl = require('../dl/clientDl.js');
var utils = require('../../lib/utils.js');
var async = require('async');
var obj = {};



obj.list = function(req,res){

	var showTmp = function(err,ary){

		if(err) return res.send(500);
		res.render('url_list', {session:req.session, client:ary});
	}

	if(req.session.isWidgetAdmin){//如果是超级管理员，则全部找出
		clientDl.findAll({},0,10000,function(err,docAry){
			if(err) return res.send(500);
			obj._show(docAry,showTmp)
		})
	}else{
		clientDl.findAll({_id:req.session.clientId},0,1,function(err,docAry){
			if(err) return res.send(500);
			obj._show(docAry,showTmp)
		})
	}
}

obj._show = function(clientAry, callback){
	var clientAry = clientAry||[];
	if(clientAry.length === 0 ) return cb(null, clientAry);

	var n = clientAry.length;
	var iserr = 0;
	for(var i=0;i<clientAry.length;i++){

		(function(j){
			async.series(
				[
				function(cb){
					var clientId = clientAry[j]._id;
					clientAry[j].voteGroup = [];
					voteDl.findAll({"clientId":clientId, voteId:"0"},0,10000,function(err,doc){
						if(err) return cb(err);
						doc.forEach(function(v2){
							clientAry[j].voteGroup.push({id:v2._id,title:v2.title});
						})
						cb();
					})
				},
				function(cb){
					var clientId = clientAry[j]._id;
					clientAry[j].puzzleGroup = [];
					puzzleDl.findAll({"clientId":clientId},0,10000,function(err,doc){
						if(err) return cb(err);
						doc.forEach(function(v3){
							clientAry[j].puzzleGroup.push({id:v3._id,title:v3.title});
						})
						cb();
					})
				},
				function(cb){
					var clientId = clientAry[j]._id;
					clientAry[j].lotteryGroup = [];
					lotteryDl.findAll({"clientId":clientId},0,10000,function(err,doc){
						if(err) return cb(err);
						doc.forEach(function(v4){
							clientAry[j].lotteryGroup.push({id:v4._id,title:v4.title});
						})
						cb();
					})
				},
				],
				function(err,result){
					n--;
					if(err) {
						iserr++;
						return callback(err);
					}
					if(!iserr && !n){
						callback(null, clientAry);
					}
				})
		}(i))
	}




}

module.exports = obj;