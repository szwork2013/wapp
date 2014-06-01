var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var utils = require('../lib/utils.js');
var moment = require('moment');
var obj = {}


obj.appDetail = function(req,res){ //开发商详细
	/*
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	res.render('serviceAppDetail.ejs',{
		'userObj':req.wxuobj,
		'binderObj':req.wxBinder,
		'doc':global.wxAppObj
	})
	return;
	*/
}

obj.coList = function(req,res){ //小区列表查询
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	infoBl.getCo(appId, function(err,list){
		if(err){
			logger.error('obj.coList infoBl.getCo error, appId %s, err %s', appId, err);
			return res.send(500,'小区页面加载失败')
		}

		res.render('serviceCoList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}




obj.coDetail = function(req,res){ //小区详细页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var coId = req.query.coId;
	if(!coId){
		return res.send(500,'缺少参数coId')
	}
	if(coId.length !== 24){
		return res.send(500,'错误参数coId')
	}

	infoBl.getOneCoById(coId, function(err,doc){
		if(err){
			logger.error('obj.coDetail infoBl.getOneCoById error, coId %s, err %s', coId, err);
			return res.send(500,'小区详细页面加载失败')
		}

		res.render('serviceCoDetail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'backUrl':'/view/service/colist?wxuserid='+userId,
			'doc':doc
		})
		return;
	})

}


obj.coService = function(req,res){ //小区物业查询
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var coId = req.query.coId;

	if(coId && coId.length !== 24){
		return res.send(500,'错误参数coId')
	}

	infoBl.getCo(appId, function(err,coList){
		if(err){
			logger.error('obj.coService infoBl.getCo error, coId %s, err %s', coId, err);
			return res.send(500,'物业页面加载失败')
		}
		if(!coId){
			coId = coList[0]._id
		}

		infoBl.getCoService(coId, function(err,list){
			if(err){
				logger.error('obj.coService infoBl.getCoService error, coId %s, err %s', coId, err);
				return res.send(500,'物业页面加载失败')
			}

			res.render('serviceCoService.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'list':list,
				'coList':coList,
				'qCoId':req.query.coId || false
			})
			return;
		})
	})

}


obj.coNear = function(req,res){ //小区周边配套
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var coId = req.query.coId;


	if(coId && coId.length !== 24){
		return res.send(500,'错误参数coId')
	}

	infoBl.getCo(appId, function(err,coList){
		if(err){
			logger.error('obj.coNear infoBl.getCo error, coId %s, err %s', coId, err);
			return res.send(500,'周边配套页面加载失败')
		}
		if(!coId){
			coId = coList[0]._id
		}

		infoBl.getCoNear(coId, function(err,list){
			if(err){
				logger.error('obj.coNear infoBl.getCoNear error, coId %s, err %s', coId, err);
				return res.send(500,'周边配套页面加载失败')
			}

			res.render('serviceCoNear.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'list':list,
				'coList':coList,
				'qCoId':req.query.coId || false
			})
			return;
		})
	})

}



obj.newsAll = function(req,res){ //获取新闻
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var page = req.query.page || 1;

	infoBl.getAppNews(appId, page, function(err,list){
		if(err){
			logger.error('obj.newsAll infoBl.getAppNews error, appId %s, err %s', appId, err);
			return res.send(500,'新闻页面加载失败')
		}

		var tempList = []
		list.forEach(function(o){
			tempList.push({
			  _id:o._id,
			  appId:o.appId,    			  //应用id
		      coId:o.coId,
		      appNewsTitle:o.appNewsTitle,
		      appNewsContent:o.appNewsContent,
		      appNewsPicture:o.appNewsPicture.split(','),
		      appNewsType:o.appNewsType,
		      isShow:o.isShow,
			  writeTime: moment(o.writeTime).format('YYYY年MM月DD日')
			})
		})

		res.render('serviceNewsList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':tempList,
			'title':'常发新闻',
			'type':'news'
		})
		return;
	})

}


