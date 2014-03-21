var log4js = require('log4js');
var path = require('path');
var mongoose = require('mongoose');
var config = require('../config/config.js');
var utils = require('./utils.js');
var checkSign = require('./sign.js');
var DEFAULT_HANDLER = function(req,res,next){next()};
var DEFAULT_ERROR = function(req,res,next){res.send(500)};
var INTERAL_ERROR = 'widget server error';
var init={};

init.initLog4js = function(widget, app){//初始化日志模块
	log4js.configure({
		  appenders: [
		    { type: 'console' },
		    { type: 'file', filename: path.join(__dirname,'..','logs/log_'+process.pid), maxLogSize:1024*50, "backups": 10,category: 'cheese' }
		  ]
	});
	widget.logger = log4js.getLogger('cheese');
	widget.logger.info("init log4js at "+(new Date()));
	return init;
}

init.mongoose = function(widget, app){//初始化mongoose
	widget.db = widget.db || {};
	widget.db.mongoose = mongoose;
	widget.db.mongodbConnStr = config.mongodbConnStr;
	widget.db.monoosePool = config.monoosePool;
	widget.db.mongoose.connect(widget.db.mongodbConnStr,{server:{poolSize:widget.db.monoosePool}});	
	widget.dl = widget.dl || {};
	widget.dl.clientDl = require('../dl/clientDl')(widget);//初始化clientDl
	widget.dl.guidDl = require('../dl/guidDl')(widget);//初始化clientD

	widget.dl.guidDl.findOneGuid(function(err,doc){//初始化全局id
		if(err){
			console.err('guid count err: '+err);
			process.exit()
		}
		if(doc && doc._id){
			widget.guidDocId = doc._id;
			return;
		} 

		widget.dl.guidDl.saveGuid(function(err,doc){
			if(err){
				console.error('guid save err: '+err);
				process.exit()
			}
			widget.guidDocId = doc._id;
			console.log(doc)
		})
	})

	return init;
}

init.project = function(widget, app){//初始化其他的一些东西
	widget.utils = utils; //初始化工具函数
	widget.noop = function(){};
	widget.listenPort = config.listenPort;
	widget.errorResponse = function(res, err, errmsg){ //默认出错处理
		res.send(500, widget.genJson(500, errmsg))
		widget.logger.error(err);
	}

	widget.genJson = function(errCode, obj){
		var errCode = !errCode ? null : errCode;
		var obj = !obj ? INTERAL_ERROR : obj;
		return {"err":errCode, "data":obj};
	}

	widget.middleHandler = function(req, res, next){//V1接口版本的拦截
		req.widget = res.widget = widget;//将widget作为参数传入
		var qObj = req.query || {};
		var bObj = req.body || {};
		req.params = widget.utils.merge(qObj, bObj) || {};
		checkSign(req, res, function(err){
			if(err) return res.send(err.status, widget.genJson(err.code, err.msg));
			next()
		})
		 //拦截器，判断签名是否正确
	}

	widget.getGuid = function(cb){ //获得并+1全局id
		var cb = cb || widget.noop;
		widget.dl.guidDl.findAndUpdateGuid(widget.guidDocId, cb);
	}

	widget.getGuid2 = function(cb){ //获得并+1全局id2
		var cb = cb || widget.noop;
		widget.dl.guidDl.findAndUpdateGuid2(widget.guidDocId, cb);
	}

	return init;
}

init.signHandler = function(widget, app){//初始化签名拦截
	

	app.all('/v1/*', widget.middleHandler, function(req,res){
		console.log(req.url)
		res.json(widget.genJson(null, "widget server"));
	});

	return init
}

init.widgethandler = function(widget, app){//初始化路由模块

	config.widgets.forEach(function(v,i){
		try{//根据config中的模块依次加载组建
			var widgetModule = require('../widget/'+v);
			var widgetIns = widgetModule.v1.init(widget, app);//获得组建实例
			widgetIns.handler.forEach(function(v,i){
				app[v.method]('/v1'+v.url, widget.middleHandler, v.middle||DEFAULT_HANDLER, v.handler||DEFAULT_ERROR);
			});
		}
		catch(e){
			widget.logger.error(e);
		}
	})

	return init;
}

init.init = function(widget, app){//初始化函数
	var Widget = widget;
	init.initLog4js(widget, app)
		.mongoose(widget, app)
		.project(widget, app)
		.widgethandler(widget, app)
		.signHandler(widget, app);

	return app;
}


module.exports = init;