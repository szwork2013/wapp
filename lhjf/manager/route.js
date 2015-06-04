var guidModel = require('../dl/guidModel.js');

var uploadCl = require('./cl/uploadCl.js');
var thumbCl = require('./cl/thumbCl.js');

var loginCl = require('./cl/loginCl.js');
var adminCl = require('./cl/adminCl.js');
var appCl = require('./cl/appCl.js');
var bookCl = require('./cl/appBookCl.js');
var commentCl = require('./cl/appCommentCl.js');
var gameCl = require('./cl/appGameCl.js');
var newsCl = require('./cl/newsCl.js');
var specialCl = require('./cl/appSpecialCl.js');

var userCl = require('./cl/userCl.js');
var userappCl = require('./cl/userAppCl.js');
var scoreCl = require('./cl/scoreCl.js')

var replyCl = require('./cl/replyCl.js')
var menuCl = require('./cl/menuCl.js')

var prizeCl = require('./cl/prizeCl.js')
var recommendCl = require('./cl/recommendCl.js')
var saleCl = require('./cl/saleCl.js')

var qrcodeCl = require('./cl/qrcodeCl.js')
var investigateCl = require('./cl/investigateCl.js')
var investigateLogCl = require('./cl/investigateLogCl.js')


var activeLogCl = require('./cl/activeLogCl.js')

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

	//book
	app.get('/manger/book/list', checkLogin, bookCl.list)
	app.post('/manger/book/read', checkLogin, bookCl.read)
	app.post('/manger/book/update', checkLogin, bookCl.update)
	app.post('/manger/book/destroy', checkLogin, bookCl.destroy)
	app.post('/manger/book/create', checkLogin, bookCl.create)

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


	//score
	app.get('/manger/score/list', checkLogin, scoreCl.list)
	app.get('/manger/score/consume_list', checkLogin, scoreCl.consume_list)	
	app.post('/manger/score/read', checkLogin, scoreCl.read)
	app.post('/manger/score/update', checkLogin, scoreCl.update)
	app.post('/manger/score/destroy', checkLogin, scoreCl.destroy)
	app.post('/manger/score/create', checkLogin, scoreCl.create)

	//comment
	app.get('/manger/comment/list', checkLogin, commentCl.list)
	app.post('/manger/comment/read', checkLogin, commentCl.read)
	app.post('/manger/comment/update', checkLogin, commentCl.update)
	app.post('/manger/comment/destroy', checkLogin, commentCl.destroy)
	app.post('/manger/comment/create', checkLogin, commentCl.create)

	//game
	app.get('/manger/game/list', checkLogin, gameCl.list)
	app.post('/manger/game/read', checkLogin, gameCl.read)
	app.post('/manger/game/update', checkLogin, gameCl.update)
	app.post('/manger/game/destroy', checkLogin, gameCl.destroy)
	app.post('/manger/game/create', checkLogin, gameCl.create)

	//near
	app.get('/manger/special/list', checkLogin, specialCl.list)
	app.post('/manger/special/read', checkLogin, specialCl.read)
	app.post('/manger/special/update', checkLogin, specialCl.update)
	app.post('/manger/special/destroy', checkLogin, specialCl.destroy)
	app.post('/manger/special/create', checkLogin, specialCl.create)


	//news
	app.get('/manger/news/list', checkLogin, newsCl.list)
	app.post('/manger/news/read', checkLogin, newsCl.read)
	app.post('/manger/news/update', checkLogin, newsCl.update)
	app.post('/manger/news/destroy', checkLogin, newsCl.destroy)
	app.post('/manger/news/create', checkLogin, newsCl.create)

	

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

    //prize
	app.get('/manger/prize/list', checkLogin, prizeCl.list)
	app.post('/manger/prize/read', checkLogin, prizeCl.read)
	app.post('/manger/prize/update', checkLogin, prizeCl.update)
	app.post('/manger/prize/destroy', checkLogin, prizeCl.destroy)
	app.post('/manger/prize/create', checkLogin, prizeCl.create)
	app.post('/manger/prize/getOne', checkLogin, prizeCl.getOne)

	//recommend
	app.get('/manger/recommend/list', checkLogin, recommendCl.list)
	app.post('/manger/recommend/read', checkLogin, recommendCl.read)
	app.post('/manger/recommend/update', checkLogin, recommendCl.update)
	app.post('/manger/recommend/destroy', checkLogin, recommendCl.destroy)
	app.post('/manger/recommend/create', checkLogin, recommendCl.create)
	app.post('/manger/recommend/check', checkLogin, recommendCl.check)

	//activeLogCl
	app.get('/manger/activelog/list', checkLogin, activeLogCl.list)
	app.post('/manger/activelog/read', checkLogin, activeLogCl.read)
	app.post('/manger/activelog/update', checkLogin, activeLogCl.update)
	app.post('/manger/activelog/destroy', checkLogin, activeLogCl.destroy)
	app.post('/manger/activelog/create', checkLogin, activeLogCl.create)


	//sale
	app.get('/manger/sale/list', checkLogin, saleCl.list)
	app.post('/manger/sale/read', checkLogin, saleCl.read)
	app.post('/manger/sale/update', checkLogin, saleCl.update)
	app.post('/manger/sale/destroy', checkLogin, saleCl.destroy)
	app.post('/manger/sale/create', checkLogin, saleCl.create)
	app.post('/manger/sale/complete', checkLogin, saleCl.complete)
	app.post('/manger/sale/getOne', checkLogin, saleCl.getOne)

	//qrcode
	app.get('/manger/qrcode/list', checkLogin, qrcodeCl.list)
	app.post('/manger/qrcode/read', checkLogin, qrcodeCl.read)
	app.post('/manger/qrcode/update', checkLogin, qrcodeCl.update)
	app.post('/manger/qrcode/destroy', checkLogin, qrcodeCl.destroy)
	app.post('/manger/qrcode/create', checkLogin, qrcodeCl.create)

	//investigate
	app.get('/manger/investigate/list', checkLogin, investigateCl.list)
	app.post('/manger/investigate/read', checkLogin, investigateCl.read)
	app.post('/manger/investigate/update', checkLogin, investigateCl.update)
	app.post('/manger/investigate/destroy', checkLogin, investigateCl.destroy)
	app.post('/manger/investigate/create', checkLogin, investigateCl.create)
	app.post('/manger/investigate/getList', checkLogin, investigateCl.getList)

	//investigateLog
	app.get('/manger/investigateLog/list', checkLogin, investigateLogCl.list)
	app.get('/manger/investigateLog/result', checkLogin, investigateLogCl.result)
	app.post('/manger/investigateLog/read', checkLogin, investigateLogCl.read)
	app.post('/manger/investigateLog/update', checkLogin, investigateLogCl.update)
	app.post('/manger/investigateLog/destroy', checkLogin, investigateLogCl.destroy)
	app.post('/manger/investigateLog/create', checkLogin, investigateLogCl.create)
	app.post('/manger/investigateLog/info', checkLogin, investigateLogCl.info)

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