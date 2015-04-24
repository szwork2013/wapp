var voteBl = require('../bl/wxVote.js');
var userBl = require('../bl/wxUser.js');
var utils = require('../lib/utils.js');
var qiniu = require('qiniu');
var path = require('path')
var config = require('../config/config.js');
var fs = require('fs')
var obj = {}

qiniu.conf.ACCESS_KEY = config.QINIU_ACCESS_KEY
qiniu.conf.SECRET_KEY = config.QINIU_SECRET_KEY

var qiniuHost = 'http://7xinbw.com1.z0.glb.clouddn.com/'
var allowExtraName = ['png', 'jpg', 'gif']

obj.delFile = function(filePath){
	fs.unlink(filePath, function(err){
		if(err){
			logger.error('delfile error, file path: %s, error: %s', filePath, err)			
		}
	})

}

obj.uploadToQiniu = function(fileSavePath, folder, baseName, cb){


	fs.stat(fileSavePath, function(err, fileStat){
			//console.log(err, fileStat)
			if(err){
				logger.error('qiniu upload error, fs.stat(fileSavePath, file path: %s, error: %s', fileSavePath, JSON.stringify(err))
				obj.delFile(fileSavePath)
				return cb({
					result: '0',
					error:'上传到云端失败'
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
			var putPolicy = new qiniu.rs.PutPolicy(config.QINIU_BUCKET);
			var upToken = putPolicy.token();
			var extra = new qiniu.io.PutExtra();

			//console.log(folder, fileSavePath)
			var saveFileName = folder+'/'+baseName

			qiniu.io.putFile(upToken, saveFileName, fileSavePath, extra, function(err, ret){
				obj.delFile(fileSavePath)
			    if(err) {
			      try{
			      	logger.error('qiniu upload error, file path: %s, error: %s', fileSavePath, JSON.stringify(err))
			      }
			      catch(e){
			      	logger.error('qiniu upload error, file path: %s, error: %s', fileSavePath, err)
			      }
			      return cb({
						result: '0',
						error:'上传失败，请重试'
				  })
				}
			      // 上传成功， 处理返回值
			      //console.log(ret.key, ret.hash);
			      // ret.key & ret.hash
			      //console.log(ret)
			   	  return cb({
						result: qiniuHost+ret.key
				  })
			   	
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

	var folder = req.query.type || 'other'


	//console.log(req.files)
	//console.log(req.files.files.path)
	//console.log(req.files.files.originalFilename)


	if(req.files && req.files.files && req.files.files.path && req.files.files.originalFilename){

		var fileSavePath = req.files.files.path
		var fileName = path.basename(fileSavePath); //获取文件名
		var fileNameArray = fileName.split('.')
		var extraName = fileNameArray[fileNameArray.length -1]

		console.log(extraName)
		if(allowExtraName.indexOf(extraName) == -1){
			obj.delFile(fileSavePath)
			return res.json({
					result: '0',
					error:'上传格式需为 '+JSON.stringify(allowExtraName)
				})
		}
		//保存到七牛
		obj.uploadToQiniu(fileSavePath, folder, fileName, function(result){
				res.json(result)
		})//end obj.uploadToQiniu

		
	}
	else{
		res.json({
			result: '0',
			error:'上传失败请重试!'
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
	var age = req.body.age  || '1'
	var desc = req.body.title || ''
	var desc2 = req.body.desc2 || ''
	var _id = req.body._id || ''

	if(age != parseInt(age) || parseInt(age) >12 || parseInt(age) <1){
		return res.send({error:1,data:'age 参数无效'})
	}

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
	if(!desc){
		return res.send({error:1,data:'请输入标题'})
	}
	if(desc.length>10){
		return res.send({error:1,data:'标题过长'})
	}
	if(desc2.length>50){
		return res.send({error:1,data:'描述过长'})
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
				'pictureThumb':itemPicUrl+'_thumb', //七牛定义的_thumb为缩略图
				'picture':itemPicUrl,
				'number':itemMobile,
				'desc':desc,
				'age':age,
				'desc2':desc2,
				'code4':userid,
				'isShow':0,
				'writeTime':new Date(),
			}

		
			voteBl.frontSaveVoteItem({'_id':_id}, saveObj, function(err, item){
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
	//前端上传
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;

	var userid = req.session[appEname+'_userid'];

	var userId = req.query.userId
	var groupEname = req.query.groupEname

	if(!userId){
		userId = userid
	}


	if(!userId){
		return res.send({error:1, data:'userid参数错误'})
	}
	if(!groupEname){
		return res.send({error:1, data:'groupEname参数错误'})
	}

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
			var list = []
			itemList.forEach(function(item){
				list.push({
					'_id':item._id,
					'voteId':item.voteId,
					'groupId':item.groupId,
					'name':item.title,
					'pictureThumb':item.pictureThumb,
					'picture':item.picture,
					'number':item.number,
					'age':item.age,
					'title':item.desc,
					'desc2':item.desc2,
					'code4':item.code4,
					'isShow':item.isShow,
					'todayVoteNumber':item.todayVoteNumber,
					'writeTime':item.writeTime,

				})
			})
			return res.send({error:0, data:list})
		})

	})
}





module.exports = obj;