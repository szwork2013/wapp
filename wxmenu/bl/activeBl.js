var userBl = require('./wxUser.js');
var activeModel = require('../dl/appActiveModel.js');
var activeLogModel = require('../dl/appActiveLogModel.js');
var guidModel = require('../dl/guidModel.js');
var moment = require('moment');
var utils = require('../lib/utils.js');


var obj = {}


//根据活动的ename查找活动
obj.getActiveByEname = function(activeEname,cb){
	if(!activeEname){
		return cb('wrong activeEname')
	}
	activeModel.findOneByObj({
		ename:activeEname,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc) return cb('not found active')
		cb(null,doc);
	})


}

obj.getIfHasAdd = function(activeId, fromOpenid, toUserId, cb){ //根据openid查找用户信息

	activeLogModel.findOneByObj({
		fromOpenId:fromOpenid,
		toUserId:toUserId,
		activeId:activeId
	},function(err,doc){
		cb(err,doc)
	})

}


obj.getRankByActiveId = function(activeId, limit, cb){ //排名

	activeLogModel.getRankByActive(activeId,limit,function(err,list){
		//console.log(list)
		if(err) return cb(err);
		if(list.length == 0) return cb(null,[]);



		var uids = []
		list.forEach(function(o){
			uids.push(o._id)
		})
		userBl.getUserByIds(uids,function(err,ulist){
			if(err) return cb(err)
			if(ulist.length == 0){
				return cb('get user by ids error')
			}
			var tempList = []

			list.forEach(function(oActive){
				ulist.forEach(function(oUser){
					if(oActive._id == oUser.value){
						tempList.push({
							userId:oUser.value,
							supportCount:oActive.supportCount,
							userName:oUser.name,
							userMobile:oUser.mobile
						})
					}
				})
			}) //end uList foreach

			cb(null, tempList) //将列表返回出去

		})
	})

}


obj.getRankByEname = function(ename, limit, cb){ //排名,根据ename找

		obj.getActiveByEname(ename, function(err, aobj){
			if(err) return cb(err)
			if(!aobj) return cb('未找到活动')

			obj.getRankByActiveId(aobj._id, limit, cb)
		})

	}

obj.getCountByActiveIdAndToUserId = function(activeId, toUserId,cb){ //计算当前用户所有支持数
	
	activeLogModel.countAll({
		toUserId:toUserId,
		activeId:activeId
	},function(err,count){
		cb(err,count)
	})


}


//添加一条记录
obj.addSupport = function(activeId, fromOpenId, fromUserId, toUserId, cb){
	
	if(!activeId || activeId.length != 24){
		return cb('activeId 错误')
	}
	if(!fromUserId || fromUserId.length != 24){
		return cb('fromUserId 错误')
	}
	if(!toUserId || toUserId.length != 24){
		return cb('toUserId 错误')
	}

	activeModel.findOneByObj({
		_id:activeId,
		isShow:1
	},function(err,doc){
		if(err) return cb(err);
		if(!doc) return cb('没找到活动')


		userBl.getUserByOpenid(fromOpenId,function(err, uobj1){
			if(err) return cb(err);
			if(!uobj1) return cb('没找到访问用户')
			var uobj1 = uobj1.uobj
			//console.log(uobj1._id, fromUserId)
			if(uobj1._id != fromUserId) return cb('openid 和 userid 不符')

			userBl.getUserByUserId(toUserId,function(err, uobj2){
				if(err) return cb(err);
				if(!uobj2) return cb('没找到目标用户')

				obj.getIfHasAdd(activeId, fromOpenId, toUserId, function(err,doc){
					if(err) return cb(err)
					if(doc) return cb('不能重复支持')

					//审核通过，添加支持记录

					activeLogModel.createOneOrUpdate({
						fromOpenId:fromOpenId,
						fromUserId:fromUserId,
						toUserId:toUserId,
						activeId:activeId,
					},{
						fromOpenId:fromOpenId,
						fromUserId:fromUserId,
						toUserId:toUserId,
						activeId:activeId,
					},function(err,doc){
						cb(err,doc)
					})

				})//end getIfHasAdd

			})//end getUserByUserId

		})//end getUserByOpenid

	})//end findOneByObj
	
}


module.exports = obj;