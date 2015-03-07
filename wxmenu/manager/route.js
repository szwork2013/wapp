var guidModel = require('../dl/guidModel.js');

var uploadCl = require('./cl/uploadCl.js');
var thumbCl = require('./cl/thumbCl.js');
var guidCl = require('./cl/guidCl.js');

var loginCl = require('./cl/loginCl.js');
var adminCl = require('./cl/adminCl.js');
var appCl = require('./cl/appCl.js');

var userCl = require('./cl/userCl.js');
var userappCl = require('./cl/userAppCl.js');

var replyCl = require('./cl/replyCl.js')
var menuCl = require('./cl/menuCl.js')

var activeCl = require('./cl/activeCl.js');
var activeLogCl = require('./cl/activeLogCl.js');
var activePrizeCl = require('./cl/activePrizeCl.js');
var activePrizeRecordCl = require('./cl/activePrizeRecordCl.js');


var lotteryCl = require('./cl/lotteryCl.js');
var lotteryPrizeCl = require('./cl/lotteryPrizeCl.js');
var lotteryRecCl = require('./cl/lotteryRecCl.js');

var voteCl =  require('./cl/voteCl.js');
var voteGroupCl = require('./cl/voteGroupCl.js');
var voteItemCl = require('./cl/voteItemCl.js');
var voteRecordCl = require('./cl/voteRecordCl.js');

var moneyCl = require('./cl/moneyLogCl.js');


var utils = require('../lib/utils.js')





var checkLogin = function(req, res, next){ //中间件

	if(!req.session.admin){ //判断是否登录
		return res.redirect('/manger/login');
	}
	
	if(req.body.models){ //如果有models则将model解析为json对象
		req.models = req.body.models;
		if(!req.models) return res.json(500, { error: 'models parse error' });
	}
	
	next();
}




