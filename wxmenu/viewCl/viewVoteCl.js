var utils = require('../lib/utils.js');
var voteBl = require('../bl/wxVote.js');
var appBl = require('../bl/wxApp.js');
var os = require('os')
var platForm = os.platform()
var obj = {}


obj.votePage = function(req,res){ //活动页面展示
	var wxuobj = req.wxuobj;
	var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;
	
	var ename = req.query.ename;
	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}

	var appEname = appobj.data;

	//测试用，正式环境需注释
	if(platForm == 'win32' || req.query.jkbuserid && req.query.jkbuserid.length == 24){
		req.session[appEname+'_userid'] = '53ecb609e00fd324efd7302d'
	}
	

	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}

	if(!appEname){
		return res.send(404)
	}

	//先去查找抽奖活动记录
	voteBl.getVoteByEname(ename,function(err,voteObj){
		if(err){
			return res.send(500, err)
		}
		if(!voteObj){
			return res.send(404)
		}

		appBl.getByEname(appEname,function(err,appObj){
			if(err){
				return res.send(500, err)
			}
			if(!appObj){
				return res.send(404)
			}

			var voteid = voteObj._id.toString()
			voteBl.getGroupByVoteId(voteid, function(err, groupList){
				if(err){
					return res.send(500, err)
				}

				var lastTimeStamp = moment().add(-1, 'days').hour(0).minute(0).second(0).millisecond(0);
				lastTimeStamp = lastTimeStamp.unix()*1000;
				voteBl.getGroupCountByVoteId(voteid, lastTimeStamp, function(err, groupCountList){
						if(err){
							return res.send(500, err)
						}
						//拼接投票分组count数组
						var tempGroupList = [];
						groupList.forEach(function(groupObj){
							groupCountList.forEach(function(groupCountObj){
								if(groupObj._id.toString() == groupCountObj.groupid){
									tempGroupList.push({
										_id:groupCountObj.groupid,
										count:groupCountObj.count,
										ename:groupObj.ename,
										title:groupObj.title,
										isFreez:groupObj.isFreez,
										code1:groupObj.code1,
										code2:groupObj.code2,
										code3:groupObj.code3,
										code4:groupObj.code4
									})
								}
							})
						})

						tempGroupList = tempGroupList.sort(function(a,b){
							return b.count - a.count
						})

						
						var timeError = 0
						var now = moment()
						var startTime = moment(voteObj.startTime)
						var endTime = moment(voteObj.endTime)
						if(now<startTime || now>endTime){
							timeError = 1
						}
						
						res.render('vote/'+ename+'.ejs', {
							voteObj:voteObj,
							ename:ename,
							appEname:appEname,
							appId:appObj._id,
							userid:userid,
							groupList:tempGroupList,
							wxuobj:wxuobj,
							'jsurl':encodeURIComponent(requestedUrl),
							timeError:timeError
						});

				})//end voteBl.getGroupCountByVoteId

			})//end voteBl.getGroupByVoteId

		})//end appBl.getByEname

	})//end voteBl.getVoteByEname

	

	

	
}


module.exports = obj;