var utils = require('../lib/utils.js');
var appBl = require('../bl/wxApp.js')
var moment = require('moment')
var os = require('os')
var platForm = os.platform()
var obj = {}

var bonusJson = require('../tools/hongli.json')
//console.log(bonusJson[0])
//console.log(bonusJson[1])
//最终保存的字典，方便快速查找
var bonusDict = {
	//根据红利高中低分
	'lower':{
		//根据男女分
		'male':{
			//根据交费年限分
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
		'female':{
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
	},
	'middle':{
		'male':{
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
		'female':{
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
	},
	'high':{
		'male':{
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
		'female':{
			'1:2':[],
			'1:4':[],
			'1:9':[],
		},
	},
}

obj.dealBonusJson = function(){

	bonusJson.forEach(function(item, i){
		//第一行不处理
		if(i == 0) return;
		var key1, key2, key3
		if(item.hongli == '高'){
			var key1 = 'high'
		}
		else if(item.hongli == '中'){
			var key1 = 'middle'
		}
		else if(item.hongli == '低'){
			var key1 = 'lower'
		}

		if(item.xingbie == 1){
			var key2 = 'male'
		}
		else if(item.xingbie == 2){
			var key2 = 'female'
		}


		if(item.jiaofeiqijian == 3){
			var key3 = '1:2'
		}
		else if(item.jiaofeiqijian == 5){
			var key3 = '1:4'
		}
		else if(item.jiaofeiqijian == 10){
			var key3 = '1:9'
		}
		
		if(!key1 || !key2 || !key3){
			console.log('item parse get error')
			console.log(item,i)
			return
		}

		bonusDict[key1][key2][key3].push(item)

	})

	//console.log(bonusDict['high']['male']['1:2'])

}




//展示页面接口
obj.page = function(req,res){ //用户认证绑定

	/*var wxuobj = req.wxuobj;

	//测试用，正式环境需注释
	if(platForm == 'win32'){
		req.session[appEname+'_userid'] = '53e9b5daab6cc994aa6e7a5e'
	}
	

	var appobj = utils.getAppEname(req.originalUrl)
	if(appobj.error){
		return res.send(appobj)
	}
	var appEname = appobj.data;
	var userid = req.session[appEname+'_userid'];
	if(!userid){
		return res.send('用户身份丢失，请重新进入')
	}
	if(!appEname){
		return res.send(404)
	}

	appBl.getByEname(appEname,function(err,appObj){
			if(err){
				return res.send(500, err)
			}
			if(!appObj){
				return res.send(404)
			}
	*/
			res.render('game/insurance.ejs', {
							//appEname:appEname,
							//appId:appObj._id,
							//userid:userid,
							//wxuobj:wxuobj
						});
	//})

}


var sexList = ['', 'male', 'female']
var allocList = ['', '1:2', '1:4', '1:9']
var allocDict = {
	'1:2':3,
	'1:4':5,
	'1:9':10,
}

var bonusListKey = ['lower', 'middle' , 'high']

//计算保险金额
obj.getBonus = function(req,res){

	var cash = parseInt(req.query.cash)
	var sex = parseInt(req.query.sex)
	var age = parseInt(req.query.age)
	var alloc = parseInt(req.query.alloc)

	//验证参数
	if(!cash || cash <=0 || cash >= 10000000){
		return res.send({error:1, data:'金额输入有误'})
	}
	if(typeof age != 'number' || age < 0 || age > 65 ){
		return res.send({error:1, data:'年龄输入有误'})
	}
	if(!sex || !sexList[sex]){
		return res.send({error:1, data:'性别输入有误'})
	}
	if( !alloc || !allocList[alloc]){
		return res.send({error:1, data:'资金分配有误'})
	}

	if( age > 55 && alloc == 3){
		return res.send({error:1, data:'10年缴费年限，年龄不能超过55岁'}) 
	}

	if( age > 60 && alloc == 2){
		return res.send({error:1, data:'5年缴费年限，年龄不能超过60岁'}) 
	}

	var result = obj.calBonus(cash, sexList[sex], age, allocList[alloc])
	if(typeof result != "object"){
		return res.send({error:1, data:result||'计算红利失败'}) 
	}

	return res.send({error:0, data:result}) 
}



//cash 表示现金
//sex 表示性别
//age 表示年龄
//allocLv 表示交费期间
obj.calBonus = function(cash, sex, age, allocLv){
	var error = 0;
	var bonusResultDict = {
		'lower':{},
		'middle':{},
		'high':{},
	}
	//分别获取3此，低，中，高红利的万能账户价值
	bonusListKey.forEach(function(bonusKey){

		//1.获取基本保额
		var jiBenBaoEValue = obj.getJiBenBaoE(cash, sex, age, allocLv, bonusKey)
		if(!jiBenBaoEValue) return error++


		//2.获取有效保额的数组
		var youXiaoBaoEList = obj.getYouXiaoBaoE(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue)
		if(!youXiaoBaoEList) return error++
			//console.log(youXiaoBaoEList); return;

		//3.计算生存金的数组
		var shengCunJinList = obj.getshengCunJin(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList)
		if(!shengCunJinList) return error++


		//4.计算终了红利
		var zhongLiaoHongLiValue = obj.getZhongLiaoHongLi(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList, shengCunJinList)
		if(!zhongLiaoHongLiValue) return error++


		//5.计算万能价值数组
		var wanNengJiaZhiList = obj.getWanNengJiaZhi(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList, shengCunJinList, zhongLiaoHongLiValue)
		if(!wanNengJiaZhiList) return error++


		var tempList = {}
		wanNengJiaZhiList.forEach(function(wanVal,i){
			var key = (age+i+1).toString()
			tempList[key] = wanVal
		})
		bonusResultDict[bonusKey] = tempList

	})	

	if(error > 0){
		if(platForm == 'win32'){
			console.log('got error')
		}
		return false
	} 

	if(platForm == 'win32'){
		console.log('20 year')
		console.log(bonusResultDict.lower['20'])
		console.log(bonusResultDict.middle['20'])
		console.log(bonusResultDict.high['20'])
		console.log('60 year')
		console.log(bonusResultDict.lower['60'])
		console.log(bonusResultDict.middle['60'])
		console.log(bonusResultDict.high['60'])
		console.log('70 year')
		console.log(bonusResultDict.lower['70'])
		console.log(bonusResultDict.middle['70'])
		console.log(bonusResultDict.high['70'])
		console.log('88 year')
		console.log(bonusResultDict.lower['88'])
		console.log(bonusResultDict.middle['88'])
		console.log(bonusResultDict.high['88'])
		// console.log('lower all')
		 // console.log(bonusResultDict.lower)
		 // console.log(bonusResultDict.middle)
		 // console.log(bonusResultDict.high)
	}
	
	return bonusResultDict
}


//获取基本保额方法
obj.getJiBenBaoE = function(cash, sex, age, allocLv, bonusKey){

	var yearLimit = allocDict[allocLv]
	var yearPay = cash/yearLimit
	//设定投保年度为1
	var yearCur = 1
	var baofeilie;
	//去找对应的保费列
	bonusDict[bonusKey][sex][allocLv].forEach(function(obj){
		if(obj.toubaoniandu == yearCur && age == obj.toubaonianling){
			baofeilie = obj.baofei
		}
	})
	
	if(!baofeilie) return false
	//高红利的基本保额=每年保费/保费因子*1000
	//基本保额不变，每次都是以这个为基础
	var jiBenBaoEValue = Math.round(yearPay/baofeilie * 1000)
	
	return jiBenBaoEValue
}



//获取有效保额的数组
obj.getYouXiaoBaoE = function(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue){

	//有效保额行数=缴费期+10年，如果分3年交就有13行
	var yearLimit = allocDict[allocLv] + 10

	//低红利有效保额 = 低红利的基本保额 * 有效保额因子 / 1000
	var youXiaoBaoEList = []
	for(var i=1; i<=yearLimit; i++){
		bonusDict[bonusKey][sex][allocLv].forEach(function(obj){

			//如果匹配条件，保险年度==i，年龄也匹配
			if(obj.toubaoniandu == i && age == obj.toubaonianling){
				//当前年度的有效保额
				//console.log(obj.youxiaobaoxjine)
				//console.log(jiBenBaoEValue)
				var curYouXiaoBaoEVal = Math.round(jiBenBaoEValue * obj.youxiaobaoxjine / 1000)
				youXiaoBaoEList.push(curYouXiaoBaoEVal)
				return;
			}

		})
	}

	if(youXiaoBaoEList.length != yearLimit) return false

	return youXiaoBaoEList

}


//获取生存金的数组
obj.getshengCunJin = function(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList){

	//生存金行数=缴费期+10年，如果分3年交就有13行
	var yearJiaoFei = allocDict[allocLv]
	var yearLimit =  yearJiaoFei + 10
	//前（yearLimit-1）年生存金为0
	//从第 缴费期间 年开始 （假设为N）：
	//第1 ~ 第 N-1 年 生存金 = 0
	//第N 年 生存金 = 第N年有效保额 * N * 0.04
	//第N +1年 - 第N+9 年 生存金 = 第N+1年 - 第N+9年 的 有效保额 * N * 0.01
	//第N+10年 生存金 = 第N+10年 的 有效保额 * N * 1.01 

	shengCunJinList = []
	for(var i=1;i<=yearLimit;i++){
		//第1 ~ 第 N-1 年 生存金 = 0
		if(i<3){
			shengCunJinList.push(0)
		}
		else if( i == 3){
			var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 0.03)
			if( i == yearJiaoFei){
				var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 0.04)
			}
			shengCunJinList.push(curShenCunVal)
		}
		else if(i>3 && i<yearJiaoFei){
			var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 0.01)
			shengCunJinList.push(curShenCunVal)
		}
		//第N 年 生存金 = 第N年有效保额 * N * 0.04
		else if(i == yearJiaoFei){
			var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 0.02)
			shengCunJinList.push(curShenCunVal)
		}
		//第N +1年 to 第N+9 年 生存金 = 第N+1年 to 第N+9年 的 有效保额 * N * 0.01
		else if(i > yearJiaoFei && i <= (yearJiaoFei+9)){
			var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 0.01)
			shengCunJinList.push(curShenCunVal)
		}
		//第N+10年 生存金 = 第N+10年 的 有效保额 * N * 1.01 
		else if(i == yearLimit){
			var curShenCunVal = Math.round(youXiaoBaoEList[i-1] * yearJiaoFei * 1.01)
			shengCunJinList.push(curShenCunVal)
		}
	}

	if(shengCunJinList.length != yearLimit) return false

	return shengCunJinList

}




