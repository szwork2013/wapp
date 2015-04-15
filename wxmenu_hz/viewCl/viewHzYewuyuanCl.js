var userBl = require('../bl/wxUser.js');
var lotteryBl = require('../bl/wxLottery.js');
var utils = require('../lib/utils.js');
var yewuyuan = require('../tools/hz_yewuyuan.js')

var moment = require('moment')
var obj = {}





//业务员名片的页面
obj.hzyewuyuan_mingpian = function(req,res){ 
	var workNum = req.query['worknum']


	res.set('Cache-Control', 'no-cache')
    res.set('ETag', Date.now().toString())
    var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;

	var wxuobj = req.wxuobj;

	var lotteryEname = req.query.ename;
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}

	var appEname = appobj.data;
	//如果是本地开发环境
    if(platForm == 'win32'){
		req.session[appEname+'_userid'] = '53ecc71816eafb68369b4920'
	}
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}

	if(!appEname){
		return res.send(404)
	}

	var lotteryEname = 'hz_mingpian'
	//获取抽奖的详细信息
	lotteryBl.getLotteryByEname(lotteryEname, function(err, lotteryObj){
		if(err){
			return res.send(err)
		}
		if(!lotteryObj){
			return res.send('未找到抽奖活动')
		}

		appBl.getByEname(appEname,function(err,appObj){
			if(err){
				return res.send(err)
			}
			if(!appObj){
				return res.send(404)
			}

			var timeError = 0
			var now = moment()
			var startTime = moment(lotteryObj.startTime)
			var endTime = moment(lotteryObj.endTime)
			if(now<startTime || now>endTime){
				timeError = 1
			}

			//表示进入的是业主名片页面
			if(workNum){

				//获取他的平均计数
				userBl.getAvgScore(userId, function(err, avgScore){
					if(err) return res.send(err)

					var yewuyuanResult = yewuyuan.get_yewuyuan(workNum)
						if(!yewuyuanResult){
							return res.send('未找到工号，请检查工号是否输入有误')
						}

						//如果是第二次进入
						if(wxuobj.appUserType == 2){
							res.render('hz_mingpian.ejs', {
									lotteryObj:lotteryObj,
									lotteryEname:lotteryEname,
									appEname:appEname,
									appId:appObj._id,
									userid:userid,
									toUserId:userid,
									wxuobj:wxuobj,
									isYewuyuan:true,
									timeError:timeError,
									avgScore:avgScore,
									workNum:yewuyuanResult.workNum,
									jsurl:encodeURIComponent(requestedUrl)
								});
							return;
						}

						
						//如果是第一次进入
						userBl.modify(userId, null, {
							'appUserSex':yewuyuanResult.appUserSex,
							'appUserName':yewuyuanResult.appUserName,
							'appUserMobile':yewuyuanResult.appUserMobile,
							'appUserType':2,
						}, function(err){
							if(err) return res.send(err)
							
							res.render('lottery/'+lotteryEname+'.ejs', {
								lotteryObj:lotteryObj,
								lotteryEname:hz_lotteryName,
								appEname:appEname,
								appId:appObj._id,
								userid:userid,
								toUserId:userid,
								isYewuyuan:true,
								wxuobj:wxuobj,
								timeError:timeError,
								avgScore:0,
								workNum:yewuyuanResult.workNum,
								jsurl:encodeURIComponent(requestedUrl)
							});


						})//end userBl.modify


				})//end userBl.getAvgScore
				

			}
			else{
			//表示进入的是分享页面
				var toUserId = req.query.touserid
				if(!toUserId){
					return res.send('无效的 toUserId')
				}

				//获取他的平均计数
				userBl.getAvgScore(toUserId, function(err, avgScore){

					res.render('lottery/'+lotteryEname+'.ejs', {
							lotteryObj:lotteryObj,
							lotteryEname:hz_lotteryName,
							appEname:appEname,
							appId:appObj._id,
							toUserId:toUserId,
							userid:userid,
							isYewuyuan:false,
							wxuobj:wxuobj,
							timeError:timeError,
							avgScore:avgScore,
							jsurl:encodeURIComponent(requestedUrl)
						});

				})//end userBl.getAvgScore

			}//end else

		})//end appBl.getByEname

	})//end lotteryBl.getLotteryByEname
	
}


//ajax打分，打星星
obj.hzstar = function(req,res){ 
	var wxuobj = req.wxuobj;
	var userId = req.wxuobj._id;
	var appId = req.wxuobj.appId;
	var toUserId = req.query.touserid
	var score = req.query.score
	var ip = req.ips[0] || '127.0.0.1'
	
	if(!toUserId){
			return res.send({error:1,data:'无效的 toUserId'}) 
	}
	if(!score || score != parseInt(score) || parseInt(score) <= 0|| parseInt(score) > 3){
		return res.send({error:1,data:'无效的 score'}) 
	}

	//数据检查是否存在


	userBl.dealStar(userId, toUserId, score, ip,  function(err, doc){
			if(err){
				return res.send({error:1,data:err}) 
			}
			return res.send({error:0,data:'ok'})
	})


}


module.exports = obj;