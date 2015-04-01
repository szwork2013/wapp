var express = require('express');
var path = require('path');

var fs = require('fs');
var path = require('path');
var app = express();
var config = require('../config/config.js');
global.app = app;
app.set('widgetadmin', 'widgetadmin');
app.set('salt', 'wxapp');
app.set('views', __dirname + '/static');
app.set('view engine', 'ejs');

/*app.use(ifile.connect(
	[
		['/m_skin',path.join(__dirname,'static')],
		['/upload',path.join(__dirname,'..')]
	]
));*/

var getThumbMid = function(req,res,next){
	var pathf = req.query.path;
	if(pathf){
		//console.log(pathf)
		var thumbPath =  path.join(__dirname,'..','upload',pathf);
		//console.log(thumbPath)
		fs.exists(thumbPath,function(exists){
			//console.log(exists)
			if(!exists) return res.send(404);
			fs.stat(thumbPath, function(err,stat){
				if(err) return res.send(404)
				if(stat.isFile()){
					return fs.createReadStream(thumbPath).pipe(res)
				}
				else{
					return res.send('ok')
				}
			})
						
			return;
		})		
		 
	}else{
		next();
	}


}

app.use('/m_skin', express.static(path.join(__dirname,'static','m_skin')));
app.use('/upload', getThumbMid)
app.use('/upload',express.static(path.join(__dirname,'..','upload')));

app.use(express.bodyParser(
	{ keepExtensions: true, uploadDir: path.join(__dirname,'..','/upload/')}
));
app.use(express.cookieParser());
app.use(express.cookieSession({path: '/', key:"manager", secret: 'widgetManager', cookie: { maxAge: 60 * 60 * 1000 * 365 }}));
require('./route.js')(app);

app.listen(config.mangerListenPort);
console.log('server start on ' + config.mangerListenPort)

//如果没有upload文件夹，则创建
var uploadPath = path.join(__dirname,'..','upload')
if(!fs.existsSync(uploadPath)){
	 fs.mkdirSync(uploadPath)
	 console.log('create folder '+uploadPath)
}