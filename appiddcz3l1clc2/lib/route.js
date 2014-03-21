
var loginCl = require('./cl/loginCl.js');
var clientCl = require('./cl/clientCl.js');
var userCl = require('./cl/userCl.js');
var voteCl = require('./cl/voteCl.js');
var voteRecordCl = require('./cl/voteRecordCl.js');
var platUserCl = require('./cl/platUserCl.js');
var formCl = require('./cl/formCl.js');
var urlCl = require('./cl/urlCl.js');

var puzzleCl = require('./cl/puzzleCl.js');
var puzzlePrizeCl = require('./cl/puzzlePrizeCl.js');
var puzzlePrizePoolCl = require('./cl/puzzlePrizePoolCl.js');
var puzzlePrizeRecordCl = require('./cl/puzzlePrizeRecordCl.js');
var puzzleQuesstionCl = require('./cl/puzzleQuesstionCl.js');
var puzzleRecordCl = require('./cl/puzzleRecordCl.js');

var lotteryCl = require('./cl/lotteryCl.js');
var lotteryPrizeCl = require('./cl/lotteryPrizeCl.js');
var lotteryPrizePoolCl = require('./cl/lotteryPrizePoolCl.js');
var lotteryRecordCl = require('./cl/lotteryRecordCl.js');

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

var checkAdmin = function(req, res, next){ //中间件
	if(!req.session.isWidgetAdmin){ //判断是否为管理员
		return res.send(403)
	}
	next();
}


