var fadeTemplate = '您的客户 <b>{name}</b>，推荐记录状态更新为 <b>{status}</b>'

$(function(){
	window.isajax = false;
	var rec_nes = $('#rec_nes')
	var putRecNews = function(str,cb){
		var cb = cb || $.noop;

		  rec_nes.html(str);
		  rec_nes.fadeIn();
          setTimeout(function(){
          	rec_nes.fadeOut(function(){//fade out 完成1秒后执行cb
          		setTimeout(function(){
          			cb()
          		},500)
          	});
          },5000)

	}

	$.post('/api/user/getrecnews',{
        'wxuserid':window.userid
      },function(d){
          window.isajax = false;
          if(d.error) return;
          if(d.data.length == 0) return;
          var cmdList = []
          d.data.forEach(function(reco){

          	  var str = fadeTemplate.replace('{name}',reco.recName)
          	  						.replace('{status}',reco.Status)
              //将命令放入执行数组
          	  cmdList.push(function(callback){
                  var tempstr= str;
                  putRecNews(tempstr,callback)
              })
          	 
          })

          var as = new AsyncProxyBrowser(true)
          cmdList.push(function(){
            console.log('all done')
          })
          //执行异步调用
          setTimeout(function(){
            as.ap.apply(as, cmdList);
          },1000)
          
          
    },'json')



})