var obj={}

//业务员的，姓名，性别，电话的json数组列表
obj.yewuyuan_list  = []


//根据合众的关键字回复获取真实工号
var get_number = function(worknum){
	var trueNum = worknum.split('hz_')[1]
	return trueNum
}

//获取业务员信息
obj.get_yewuyuan = function(worknum){
	var trueWorkNum = get_number()
	//循环遍历 obj.yewuyuan_list 数组，找到匹配的工号

	var yewuyuanObj = {
		'appUserSex':1,
		'appUserName':2,
		'appUserMobile':3,
		'workNum':trueWorkNum,
	}

	return yewuyuanObj
}

























module.exports = obj