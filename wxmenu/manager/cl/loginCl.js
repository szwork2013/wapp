var UserLogin = {};
var Dl = require('../../dl/adminModel.js');
var utils = require('../../lib/utils.js');
var salt = global.app.get('salt');

UserLogin.Login = function(req,res){
	res.render('login', {error:''});
}

UserLogin.Login2 = function(req,res){
	//console.log(req.headers.host)
	if(req.headers.host.indexOf('xy-tang.com') != -1){
		res.render('login', {error:''});
	}
	else{
		res.render('login2', {error:''});
	}	
}

UserLogin.UserLogin = function(req,res){

	if(req.body.login_page){
		var template = req.body.login_page
	}
	else{
		template = 'login'
	}

	if(!req.body.admin || !req.body.password){
		return	res.render(template, {error:'用户名或密码未填写'})
	}
	Dl.findAll({
		admin:req.body.admin
	}, 0,100,function(err,doc){
		if(err) return res.send(500);
		//console.log(doc, doc[0].password,utils.md5(req.body.password+salt))
		if(doc &&  doc.length>0 && doc[0].password === utils.md5(req.body.password+salt)){
			req.session.admin = req.body.admin;
			req.session.adminAppId = doc[0].appId;
			res.redirect('/manger/main/')
			return;
		}
		else{
			return	res.render(template, {error:'用户名或密码错误'})
		}		
	})
	
}


UserLogin.Logout = function(req,res){

	if(req.session.admin.indexOf('95515_vote') != -1){
		req.session = {};
		res.redirect('/')
	}
	else{
		req.session = {};
		res.redirect('/manger/login/')
	}
	
	
}



UserLogin.Main = function(req,res){
	res.render('main', {pos:'',session:req.session})
}



module.exports = UserLogin;