obj.getZhongLiaoHongLi = function(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList, shengCunJinList){

	//终了红利，值计算交费期间+9年的那个
	var yearJiaoFei = allocDict[allocLv]
	var yearLimit =  yearJiaoFei + 10

	//期满那年对应的红利因子 = select 终了红利,固定费用调整  
	//from sheet3 where 红利档=低、性别=男、交费期间=3、投保年龄=50，投保年度=13（缴费期限+10）
	var qiManHongliYinizi
	var feiYongTiaoZheng
	//检索因子和调整值
	bonusDict[bonusKey][sex][allocLv].forEach(function(obj){
		//如果匹配条件，保险年度==i，年龄也匹配
		if(obj.toubaoniandu == yearLimit && age == obj.toubaonianling){
			//当前年度的有效保额
			qiManHongliYinizi = obj.zhonglhongli
			feiYongTiaoZheng = obj.gudingbaofeitiaozheng
		}

	})

	if(!qiManHongliYinizi || !feiYongTiaoZheng) return false
	//终了红利 = 低“缴费期限+9”有效保额 * 期满那年对应的红利因子 - 固定费用调整
	var zhongLiaoHongLiValue = Math.round(youXiaoBaoEList[yearLimit-2] * qiManHongliYinizi - feiYongTiaoZheng)

	return zhongLiaoHongLiValue

}




