var captcha = require('ccap')();

var obj = {}

obj.ccapCl = function(req, res){
	var ary = captcha.get();
	var txt = ary[0];
    var buf = ary[1];

    req.session.cap = txt;
	res.set('Content-Type', 'image/jpeg');
	res.end(buf);
}


obj.ccapCheck = function(req, res, captureVal){
	var captureVal = (captureVal || '-1').toUpperCase()
	//console.log(req.session.cap)
	//console.log(captureVal)
	//console.log(req.session.cap == captureVal)

	if(req.session.cap == captureVal){
		return true
	}
	else{
		return false
	}
}


module.exports = obj;