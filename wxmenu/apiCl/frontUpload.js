var voteBl = require('../bl/wxVote.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var qiniu = require('qiniu');
var config = require('../config/config.js');
var fs = require('fs')
var obj = {}

qiniu.conf.ACCESS_KEY = config.QINIU_ACCESS_KEY
qiniu.conf.SECRET_KEY = config.QINIU_SECRET_KEY

var allowExtraName = ['png', 'jpg', 'gif']

obj.delFile = function(filePath){
	fs.unlink(filePath, function(err){
		if(err){
			logger.error('delfile error, file path: %s, error: %s', filePath, err)			
		}
	})

}

obj.uploadToQiniu = function(fileSavePath, folder, cb){


	fs.stat(fileSavePath, function(err, fileStat){
			if(err){
				obj.delFile(fileSavePath)
				return cb({
					result: '0',
					error:'上传失败请重试'
				})
			}

			var size = fileStat.size
			if(size > 1024*1024){
				obj.delFile(fileSavePath)
				return cb({
					result: '0',
					error:'上传失败，文件过大'
				})
			}
			//将图片上传到七牛
			var putPolicy = new qiniu.rs.PutPolicy(bucketname);
			var upToken = putPolicy.token();
			var extra = new qiniu.io.PutExtra();

			qiniu.io.putFile(upToken, folder, fileSavePath, extra, function(err, ret){
				obj.delFile(fileSavePath)
			    if(err) {
			      logger.error('qiniu upload error, file path: %s, error: %s', fileSavePath, err)
			      return cb({
						result: '0',
						error:'上传失败，请重试'
				  })
			      // 上传成功， 处理返回值
			      //console.log(ret.key, ret.hash);
			      // ret.key & ret.hash
			      console.log(ret)
			   	  return cb({
						result: '1xxxx'
				  })
			   	}
			  })//end qiniu.io.putFile

		})//end fs.stat


}



obj.frontUpload = function(req,res){
	//前端上传
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	var userid = req.session[appEname+'_userid'];
	//如果用户身份丢失
	if(!userid){
		res.json({
			result: '0',
			error:'身份丢失'
		})
		return;
	}

	var folder = req.body.type || 'other'


	//console.log(req.files)
	if(req.files && req.files.upload_file && req.files.upload_file.path){

		var fileName = path.basename(req.files.upload_file.path); //获取文件名
		var fileSavePath = req.files.upload_file.path;

		if(allowExtraName.indexOf(fileName) == -1){
			obj.delFile(fileSavePath)
			return res.json({
					result: '0',
					error:'上传格式需为 '+JSON.stringify(allowExtraName)
				})
		}
		//保存到七牛
		obj.uploadToQiniu(fileSavePath, folder, function(result){
				res.json(result)
		})//end obj.uploadToQiniu

		
	}
	else{
		res.json({
			result: '0',
			error:'上传失败请重试'
		})
	}
	
}


//将用户的图片上传到指定候选人
obj.uploadToVoteItem = function(req, res){

	//前端上传
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	var userid = req.session[appEname+'_userid'];
	//如果用户身份丢失
	if(!userid){
		return res.send({error:1,data:'身份丢失'})
	}


	var groupEname = req.body.groupEname
	var itemName = req.body.itemName
	var itemMobile = req.body.itemMobile
	var itemPicUrl = req.body.itemPicUrl
	var desc = req.body.desc


	if(!groupEname){
		return res.send({error:1,data:'groupEname 参数无效'})
	}
	if(!itemName){
		return res.send({error:1,data:'itemName 参数无效'})
	}
	if(!itemMobile){
		return res.send({error:1,data:'itemMobile 参数无效'})
	}
	if(!itemPicUrl){
		return res.send({error:1,data:'itemPicUrl 参数无效'})
	}
	if(desc>10){
		return res.send({error:1,data:'desc 太长'})
	}

	voteBl.getGroupByEname(groupEname, function(err, groupItem){
		if(err){
			return res.send({error:1, data:err})
		}
		if(!groupItem){
			return res.send({error:1, data:'没找到分组'})
		}
		if(groupItem.isFrontUpload != 1){
			return res.send({error:1, data:'不允许前端上传'})
		}
		if(groupItem.isFreez == 1){
			return res.send({error:1, data:'此分组操作被停用'})
		}

		var groupId = groupItem._id.toString()
		var voteId = groupItem.voteId
		var appId = groupItem.appId


		voteBl.getUserUploadItem(userid, groupId, function(err, itemList){
			if(err){
				return res.send({error:1, data:err})
			}
			if(itemList.length > 0){
				return res.send('对不起，您已经上传过了')
			}

			//保存流水
			var saveObj = {
				'appId':appId,
				'voteId':voteId,
				'groupId':groupId,
				'title':itemName,
				'pictureThumb':itemPicUrl,
				'picture':itemPicUrl,
				'number':itemMobile,
				'desc':desc,
				'code4':userid,
				'writeTime':new Date(),
			}

			voteBl.frontSaveVoteItem({'_id':-1}, saveObj, function(err, item){
				if(err){
					return res.send({error:1, data:err})
				}
				return res.send({error:0, data:'ok'})

			})//end voteBl.frontSaveVoteItem

		})//end voteBl.getUserUploadItem

	})//end voteBl.getGroupByEname


}



//获取用户id参与上传的投票项
obj.myItem = function(req, res){
	var userId = req.query.userId
	var groupEname = req.query.groupEname


	voteBl.getGroupByEname(groupEname, function(err, groupItem){
		if(err){
			return res.send({error:1, data:err})
		}
		if(!groupItem){
			return res.send({error:1, data:'没找到分组'})
		}

		var groupId = groupItem._id.toString()


		voteBl.getUserUploadItem(userId, groupId, function(err, itemList){
			if(err){
				return res.send({error:1, data:err})
			}

			return res.send({error:0, data:itemList})
		})

	})
}





module.exports = obj;