var utils = require('../lib/utils.js');
var voteBl = require('../bl/wxVote.js');
var appBl = require('../bl/wxApp.js');
var obj = {}


obj.votePage = function(req,res){ //活动页面展示
	var wxuobj = req.wxuobj;

	var ename = req.query.ename;
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}

	var appEname = appobj.data;

	//req.session[appEname+'_userid'] = '53ecbe65e00fd324efd73032'
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}

	if(!appEname){
		return res.send(404)
	}

	//先去查找抽奖活动记录
	voteBl.getVoteByEname(ename,function(err,voteObj){
		if(err){
			return res.send(err)
		}
		if(!voteObj){
			return res.send(404)
		}

		appBl.getByEname(appEname,function(err,appObj){
			if(err){
				return res.send(err)
			}
			if(!appObj){
				return res.send(404)
			}


			res.render('vote/'+ename+'.ejs', {
				voteObj:voteObj,
				ename:ename,
				appEname:appEname,
				appId:appObj._id,
				userid:userid,
				wxuobj:wxuobj
			});

		})


	})

	

	

	
}


module.exports = obj;