var prizeDl = require('./dl/appActivePrizeRecordModel.js')
var activeId = '545c2bbc3bd5b9db4f17b59d'


//检查重复中奖的用户id
prizeDl.checkRepeatUser(activeId, function(err,list){
	if(err) return console.log(err)
	if(list.length == 0) return console.log('empty list')
	list.forEach(function(o){
		if(o.supportCount > 1){
			console.log(o)
		}
	})
})