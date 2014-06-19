var uploadCl = require('./cl/uploadCl.js');

var loginCl = require('./cl/loginCl.js');
var adminCl = require('./cl/adminCl.js');
var appCl = require('./cl/appCl.js');
var bookCl = require('./cl/appBookCl.js');
var commentCl = require('./cl/appCommentCl.js');
var gameCl = require('./cl/appGameCl.js');
var newsCl = require('./cl/NewsCl.js');
var specialCl = require('./cl/appSpecialCl.js');

var userCl = require('./cl/userCl.js');
var userappCl = require('./cl/userAppCl.js');
var scoreCl = require('./cl/scoreCl.js')

var replyCl = require('./cl/replyCl.js')
var menuCl = require('./cl/menuCl.js')

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


}


module.exports = function(app){
	addroute(app);
}