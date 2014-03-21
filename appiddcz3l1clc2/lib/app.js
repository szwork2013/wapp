var widget = {};
var init = require('./init.js').init;
var path = require('path');
var express = require('express');
var app = express();
var config = require('../config/config.js');
global._widget = widget;//将global设置为全剧变量
global._widget.app = app;

app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));

init(widget,app).listen(config.listenPort);

widget.logger.info('server start on ' + config.listenPort)