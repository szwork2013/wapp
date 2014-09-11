var utils = require('../lib/utils.js');
var obj = {}


obj.lotteryPage = function(req,res){ //活动页面展示
	var lotteryEname = req.query.ename;
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	if(!lotteryEname){
		return res.send(404)
	}
	res.render('lottery/'+lotteryEname+'.ejs', {lotteryEname:lotteryEname,appEname:appEname});
}


module.exports = obj;