var addroute = function(app){

	//登录
	app.get('/', loginCl.Login)
	app.get('/manger/login', loginCl.Login)
	app.get('/manger/logout', checkLogin, loginCl.Logout)
	app.post('/manger/login', loginCl.UserLogin)
	app.get('/manger/main', checkLogin, loginCl.Main)

	//client
	app.get('/manger/client/list', checkLogin, checkAdmin, clientCl.list)
	app.post('/manger/client/read', checkLogin,  clientCl.read)
	app.post('/manger/client/update', checkLogin, checkAdmin, clientCl.update)
	app.post('/manger/client/destroy', checkLogin, checkAdmin, clientCl.destroy)
	app.post('/manger/client/create', checkLogin, checkAdmin, clientCl.create)

	//user
	app.get('/manger/user/list', checkLogin, userCl.list)
	app.post('/manger/user/read', checkLogin, userCl.read)
	app.post('/manger/user/update', checkLogin, checkAdmin, userCl.update)
	app.post('/manger/user/destroy', checkLogin, checkAdmin, userCl.destroy)
	app.post('/manger/user/create', checkLogin, checkAdmin, userCl.create)

	//vote
	app.get('/manger/vote/list', checkLogin, voteCl.list)
	app.post('/manger/vote/read', checkLogin, voteCl.read)
	app.post('/manger/vote/getGroup', checkLogin, voteCl.getGroup)
	app.post('/manger/vote/update', checkLogin, voteCl.update)
	app.post('/manger/vote/destroy', checkLogin, voteCl.destroy)
	app.post('/manger/vote/create', checkLogin, voteCl.create)

	//voteRecord
	app.get('/manger/voteRecord/list', checkLogin, voteRecordCl.list)
	app.post('/manger/voteRecord/read', checkLogin, voteRecordCl.read)
	app.post('/manger/voteRecord/update', checkLogin, voteRecordCl.update)
	app.post('/manger/voteRecord/destroy', checkLogin, voteRecordCl.destroy)
	app.post('/manger/voteRecord/create', checkLogin, voteRecordCl.create)

	//platUser
	app.get('/manger/platUser/list', checkLogin, platUserCl.list)
	app.post('/manger/platUser/read', checkLogin, platUserCl.read)
	app.post('/manger/platUser/update', checkLogin, checkAdmin, platUserCl.update)
	app.post('/manger/platUser/destroy', checkLogin, checkAdmin, platUserCl.destroy)
	app.post('/manger/platUser/create', checkLogin, checkAdmin, platUserCl.create)


	//puzzle
	app.get('/manger/puzzle/list', checkLogin, puzzleCl.list)
	app.post('/manger/puzzle/read', checkLogin, puzzleCl.read)
	app.post('/manger/puzzle/update', checkLogin, puzzleCl.update)
	app.post('/manger/puzzle/destroy', checkLogin, puzzleCl.destroy)
	app.post('/manger/puzzle/create', checkLogin, puzzleCl.create)
	app.post('/manger/puzzle/getPuzzleList', checkLogin, puzzleCl.getPuzzleList)

		//puzzlePrize
	app.get('/manger/puzzlePrize/list', checkLogin, puzzlePrizeCl.list)
	app.post('/manger/puzzlePrize/read', checkLogin, puzzlePrizeCl.read)
	app.post('/manger/puzzlePrize/update', checkLogin, puzzlePrizeCl.update)
	app.post('/manger/puzzlePrize/destroy', checkLogin, puzzlePrizeCl.destroy)
	app.post('/manger/puzzlePrize/create', checkLogin, puzzlePrizeCl.create)

		//puzzlePrizePoolCl
	app.get('/manger/puzzlePrizePool/list', checkLogin, puzzlePrizePoolCl.list)
	app.post('/manger/puzzlePrizePool/read', checkLogin, puzzlePrizePoolCl.read)
	app.post('/manger/puzzlePrizePool/update', checkLogin, puzzlePrizePoolCl.update)
	app.post('/manger/puzzlePrizePool/destroy', checkLogin, puzzlePrizePoolCl.destroy)
	app.post('/manger/puzzlePrizePool/create', checkLogin, puzzlePrizePoolCl.create)

		//puzzlePrizeRecordCl
	app.get('/manger/puzzlePrizeRecord/list', checkLogin, puzzlePrizeRecordCl.list)
	app.post('/manger/puzzlePrizeRecord/read', checkLogin, puzzlePrizeRecordCl.read)
	app.post('/manger/puzzlePrizeRecord/update', checkLogin, puzzlePrizeRecordCl.update)
	app.post('/manger/puzzlePrizeRecord/destroy', checkLogin, puzzlePrizeRecordCl.destroy)
	app.post('/manger/puzzlePrizeRecord/create', checkLogin, puzzlePrizeRecordCl.create)

		//puzzleQuesstionCl
	app.get('/manger/puzzleQuesstion/list', checkLogin, puzzleQuesstionCl.list)
	app.post('/manger/puzzleQuesstion/read', checkLogin, puzzleQuesstionCl.read)
	app.post('/manger/puzzleQuesstion/update', checkLogin, puzzleQuesstionCl.update)
	app.post('/manger/puzzleQuesstion/destroy', checkLogin, puzzleQuesstionCl.destroy)
	app.post('/manger/puzzleQuesstion/create', checkLogin, puzzleQuesstionCl.create)

		//puzzleRecordCl
	app.get('/manger/puzzleRecord/list', checkLogin, puzzleRecordCl.list)
	app.post('/manger/puzzleRecord/read', checkLogin, puzzleRecordCl.read)
	app.post('/manger/puzzleRecord/update', checkLogin, puzzleRecordCl.update)
	app.post('/manger/puzzleRecord/destroy', checkLogin, puzzleRecordCl.destroy)
	app.post('/manger/puzzleRecord/create', checkLogin, puzzleRecordCl.create)

	//lottery
	app.get('/manger/lottery/list', checkLogin, lotteryCl.list)
	app.post('/manger/lottery/read', checkLogin, lotteryCl.read)
	app.post('/manger/lottery/update', checkLogin, lotteryCl.update)
	app.post('/manger/lottery/destroy', checkLogin, lotteryCl.destroy)
	app.post('/manger/lottery/create', checkLogin, lotteryCl.create)
	app.post('/manger/lottery/getLotteryList', checkLogin, lotteryCl.getLotteryList)

	//lotteryPrize
	app.get('/manger/lotteryPrize/list', checkLogin, lotteryPrizeCl.list)
	app.post('/manger/lotteryPrize/read', checkLogin, lotteryPrizeCl.read)
	app.post('/manger/lotteryPrize/update', checkLogin, lotteryPrizeCl.update)
	app.post('/manger/lotteryPrize/destroy', checkLogin, lotteryPrizeCl.destroy)
	app.post('/manger/lotteryPrize/create', checkLogin, lotteryPrizeCl.create)

	//lotteryPrizePool
	app.get('/manger/lotteryPrizePool/list', checkLogin, lotteryPrizePoolCl.list)
	app.post('/manger/lotteryPrizePool/read', checkLogin, lotteryPrizePoolCl.read)
	app.post('/manger/lotteryPrizePool/update', checkLogin, lotteryPrizePoolCl.update)
	app.post('/manger/lotteryPrizePool/destroy', checkLogin, lotteryPrizePoolCl.destroy)
	app.post('/manger/lotteryPrizePool/create', checkLogin, lotteryPrizePoolCl.create)

	//lotteryRecord
	app.get('/manger/lotteryRecord/list', checkLogin, lotteryRecordCl.list)
	app.post('/manger/lotteryRecord/read', checkLogin, lotteryRecordCl.read)
	app.post('/manger/lotteryRecord/update', checkLogin, lotteryRecordCl.update)
	app.post('/manger/lotteryRecord/destroy', checkLogin, lotteryRecordCl.destroy)
	app.post('/manger/lotteryRecord/create', checkLogin, lotteryRecordCl.create)



	//form
	app.get('/manger/form/page', checkLogin, formCl.page)
	app.get('/manger/form/list', checkLogin, formCl.list)
	app.get('/manger/form/getFormat', checkLogin, formCl.getFormat)
	app.post('/manger/form/read', checkLogin, formCl.read)
	app.post('/manger/form/update', checkLogin, formCl.update)
	app.post('/manger/form/destroy', checkLogin, formCl.destroy)
	app.post('/manger/form/create', checkLogin, formCl.create)


	//url列表
	app.get('/manger/url/list', checkLogin, urlCl.list)
}


module.exports = function(app){
	addroute(app);
}