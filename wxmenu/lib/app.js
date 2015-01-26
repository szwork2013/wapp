console.log('123123123')
console.log(process.argv)
console.log('123123123')




var widget = {};
var newrelic = require('newrelic');
var logger = require('./log.js');
var path = require('path');
var express = require('express');
var app = express();
var config = require('../config/config.js');
var addRoute = require('./route.js');
var MongoStore = require('connect-mongo')(express);


app.enable('trust proxy');
app.set('x-powered-by', 'openresty');
app.set('views', path.join(__dirname,'..','template'));
app.set('view engine', 'ejs');
app.locals.newrelic = newrelic;

app.use(express.cookieParser());
//app.use(express.session({path: '/', key:'wx_session', secret: 'wxapp', cookie: {maxAge: 1000*60*10}}));
app.use(express.session(
	{
		path: '/', 
		key:'wx_session', 
		secret: 'wxapp', 
		cookie: {maxAge: 1000*60*60*24},
		store:new MongoStore({url:config.mongodbConnStr})
	}
	));

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



var portPos = process.argv.indexOf('-p')
if(portPos>=0){
	var argsListenPort = process.execArgv[portPos+1] - 0
	if(!argsListenPort){
		console.log('args argsListenPort is not defined')
		return
	}
	else{
		app.listen(argsListenPort);
	}
}
else{
	app.listen(config.listenPort);
}


logger.info('server start on %s', config.listenPort);
