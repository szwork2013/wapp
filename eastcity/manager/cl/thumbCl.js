var fs = require('fs');
var path = require('path');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');
var uploadPath = path.join(__dirname,'..','..','upload');

obj.read = function(req, res){

	fs.readdir(uploadPath, function(err,list){
		if(err) {
			return res.send(err,500);
		}

		var templist = [];
		list.forEach(function(o){
			if(fs.statSync(path.join(uploadPath, o)).isFile()){
				templist.push({
					name: o,
					size: 0,
					type: "f"
				})
			}
		})
		res.json(templist);
	})
}


obj.destroy = function(req, res){
	//console.log(req.body)
	var fname = req.body.name;
	fs.unlink(path.join(uploadPath, fname), function(err){
			if(err) return res.send(err,500);
			res.json([])
	})
}

obj.create = function(req, res){
	var name = req.body.name;
	fs.mkdir(path.join(uploadPath,name), function(err){
		if(err) return res.send(err,500);
		return res.json({
			name: name,
			size:0,
			"type":"d"
		})
	})
}


obj.upload = function(req, res){
	//console.log(req.files)
	if(req.files && req.files.file && req.files.file.path){

		var fileName = path.basename(req.files.file.path); //获取文件名

		return res.json({
			name: fileName,
			size:0,
			"type":"f"
		})
	}
	else{
		return res.send(500);
	}
}

module.exports = obj;