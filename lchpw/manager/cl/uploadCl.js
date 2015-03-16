var fs = require('fs');
var path = require('path');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.save = function(req, res){
	//console.log(req.files)
	if(req.files && req.files.upload_file && req.files.upload_file.path){

		var fileName = path.basename(req.files.upload_file.path); //获取文件名

		return res.json({
			result: '/upload/'+fileName
		})
	}
	else{
		res.send(500)
	}
}


obj.remove = function(req, res){
	//console.log(req.body)
	res.json({})
}

module.exports = obj;