var express = require('express');
var ifile = require('ifile');
var path = require('path');
var app = express();
var config = require('../config/config.js');
global.app = app;
app.set('widgetadmin', 'widgetadmin');
app.set('salt', 'wxapp');
app.set('views', __dirname + '/static');
app.set('view engine', 'ejs');

app.use(ifile.connect(
	[
		['/m_skin',path.join(__dirname,'static')],
		['/upload',path.join(__dirname,'..')]
	]
));


app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));
app.use(express.cookieParser());
app.use(express.cookieSession({key:"manager", secret: 'widgetManager', cookie: { maxAge: 60 * 60 * 1000 * 365 }}));
require('./route.js')(app);

app.listen(config.mangerListenPort);
console.log('server start on ' + config.mangerListenPort)