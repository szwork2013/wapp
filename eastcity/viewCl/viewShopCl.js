var userBl = require('../bl/wxUser.js');
var scoreBl = require('../bl/wxScoreSys.js');
var infoBl = require('../bl/wxInfo.js');
var shopBl = require('../bl/wxShop.js');
var utils = require('../lib/utils.js');
var obj = {}



//商品兑换控制器
obj.shoplist = function(req,res){ //商品列表页
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	shopBl.getPrizeList(appId, function(err,list){
		if(err){
			return res.send(500,'商品列表页加载失败')
		}
		shopBl.getUserPrize(userId,appId,function(err,list2){
			if(err){
				return res.send(500,'商品列表页加载失败')
			}
			//console.log(list2)
			res.render('shop_list.ejs',{
				'userObj':req.wxuobj,
				'binderObj':req.wxBinder,
				'list':list,
				'list2':list2
			})
			return;
		})
	})	
}

//竞拍控制器页面
obj.salelist = function(req,res){ //竞拍页面
	var userId = req.wxuobj._id;
	var appId = global.wxAppObj._id;
	var openId = req.wxuobj.openId;

	shopBl.getSaleList(appId, function(err,list){
		if(err){
			return res.send(500,'竞拍页面加载失败')
		}

		res.render('shop_salelist.ejs',{
			'userObj':req.wxuobj,
			'binderObj':req.wxBinder,
			'list':list
		})
		return;
	})	
}




module.exports = obj;