obj.getWanNengJiaZhi = function(cash, sex, age, allocLv, bonusKey, jiBenBaoEValue, youXiaoBaoEList, shengCunJinList, zhongLiaoHongLiValue){

	//万能价值数组长度
	var listLenth = 88 - age
	//交费年限
	var yearJiaoFei = allocDict[allocLv]
	var yearPay = cash/yearJiaoFei
	
	//红利因子数组
	var wanNengHongLiYinZi = []
	if(bonusKey == 'lower'){
		for(var i=0; i<listLenth; i++){
			//低：缴费期限=0.025,缴费期后=0.0175
			if(i<3){
				wanNengHongLiYinZi.push(0.025)
			}
			else{
				wanNengHongLiYinZi.push(0.0175)
			}
		}
	}
	else if(bonusKey == 'middle'){
		for(var i=0; i<listLenth; i++){
			//中：0.045
			wanNengHongLiYinZi.push(0.045)
		}
	}
	else if(bonusKey == 'high'){
		for(var i=0; i<listLenth; i++){
			//高：0.06
			wanNengHongLiYinZi.push(0.06)
		}
	}

	if(wanNengHongLiYinZi.length != listLenth) return false;
	/*缴费期内：
	万能帐户价值
	1、交费期中（3年的话就是1年2年） = 
	第一年 = 分配到万能账户的资金×1.025
	第二年 = （要用第一年 - 年交保费） * （1+ 0.025）
	（例如：
	这样的，假如玩游戏得到的元宝额是 300000，选的是 1:2 
	那么第一年分配到万能账户的资金 就是 300000 - 100000 = 200000

	第一年万能账户加上红利就是 200000 * 1.025 = 205000
	第二年呢，又要扣掉 100000 保费， 所以第二年到万能账户的资金是 205000 - 100000 = 105000
	）


	2、交费期满（此例为第3年） = (去年万能价值-100000)*（红利因子例如1.025）+此年生存金返还


	3、交费期满后1年 to 交费期满后9年（当不扣减年交保费后）
	当年万能账户价值=上一年价值*（1+红利利率）+返还的钱。低低档从第4年红利利率调成0.0175


	4、缴费期满后10年 = 第交费期+10年时，还是同上面算法，但是结果要加上终了红利。



	5、缴费期满后11年 to 88岁 = 上一年万能值值*1.0175/1.045/1.06 （）
	从第交费期+11年开始，账户价值=上一年×（1+1.75%），不断累积。
	*/
	var wanNengJiaZhiList = []
	var yearJiaoFeiLimit = yearJiaoFei - 1

	for(var i=0; i<listLenth; i++){
		//交费期间
		if(i<yearJiaoFeiLimit){
			//第一年
			if(i == 0){
				var curCash = Math.round(yearPay * yearJiaoFeiLimit)
			}
			else{
				var curCash = wanNengJiaZhiList[i-1] - Math.round(yearPay)
			}

			var wanNengJiaZhiVal = curCash * (1 + wanNengHongLiYinZi[i])
			if(i>=2){
				//console.log(shengCunJinList[i])
				wanNengJiaZhiVal += shengCunJinList[i]
			}
			wanNengJiaZhiList.push(wanNengJiaZhiVal)
		}
		//缴费期满
		else if(i==yearJiaoFeiLimit){
			var curCash = wanNengJiaZhiList[i-1] - yearPay
			var wanNengJiaZhiVal = curCash * (1 + wanNengHongLiYinZi[i]) + shengCunJinList[i]
			wanNengJiaZhiList.push(wanNengJiaZhiVal)
		}
		//交费期满后1年 to 交费期满后9年
		else if(i>yearJiaoFeiLimit && i<=(yearJiaoFeiLimit+9)){
			var curCash = wanNengJiaZhiList[i-1]
			var wanNengJiaZhiVal = curCash * (1 + wanNengHongLiYinZi[i]) + shengCunJinList[i]
			wanNengJiaZhiList.push(wanNengJiaZhiVal)
		}
		//缴费期满后10年
		else if(i == (yearJiaoFeiLimit+10)){
			var curCash = wanNengJiaZhiList[i-1]
			var wanNengJiaZhiVal = curCash * (1 + wanNengHongLiYinZi[i]) + shengCunJinList[i] + zhongLiaoHongLiValue
			wanNengJiaZhiList.push(wanNengJiaZhiVal)
		}
		//缴费期满后11年 to 88岁
		else if(i>(yearJiaoFeiLimit+10)){
			var curCash = wanNengJiaZhiList[i-1]
			var wanNengJiaZhiVal = curCash * (1 + wanNengHongLiYinZi[i])
			wanNengJiaZhiList.push(wanNengJiaZhiVal)
		}

	}

	if(wanNengJiaZhiList.length != listLenth) return false

	wanNengJiaZhiList = wanNengJiaZhiList.map(function(v){
			return Math.round(v)
	})

	return wanNengJiaZhiList

}




obj.dealBonusJson()
if(platForm == 'win32'){
	obj.calBonus(545458, 'female', 45, '1:4')
}
module.exports = obj;