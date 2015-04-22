var userModel = require('../dl/userModel.js'); //加载用户模型

var userAppModel = require('../dl/userAppModel.js'); //加载用户帮顶关系模型
var guidModel = require('../dl/guidModel.js');
var starLogModel = require('../dl/starLogModel.js'); //打分的流水

var fs = require('fs');
var path = require('path')
var iconv = require('iconv-lite');
var moment = require('moment');
var json2csv = require('json2csv');
var utils = require('../lib/utils.js');
var config = require('../config/config.js');
var nodemailer = require("nodemailer");


var obj = {}


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport({
    service: "QQ",
    auth: {
        user: config.MAIL_ACC,
        pass: config.MAIL_PWD
    }
});

console.log(config.MAIL_ACC)
console.log(config.MAIL_PWD)

obj.getUserByOpenid = function(openId,cb){ //根据openid查找用户信息
	var cb = cb || function(){}
	if(!openId) return cb('no openid');
	//obj.getUser({openId:openId},cb);
	userAppModel.findOneByObj({
		openId:openId
	},function(err,appUDoc){
		if(err) return cb(err); //如果出错
		if(!appUDoc){
			return cb(null, null)
		}
		var userId = appUDoc.userId;
		obj.getUserByUserId(userId,cb)
	})

}


obj.getUserByUserId = function(userId,cb){ //根据用户id查找用户信息
	var cb = cb || function(){}
	if(!userId) return cb('no userId');
	obj.getUser({_id:userId},cb);
}

