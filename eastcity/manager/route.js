var uploadCl = require('./cl/uploadCl.js');

var loginCl = require('./cl/loginCl.js');
var adminCl = require('./cl/adminCl.js');
var appCl = require('./cl/appCl.js');
var shopCl = require('./cl/shopCl.js');
var userCl = require('./cl/userCl.js');
var userappCl = require('./cl/userAppCl.js');
var scoreCl = require('./cl/scoreCl.js')
var recCl = require('./cl/recCl.js')
var coCl = require('./cl/coCl.js')
var nearCl = require('./cl/nearCl.js')
var serviceCl = require('./cl/serviceCl.js')
var newsCl = require('./cl/newsCl.js')
var suggestCl = require('./cl/suggestCl.js')
var replyCl = require('./cl/replyCl.js')
var menuCl = require('./cl/menuCl.js')

var lotteryCl = require('./cl/lotteryCl.js');
var lotteryPrizeCl = require('./cl/lotteryPrizeCl.js');
var lotteryRecCl = require('./cl/lotteryRecCl.js');


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

	//登录
	app.get('/', loginCl.Login)
	app.get('/manger/login', loginCl.Login)
	app.get('/manger/logout', checkLogin, loginCl.Logout)
	app.post('/manger/login', loginCl.UserLogin)
	app.get('/manger/main', checkLogin, loginCl.Main)

	//admin
	app.get('/manger/admin/list', checkLogin, adminCl.list)
	app.post('/manger/admin/read', checkLogin,  adminCl.read)
	app.post('/manger/admin/update', checkLogin, adminCl.update)
	app.post('/manger/admin/destroy', checkLogin, adminCl.destroy)
	app.post('/manger/admin/create', checkLogin, adminCl.create)

	//app
	app.get('/manger/app/list', checkLogin, appCl.list)
	app.post('/manger/app/read', checkLogin, appCl.read)
	app.post('/manger/app/update', checkLogin, appCl.update)
	app.post('/manger/app/destroy', checkLogin, appCl.destroy)
	app.post('/manger/app/create', checkLogin, appCl.create)
	app.post('/manger/app/getList', checkLogin, appCl.getList)

	//shop
	app.get('/manger/shop/list', checkLogin, shopCl.list)
	app.post('/manger/shop/read', checkLogin, shopCl.read)
	app.post('/manger/shop/update', checkLogin, shopCl.update)
	app.post('/manger/shop/destroy', checkLogin, shopCl.destroy)
	app.post('/manger/shop/create', checkLogin, shopCl.create)
	app.post('/manger/shop/getList', checkLogin, shopCl.getList)

	//user
	app.get('/manger/user/list', checkLogin, userCl.list)
	app.post('/manger/user/read', checkLogin, userCl.read)
	app.post('/manger/user/update', checkLogin, userCl.update)
	app.post('/manger/user/destroy', checkLogin, userCl.destroy)
	app.post('/manger/user/create', checkLogin, userCl.create)
	app.post('/manger/user/getList', checkLogin, userCl.getList)

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


	app.get('/manger/userbind/list', checkLogin, userappCl.bindlist)
	app.get('/manger/userbindcheck/list', checkLogin, userappCl.bindcheck)
	

	//score
	app.get('/manger/score/list', checkLogin, scoreCl.list)
	app.get('/manger/score/consume_list', checkLogin, scoreCl.consume_list)	
	app.post('/manger/score/read', checkLogin, scoreCl.read)
	app.post('/manger/score/update', checkLogin, scoreCl.update)
	app.post('/manger/score/destroy', checkLogin, scoreCl.destroy)
	app.post('/manger/score/create', checkLogin, scoreCl.create)

	//rec
	app.get('/manger/rec/list', checkLogin, recCl.list)
	app.post('/manger/rec/read', checkLogin, recCl.read)
	app.post('/manger/rec/update', checkLogin, recCl.update)
	app.post('/manger/rec/destroy', checkLogin, recCl.destroy)
	app.post('/manger/rec/create', checkLogin, recCl.create)

	//co
	app.get('/manger/co/list', checkLogin, coCl.list)
	app.post('/manger/co/read', checkLogin, coCl.read)
	app.post('/manger/co/update', checkLogin, coCl.update)
	app.post('/manger/co/destroy', checkLogin, coCl.destroy)
	app.post('/manger/co/create', checkLogin, coCl.create)
	app.post('/manger/co/getList', checkLogin, coCl.getList)

	//near
	app.get('/manger/near/list', checkLogin, nearCl.list)
	app.post('/manger/near/read', checkLogin, nearCl.read)
	app.post('/manger/near/update', checkLogin, nearCl.update)
	app.post('/manger/near/destroy', checkLogin, nearCl.destroy)
	app.post('/manger/near/create', checkLogin, nearCl.create)


	//near
	app.get('/manger/service/list', checkLogin, serviceCl.list)
	app.post('/manger/service/read', checkLogin, serviceCl.read)
	app.post('/manger/service/update', checkLogin, serviceCl.update)
	app.post('/manger/service/destroy', checkLogin, serviceCl.destroy)
	app.post('/manger/service/create', checkLogin, serviceCl.create)

	//news
	app.get('/manger/news/list', checkLogin, newsCl.list)
	app.get('/manger/active/list', checkLogin, newsCl.actlist)
	app.post('/manger/news/read', checkLogin, newsCl.read)
	app.post('/manger/news/update', checkLogin, newsCl.update)
	app.post('/manger/news/destroy', checkLogin, newsCl.destroy)
	app.post('/manger/news/create', checkLogin, newsCl.create)

	//suggest
	app.get('/manger/suggest/list', checkLogin, suggestCl.list)
	app.get('/manger/suggest_check/list', checkLogin, suggestCl.checklist)
	app.post('/manger/suggest/read', checkLogin, suggestCl.read)
	app.post('/manger/suggest/update', checkLogin, suggestCl.update)
	app.post('/manger/suggest/destroy', checkLogin, suggestCl.destroy)
	app.post('/manger/suggest/create', checkLogin, suggestCl.create)
	

	//co
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

}


module.exports = function(app){
	addroute(app);
}