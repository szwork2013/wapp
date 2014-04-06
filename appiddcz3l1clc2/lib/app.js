var widget = {};
var logger = require('./log.js')
var init = require('./init.js').init;
var path = require('path');
var express = require('express');
var app = express();
var config = require('../config/config.js');
var addRoute = require('./route.js')

app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));

addRoute(app);//增加路由配置

app.listen(config.listenPort);



logger.info('server start on ' + config.listenPort)