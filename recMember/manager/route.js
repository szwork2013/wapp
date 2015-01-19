var guidModel = require('../dl/guidModel.js');

var uploadCl = require('./cl/uploadCl.js');
var thumbCl = require('./cl/thumbCl.js');

var loginCl = require('./cl/loginCl.js');
var adminCl = require('./cl/adminCl.js');
var appCl = require('./cl/appCl.js');
var bookCl = require('./cl/appBookCl.js');

var newsCl = require('./cl/newsCl.js');

var userCl = require('./cl/userCl.js');
var userappCl = require('./cl/userAppCl.js');

var replyCl = require('./cl/replyCl.js')
var menuCl = require('./cl/menuCl.js')

var transacCl = require('./cl/transacCl.js');
var recRecordCl = require('./cl/recRecordCl.js');






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


	app.get('/manger/userbind/list', checkLogin, userappCl.bindlist)
	app.get('/manger/userbindcheck/list', checkLogin, userappCl.bindcheck)





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

  	
  	//transac
	app.get('/manger/transac/list', checkLogin, transacCl.list)
	app.post('/manger/transac/read', checkLogin, transacCl.read)
	app.post('/manger/transac/update', checkLogin, transacCl.update)
	app.post('/manger/transac/destroy', checkLogin, transacCl.destroy)
	app.post('/manger/transac/create', checkLogin, transacCl.create)

	//recrecord
	app.get('/manger/recrecord/list', checkLogin, recRecordCl.list)
	app.get('/manger/recrecord/brokelist', checkLogin, recRecordCl.list2)
	app.post('/manger/recrecord/read', checkLogin, recRecordCl.read)
	app.post('/manger/recrecord/update', checkLogin, recRecordCl.update)
	app.post('/manger/recrecord/destroy', checkLogin, recRecordCl.destroy)
	app.post('/manger/recrecord/create', checkLogin, recRecordCl.create)
	app.post('/manger/recrecord/success', checkLogin, recRecordCl.success)
	app.post('/manger/recrecord/fail', checkLogin, recRecordCl.fail)
	





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