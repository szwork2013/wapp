
var UserLogin = {};
var loginDl = require('../dl/loginDl.js');
var clientDl = require('../dl/clientDl.js');
var utils = require('../../lib/utils.js');
var salt = global.app.get('salt');

UserLogin.Login = function(req,res){
	res.render('login', {error:''});
}

UserLogin.UserLogin = function(req,res){

	if(!req.body.admin || !req.body.password){
		return	res.render('login', {error:'用户名或密码错误'})
	}

	loginDl.findByusername(req.body.admin, function(err,doc){
		if(err) return res.send(500);

		if(doc && doc.password === req.body.password){
			req.session.admin = req.body.admin;
			req.session.clientId = 0;
			req.session.isWidgetAdmin = 1;
			res.redirect('/manger/main/')
			return;
		}
		clientDl.findClientByName(req.body.admin,function(err,doc){
			if(err) return res.send(500);
			if(!doc || doc.password !== utils.md5(req.body.password+salt)){
				return	res.render('login', {error:'用户名或密码错误'})
			}
			req.session.admin = req.body.admin;
			req.session.clientId = doc._id;
			req.session.isWidgetAdmin = 0;
			res.redirect('/manger/main/');
			return;
		});
		
	})
	
}


UserLogin.Logout = function(req,res){

	req.session = null;
	res.redirect('/manger/login/')
	
}



UserLogin.Main = function(req,res){
	res.render('main', {pos:'',session:req.session})
}



module.exports = UserLogin;