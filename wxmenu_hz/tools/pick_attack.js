var async = require('async')
var util = require('util')
var http = require('http');
var request = require('request');

var concur = 100
var reqs = 20000
var reqPath = 'http://s9994.sgws.g.yx-g.cn:8681/pick/multiinfo?u=yxf_9994_attack%s%s%s&id=20029&net=Unknown&browser=Unknown&os=Unknown'
var startNum = 0
var timeOut = 60*1000



var successCount = 0
var resErrorCount = 0
var reqErrorCount = 0
var timeOutErrorCount = 0
var totalResCount = 0
var globalCount = 0;



var attackFunc = function(channel){
	var dealFunc = []
	var perReq = reqs/concur
	for(var i=0; i<perReq; i++){
		
		dealFunc.push(
				(function(j){
					var j = j
					return function(callback){
							globalCount++
							//console.log(util.format(reqPath, j, channel, globalCount))
							
							request({
							    method:'GET',
							    headers:{
							    	'Accept':'*/*',
							    	'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,zh-TW;q=0.2',
							    	'Host':'pick.sgws.g.yx-g.cn:8681',
							    	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36'
							    },
							    timeout:timeOut,
							    uri:util.format(reqPath, j, channel, globalCount)
							}, function(error, response, body){
								if(error){
									console.log(error)
									resErrorCount++
								}
								else if(response.statusCode != 200){
									console.log(error)
									resErrorCount++
								}
								else if(body != 'ok'){
									console.log(body)
							    	resErrorCount++
						    	}
						    	else if(body == 'ok'){
						    		successCount++
						    	}
						    	//console.log(body||'')
						    	totalResCount++
								callback()		

							})


					}		
				})(i)
			)
	}

	console.log('channel '+channel+' attack start')
	async.series(dealFunc, function(err){
		console.log('channel '+channel+' attack done')
		console.log('=========================')
	})

}


//循环检查
var intervalCheck = setInterval(function(){
	console.log('complete response got:'+totalResCount)
	if(totalResCount >= reqs){
		clearInterval(intervalCheck)
		console.log('successCount:'+successCount)
		console.log('resErrorCount:'+resErrorCount)
		console.log('reqErrorCount:'+reqErrorCount)
		console.log('timeOutErrorCount:'+timeOutErrorCount)
	}
},5000)


for(var k=0;k<concur;k++){
	attackFunc(k)
}
 