var addroute = function(app){

	//上传
	app.post('/manger/upload/save', checkLogin, uploadCl.save)
	app.post('/manger/upload/remove', checkLogin, uploadCl.remove)

	//编辑器图片上传插入
	app.post('/manger/thumb/read', checkLogin, thumbCl.read)
	app.post('/manger/thumb/destroy', checkLogin, thumbCl.destroy)
	app.post('/manger/thumb/create', checkLogin, thumbCl.create)
	app.post('/manger/thumb/upload', checkLogin, thumbCl.upload)


	//登录
	app.get('/', loginCl.Login2)
	app.get('/manger/login', loginCl.Login)
	app.get('/manger/login2', loginCl.Login2)
	app.get('/manger/logout', checkLogin, loginCl.Logout)
	app.post('/manger/login', loginCl.UserLogin)
	app.get('/manger/main', checkLogin, loginCl.Main)

	//admin
	app.get('/manger/admin/list', checkLogin, adminCl.list)
	app.post('/manger/admin/read', checkLogin,  adminCl.read)
	app.post('/manger/admin/update', checkLogin, adminCl.update)
	app.post('/manger/admin/destroy', checkLogin, adminCl.destroy)
	app.post('/manger/admin/create', checkLogin, adminCl.create)

	//guid
	app.get('/manger/guid/list', checkLogin, guidCl.list)
	app.post('/manger/guid/read', checkLogin,  guidCl.read)
	app.post('/manger/guid/update', checkLogin, guidCl.update)




	//app
	app.get('/manger/app/list', checkLogin, appCl.list)
	app.post('/manger/app/read', checkLogin, appCl.read)
	app.post('/manger/app/update', checkLogin, appCl.update)
	app.post('/manger/app/destroy', checkLogin, appCl.destroy)
	app.post('/manger/app/create', checkLogin, appCl.create)
	app.post('/manger/app/getList', checkLogin, appCl.getList)


	//user
	app.get('/manger/user/list', checkLogin, userCl.list)
	app.post('/manger/user/read', checkLogin, userCl.read)
	app.post('/manger/user/update', checkLogin, userCl.update)
	app.post('/manger/user/destroy', checkLogin, userCl.destroy)
	app.post('/manger/user/create', checkLogin, userCl.create)
	app.post('/manger/user/getList', checkLogin, userCl.getList)
	app.post('/manger/user/getOne', checkLogin, userCl.getOne)

	//userbind
	app.get('/manger/userapp/list', checkLogin, userappCl.list)
	app.post('/manger/userapp/read', checkLogin, userappCl.read)
	app.post('/manger/userapp/update', checkLogin, userappCl.update)
	app.post('/manger/userapp/destroy', checkLogin, userappCl.destroy)
	app.post('/manger/userapp/create', checkLogin, userappCl.create)
	app.post('/manger/userapp/update2', checkLogin, userappCl.update2)
	app.post('/manger/userapp/create2', checkLogin, userappCl.create2)
	app.post('/manger/userapp/success', checkLogin, userappCl.success)
	app.post('/manger/userapp/fail', checkLogin, userappCl.fail)


	//reply
	app.get('/manger/reply/list', checkLogin, replyCl.list)
	app.post('/manger/reply/read', checkLogin, replyCl.read)
	app.post('/manger/reply/update', checkLogin, replyCl.update)
	app.post('/manger/reply/destroy', checkLogin, replyCl.destroy)
	app.post('/manger/reply/create', checkLogin, replyCl.create)
	app.post('/manger/reply/getList', checkLogin, replyCl.getList)


	//menu
	app.get('/manger/menu/list', checkLogin, menuCl.list)
	app.post('/manger/menu/read', checkLogin, menuCl.read)
	app.post('/manger/menu/update', checkLogin, menuCl.update)
	app.post('/manger/menu/destroy', checkLogin, menuCl.destroy)
	app.post('/manger/menu/create', checkLogin, menuCl.create)
    app.post('/manger/menu/sync', checkLogin, menuCl.sync)


    //active
	app.get('/manger/active/list', checkLogin, activeCl.list)
	app.post('/manger/active/read', checkLogin, activeCl.read)
	app.post('/manger/active/update', checkLogin, activeCl.update)
	app.post('/manger/active/destroy', checkLogin, activeCl.destroy)
	app.post('/manger/active/create', checkLogin, activeCl.create)
	app.post('/manger/active/getList', checkLogin, activeCl.getList)


    //active log
	app.get('/manger/activelog/list', checkLogin, activeLogCl.list)
	app.post('/manger/activelog/read', checkLogin, activeLogCl.read)
	app.post('/manger/activelog/update', checkLogin, activeLogCl.update)
	app.post('/manger/activelog/destroy', checkLogin, activeLogCl.destroy)
	app.post('/manger/activelog/create', checkLogin, activeLogCl.create)

	//active prize list
	app.get('/manger/activePrize/list', checkLogin, activePrizeCl.list)
	app.post('/manger/activePrize/read', checkLogin, activePrizeCl.read)
	app.post('/manger/activePrize/update', checkLogin, activePrizeCl.update)
	app.post('/manger/activePrize/destroy', checkLogin, activePrizeCl.destroy)
	app.post('/manger/activePrize/create', checkLogin, activePrizeCl.create)
	app.post('/manger/activePrize/getList', checkLogin, activePrizeCl.getList)

	//active prize record list
	app.get('/manger/activePrizeRecord/list', checkLogin, activePrizeRecordCl.list)
	app.post('/manger/activePrizeRecord/read', checkLogin, activePrizeRecordCl.read)
	app.post('/manger/activePrizeRecord/update', checkLogin, activePrizeRecordCl.update)
	app.post('/manger/activePrizeRecord/destroy', checkLogin, activePrizeRecordCl.destroy)
	app.post('/manger/activePrizeRecord/create', checkLogin, activePrizeRecordCl.create)
	app.get('/manger/activePrizeRecord/download', checkLogin, activePrizeRecordCl.download) //下载列表

	//active other
	app.get('/manger/activelog/ranklist', checkLogin, activeLogCl.ranklist)
  	app.post('/manger/activelog/getrank', checkLogin, activeLogCl.getrank)

	//lottery
	app.get('/manger/lottery/list', checkLogin, lotteryCl.list)
	app.post('/manger/lottery/read', checkLogin, lotteryCl.read)
	app.post('/manger/lottery/update', checkLogin, lotteryCl.update)
	app.post('/manger/lottery/destroy', checkLogin, lotteryCl.destroy)
	app.post('/manger/lottery/create', checkLogin, lotteryCl.create)
	app.post('/manger/lottery/getList', checkLogin, lotteryCl.getList)

	//lottery prize
	app.get('/manger/lotteryPrize/list', checkLogin, lotteryPrizeCl.list)
	app.post('/manger/lotteryPrize/read', checkLogin, lotteryPrizeCl.read)
	app.post('/manger/lotteryPrize/update', checkLogin, lotteryPrizeCl.update)
	app.post('/manger/lotteryPrize/destroy', checkLogin, lotteryPrizeCl.destroy)
	app.post('/manger/lotteryPrize/create', checkLogin, lotteryPrizeCl.create)
	app.post('/manger/lotteryPrize/getList', checkLogin, lotteryPrizeCl.getList)

	//lottery rec
	app.get('/manger/lotteryRec/list', checkLogin, lotteryRecCl.list)
	app.post('/manger/lotteryRec/read', checkLogin, lotteryRecCl.read)
	app.post('/manger/lotteryRec/update', checkLogin, lotteryRecCl.update)
	app.post('/manger/lotteryRec/destroy', checkLogin, lotteryRecCl.destroy)
	app.post('/manger/lotteryRec/create', checkLogin, lotteryRecCl.create)
	app.get('/manger/lotteryRec/download', checkLogin, lotteryRecCl.download) //下载列表


	//vote
	app.get('/manger/vote/list', checkLogin, voteCl.list)
	app.post('/manger/vote/read', checkLogin, voteCl.read)
	app.post('/manger/vote/update', checkLogin, voteCl.update)
	app.post('/manger/vote/destroy', checkLogin, voteCl.destroy)
	app.post('/manger/vote/create', checkLogin, voteCl.create)
	app.post('/manger/vote/getList', checkLogin, voteCl.getList)


	//vote group
	app.get('/manger/voteGroup/list', checkLogin, voteGroupCl.list)
	app.post('/manger/voteGroup/read', checkLogin, voteGroupCl.read)
	app.post('/manger/voteGroup/update', checkLogin, voteGroupCl.update)
	app.post('/manger/voteGroup/destroy', checkLogin, voteGroupCl.destroy)
	app.post('/manger/voteGroup/create', checkLogin, voteGroupCl.create)
	app.post('/manger/voteGroup/getList', checkLogin, voteGroupCl.getList)

	//vote item
	app.get('/manger/voteItem/list', checkLogin, voteItemCl.list)
	app.post('/manger/voteItem/read', checkLogin, voteItemCl.read)
	app.post('/manger/voteItem/update', checkLogin, voteItemCl.update)
	app.post('/manger/voteItem/destroy', checkLogin, voteItemCl.destroy)
	app.post('/manger/voteItem/create', checkLogin, voteItemCl.create)
	app.post('/manger/voteItem/getList', checkLogin, voteItemCl.getList)


	//vote record
	app.get('/manger/voteRec/list', checkLogin, voteRecordCl.list)
	app.post('/manger/voteRec/read', checkLogin, voteRecordCl.read)
	app.post('/manger/voteRec/update', checkLogin, voteRecordCl.update)
	app.post('/manger/voteRec/destroy', checkLogin, voteRecordCl.destroy)
	app.post('/manger/voteRec/create', checkLogin, voteRecordCl.create)
	
	//统计计算
	app.get('/manger/voteRec/aggressivelist',checkLogin, voteRecordCl.aggressiveList) //统计
	app.post('/manger/voteRec/aggressive',checkLogin, voteRecordCl.aggressive) //统计ajax接口
	app.post('/manger/voteRec/aggressiveCount',checkLogin, voteRecordCl.aggressiveCount) //统计vote参与人数和票数接口
	app.get('/manger/voteRec/download', checkLogin, voteRecordCl.download) //下载列表，导出excel


	//拿红包流水
	app.get('/manger/moneyLog/list', checkLogin, moneyCl.list)
	app.post('/manger/moneyLog/read', checkLogin, moneyCl.read)
	app.post('/manger/moneyLog/update', checkLogin, moneyCl.update)
	app.post('/manger/moneyLog/destroy', checkLogin, moneyCl.destroy)
	app.post('/manger/moneyLog/create', checkLogin, moneyCl.create)


	//获得guid
	app.get('/manger/guid/getguid', checkLogin, function(req,res){ 
		guidModel.getGuid(function(err,guid){
			if(err) res.send({'error':1,'data':err});
			
			res.send({'error':0,'data':guid})

		})
	})
}


module.exports = function(app){
	addroute(app);
}