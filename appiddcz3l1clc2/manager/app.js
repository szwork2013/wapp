var express = require('express');
var path = require('path');
var app = express();
var config = require('../config/config.js');
global.app = app;
app.set('widgetadmin', 'widgetadmin');
app.set('salt', 'widgetServer');
app.set('views', __dirname + '/static');
app.set('view engine', 'ejs');

app.use('/m_skin', express.static(__dirname + '/static/m_skin'));
app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));
app.use(express.cookieParser());
app.use(express.cookieSession({key:"manager", secret: 'widgetManager', cookie: { maxAge: 60 * 60 * 1000 }}));
require('./route.js')(app);

app.listen(config.mangerListenPort);
console.log('server start on ' + config.mangerListenPort)