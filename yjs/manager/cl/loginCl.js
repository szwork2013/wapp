var UserLogin = {};
var Dl = require('../../dl/adminModel.js');
var utils = require('../../lib/utils.js');
var salt = global.app.get('salt');

UserLogin.Login = function(req,res){
	res.render('login', {error:''});
}

UserLogin.UserLogin = function(req,res){

	if(!req.body.admin || !req.body.password){
		return	res.render('login', {error:'用户名或密码未填写'})
	}
	Dl.findAll({
		admin:req.body.admin
	}, 0,100,function(err,doc){
		if(err) return res.send(500);

		if(doc &&  doc.length>0 && doc[0].password === utils.md5(req.body.password+salt)){
			req.session.admin = req.body.admin;
			res.redirect('/manger/main/')
			return;
		}
		else{
			return	res.render('login', {error:'用户名或密码错误'})
		}		
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