/*
obj.coNews = function(req,res){ //获取小区新闻
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var page = req.query.page || 1;
	var coId = req.query.coId;
	if(!coId){
		return res.send(500,'缺少参数coId')
	}
	if(coId.length !== 24){
		return res.send(500,'错误参数coId')
	}


	infoBl.getCoNews(coId, page, function(err,list){
		if(err){
			logger.error('obj.coNews infoBl.getCoNews error, coId %s, err %s', coId, err);
			return res.send(500,'小区新闻页面加载失败')
		}

		res.render('serviceCoNews.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})

}
*/

obj.coCall = function(req,res){ //获取小区新闻
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	res.render('serviceCall.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder
		})
}


obj.coPromotion = function(req,res){ //获取优惠
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var page = req.query.page || 1;
	
	var coId = req.query.coId || null;

	if(coId && coId.length !== 24){
		return res.send(500,'错误参数coId')
	}


	infoBl.getCoProm(coId, page, function(err,list){
		if(err){
			logger.error('obj.coPromotion infoBl.getCoProm error, coId %s, err %s', coId, err);
			return res.send(500,'小区优惠页面加载失败')
		}
		var tempList = []
		list.forEach(function(o){
			tempList.push({
			  _id:o._id,
			  appId:o.appId,    			  //应用id
		      coId:o.coId,
		      appNewsTitle:o.appNewsTitle,
		      appNewsContent:o.appNewsContent,
		      appNewsPicture:o.appNewsPicture.split(','),
		      appNewsType:o.appNewsType,
		      isShow:o.isShow,
			  writeTime: moment(o.writeTime).format('YYYY年MM月DD日')
			})
		})

		res.render('serviceNewsList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':tempList,
			'title':'优惠活动',
			'type':'prom'
		})
		return;
	})

}


obj.coAct = function(req,res){ //获取活动
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var page = req.query.page || 1;
	var coId = req.query.coId;

	if(coId && coId.length !== 24){
		return res.send(500,'错误参数coId')
	}

	infoBl.getCoAct(coId, page, function(err,list){
		if(err){
			logger.error('obj.coAct infoBl.getCoAct error, coId %s, err %s', coId, err);
			return res.send(500,'小区活动页面加载失败')
		}

		var tempList = []
		list.forEach(function(o){
			tempList.push({
			  _id:o._id,
			  appId:o.appId,    			  //应用id
		      coId:o.coId,
		      appNewsTitle:o.appNewsTitle,
		      appNewsContent:o.appNewsContent,
		      appNewsPicture:o.appNewsPicture.split(','),
		      appNewsType:o.appNewsType,
		      isShow:o.isShow,
			  writeTime: moment(o.writeTime).format('YYYY年MM月DD日')
			})
		})

		res.render('serviceNewsList.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':tempList,
			'title':'最新活动',
			'type':'act'
		})
		return;
	})

}



obj.newsDetail = function(req,res){ //共用新闻详细页
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;
	var newsId = req.query.newsId;
	var type = req.query.backtype;
	var backUrl = req.query.backUrl || '/';



	if(newsId && newsId.length !== 24){
		return res.send(500,'错误参数newsId')
	}

	if(type == 'prom'){
		backUrl = '/view/service/copromotion?wxuserid='+userId
	}
	else if(type == 'act'){
		backUrl = '/view/service/coact?wxuserid='+userId
	}
	else{
		backUrl = '/view/service/newsall?wxuserid='+userId
	}

	infoBl.getNewsDetail(newsId, function(err,doc){
		if(err){
			logger.error('obj.newsDetail infoBl.getNewsDetail error, newsId %s, err %s', newsId, err);
			return res.send(500,'新闻页面加载失败')
		}

		res.render('serviceNewsDetail.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'doc':{
			  _id:doc._id,
			  appId:doc.appId,    			  //应用id
		      coId:doc.coId,
		      appNewsTitle:doc.appNewsTitle,
		      appNewsContent:doc.appNewsContent,
		      appNewsPicture:doc.appNewsPicture.split(','),
		      appNewsType:doc.appNewsType,
		      isShow:doc.isShow,
			  writeTime: moment(doc.writeTime).format('YYYY年MM月DD日')
			},
			'backUrl':backUrl,
		})
		return;
	})

}






module.exports = obj;