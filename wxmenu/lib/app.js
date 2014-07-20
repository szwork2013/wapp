var widget = {};

var logger = require('./log.js');
var path = require('path');
var ifile = require('ifile');
var express = require('express');
var app = express();
var config = require('../config/config.js');
var addRoute = require('./route.js');


//使用客户端cookie
var cs = require('client-session');
var clientSession = cs('wxwujbnet',{
	maxAge:24*3600*7
});

app.enable('trust proxy');
app.set('x-powered-by', 'openresty');
app.set('views', path.join(__dirname,'..','template'));
app.set('view engine', 'ejs');



app.use(express.cookieParser());
app.use(express.session({secret: 'wxapp', cookie: {maxAge: 60000}}));
app.use(clientSession.connect());

/*
app.use(ifile.connect(
	[
		['/static',path.join(__dirname,'..')],
		['/upload',path.join(__dirname,'..')]
	]
));
*/
app.use('/static', express.static(path.join(__dirname,'..','static')));
app.use('/upload', express.static(path.join(__dirname,'..','upload')));

app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));


app.use(express.query());


addRoute(app);//增加路由配置

app.listen(config.listenPort);

logger.info('server start on ' + config.listenPort);