obj.getUser = function(qobj,cb){
	userModel.findOneByObj(qobj,function(err,udoc){
		if(err) return cb(err); //如果出错
		if(!udoc) return cb(null,null); //如果没找到用户
		if(udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		var userId = udoc._id;

		userAppModel.findByObj({
			"userId":userId
		},function(err,bindDoc){
			if(err) return cb(err);
			//udoc.bind = bindDoc||[];
			cb(null, {
				uobj:udoc,
				bind:bindDoc || []
			});
		})

	})
}

obj.getUserType = function(udoc,appId){
	if(!udoc.bind || udoc.bind.length == 0) return 0;

	for(var i=0; i<udoc.bind.length; i++){
		if(udoc.bind[i].appId == appId){
			return udoc.bind[i].appUserType;
		}
	}
	return 0
}


obj.enter = function(openId,appId,cb){ //用户进入
	var cb = cb || function(){}
	if(!openId) return cb('no openId');
	obj.getUserByOpenid(openId,function(err,udoc){
		if(err) return cb(err);
		if(udoc && udoc.isShow == 0) return cb('用户已被锁定',null); //如果用户已经被屏蔽
		if(udoc) return cb(null,udoc);
		
		guidModel.getGuid(function(err,guid){
			userModel.insertOneByObj({
				appId:appId,
				appUserMobile:'__'+guid
			},function(err,udoc2){
				if(err) return cb(err);

				userAppModel.insertOneByObj({
					userId:udoc2._id,
					openId:openId,
					appId:appId,
				},function(err,appUDoc){
					if(err) return cb(err);
					cb(null, {
						uobj:udoc2
					});
				})			
			})
		})
	})
}


obj.getUserByIds = function(uidList, cb){

	userModel.getUserByIds(uidList,function(err,list){
		if(err || list.length == 0){
			return cb(err,list)
		}
		cb(null, list)

	})
}


obj.modify = function(userId, openId, qobj,cb){//修改用户资料
	if(!userId){
		return cb('缺少 userid')
	}
	// if(!openId){
	// 	return cb('缺少 openId')
	// }

	var appMObj = {}
	if(qobj.appUserCommunity){
		appMObj.appUserCommunity = qobj.appUserCommunity
	}
	if(qobj.appUserBuilding){
		appMObj.appUserBuilding = qobj.appUserBuilding
	}
	if(qobj.appUserRoom){
		appMObj.appUserRoom = qobj.appUserRoom
	}

	var userMObj = {}
	if(qobj.appUserName){
		userMObj.appUserName = qobj.appUserName
	}
	if(qobj.appUserSex){
		userMObj.appUserSex = qobj.appUserSex
	}
	if(qobj.appUserBirth){
		userMObj.appUserBirth = qobj.appUserBirth
	}
	if(qobj.appUserMobile){
		userMObj.appUserMobile = qobj.appUserMobile
	}


	if(qobj.appUserCode){
		userMObj.appUserCode = qobj.appUserCode
	}
	if(qobj.appSmsCode){
		userMObj.appSmsCode = qobj.appSmsCode
	}
	if(qobj.appUserType){
		userMObj.appUserType = qobj.appUserType
	}
	if(qobj.code1){
		userMObj.code1 = qobj.code1
	}
	else{
		userMObj.code1 = Date.now() + '' + Math.random()
	}

	if(qobj.code2){
		userMObj.code2 = qobj.code2
	}


	//console.log(appMObj)

	/*
	userAppModel.createOneOrUpdate({
			userId:userId,
			openId:openId,
		},qobj,function(err,doc2){
			if(err) return cb(err);
	*/

	userModel.countAll({
		'code1': qobj.code1 || '-1'
	}, function(err, countYwy){
		if(err){
			//logger.error('wxuser.modify userModel.createOneOrUpdate error: %s', err);
			return cb(err);
		} 
		if(userMObj.appUserType && userMObj.appUserType == 2 && countYwy > 0){
			return cb('工号已经存在')
		}

		userMObj.appUserScore = 0;
		userModel.createOneOrUpdate({
				_id:userId
			},userMObj, function(err,doc){
				//出错一般是工号存在
				if(err){
					//logger.error('wxuser.modify userModel.createOneOrUpdate error: %s', err);
					return cb(err);
				} 
				cb(null,{
					'userObj':doc
					//'binderObj':doc2
				})//end cb		
		})//end userModel.createOneOrUpdate


	})
			
	//	})// end userAppModel.createOneOrUpdate 
}




//获得我的打分流水
obj.getMyStarLog = function(userId, toUserId, cb){

	starLogModel.findByObj({'fromUserId':userId, 'toUserId':toUserId}, function(err, docList){
		if(err) return cb(err)
		return cb(null, docList)
	})
}



obj.getAvgScore = function(userId, cb){

	userModel.findOneByObj({
		_id:userId
		},function(err,udoc){
		if(err) return cb(err)
		starLogModel.countAll({
			'toUserId':userId
		}, function(err, count){
			if(err) return cb(err)
			if(count==0) return cb(null, 0)
			var avg = udoc.appUserScore/count
			return cb(null, avg)
		})
	})

	

}


//处理打分
obj.dealStar = function(userId, toUserId, score, ip, cb){

	obj.getMyStarLog(userId, toUserId, function(err, docList){
		//console.log(err,docList)
		if(err){
			return cb(err)
		}
		if(docList.length > 0){
			return cb('不能重复打分')
		}

		starLogModel.insertOneByObj({
			toUserId:toUserId,
			fromUserId:userId,
			logIp:ip,
			starScore:score,
		},function(err, doc){
			//console.log(err,doc)
			if(err){
				return cb(err)
			}

			//然后给业务员打分，免去每次都groupby操作
			userModel.createOneOrUpdate({
				_id:toUserId
			}, {
				'$inc':{
					'appUserScore':score
				}
			}, function(err, doc){
				if(err) return cb(err)
				return cb(null, doc)
			}) // end userModel.createOneOrUpdate

			
		})//end starLogModel.insertOneByObj


	})//end obj.getMyStarLog


}


//获取当天的业务员注册excel表格
obj.getTodayYwyRegAndMail = function(dayMoment, endMoment){
	if(!dayMoment){
		var dayMoment = moment().hour(0).minute(0).second(0)
	}
	if(!endMoment){
		var endMoment = moment().hour(23).minute(59).second(59) 
	}
	var result = []
	//获取当天的业务员信息
	userModel.findAll({
		'appUserType':2,
		'writeTime':{
			'$gte':dayMoment,
			'$lt':endMoment
		}
	},0,10000,function(err, list){
		if(err){
			logger.error('obj.getTodayYwyRegAndMail userModel.findAll got  error: %s', err);
			return
		}

		//var iconv = new Iconv('UTF-8', 'GBK');
		list.forEach(function(item){

			result.push({
				//'name':iconv.convert(item.appUserName.toString()),
				'name':item.appUserName+'',
				'mobile':item.appUserMobile+'',
				'gh':'gh '+item.code1,
				'wx':item.code2+'',
				'writeTime':moment(item.writeTime).format('YYYY/MM/DD HH:mm:ss')+''
			})
		})

		//console.log(result)

		if(result.length == 0){
			obj.mailTo(0, false)
			return
		}
		json2csv({data: result, fields: Object.keys(result[0] || {})}, function(err, csv) {
			  if(err){
					logger.error('obj.getTodayYwyRegAndMail json2csv got error: %s', err);
					return
				}
			  var saveExcelPath = path.join(__dirname,'..','upload')
			  var excelName = dayMoment.format('YYYY-MM-DD') + '_list.csv'
			  var excelPath =  path.join(saveExcelPath, excelName)
			  try{
			  	//var buf = iconv.convert()
			  	var buf = iconv.encode(csv, 'gbk');
			  }
			  catch(e){
			  	logger.error('obj.getTodayYwyRegAndMail  iconv.convert got error: %s', e);
			  	return
			  }
			  
			  fs.writeFile(excelPath, buf, function (err) {
				  if(err){
						logger.error('obj.getTodayYwyRegAndMail fs.writeFile got error: %s', err);
						return
					}
				  //console.log('It\'s saved!');
				  obj.mailTo(result.length, excelPath, excelName)
				});
			  return
		});


	})

}


obj.mailTo = function(resultLength, excelPath, filename){


	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: "wuzh <"+config.MAIL_ACC+">", // sender address
	    to: "53822985@qq.com,", // list of receivers
	    subject: "合众业务员注册数", // Subject line
	    //text: string, // plaintext body
	    html: "当天共有 "+resultLength+" 业务员注册成功。</b>" // html body
	}

	if(excelPath){
		//发送附件
		mailOptions.attachments = [
			{
				filename: filename,
				content: fs.createReadStream(excelPath)
			}
		]
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, info){
		
		if(error){
			logger.error('smtpTransport.sendMail got error: %s', error);
			
		}else{
        	console.log('Message sent: ' + info.response);
   		}
	   	smtpTransport.close();
	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});

}

/*
setTimeout(function(){
	var s = moment('2015/4/21').hour(0).minute(0).second(0)
	var e = moment('2015/4/21').hour(18).minute(0).second(0)
	obj.getTodayYwyRegAndMail(s, e)
},2000)
*/


//定义定时器
obj.setSchedule = function(){
	//定义规则
	var rule = new node_schedule.RecurrenceRule();
	rule.dayOfWeek = [new node_schedule.Range(0, 6)];
	rule.hour = 11;
	rule.minute = 45;

	var s = moment().day(-1).hour(18).minute(0).second(0)
	var e = moment().hour(18).minute(0).second(0)

	var j = node_schedule.scheduleJob(rule, function(){
			//执行定时计划
		   obj.getTodayYwyRegAndMail(s, e)
	});
	//马上执行一次
	obj.getTodayYwyRegAndMail(s, e)
}

//只有一个
if(global.listenPort == 7900){
	obj.setSchedule()
}

module.exports = obj;