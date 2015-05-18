$(function(){

	var qid = getQueryString("id")

	if(qid){
		$.ajax({
			'url':'http://apps.me-link.com/open/avengers/get',
			'data':{
				'id':qid
			},
			'dataType':'jsonp',
			'error':function(){
				
			},
			'jsonp':'callback',
			'success':function(result){
				if(result.status === "ok"){
		    		setInfo(result);	
		    	}
			}
		})
	}

	

	$(".share .shareBtn button").on("click",takePartIn);
	$(".downloadAppBtn").on("click",downloadApp);
  $(".downloader").on("click",downloadApp);


});

function takePartIn(){
	window.location.href = "http://mp.weixin.qq.com/s?__biz=MjM5MzUyNTI2Nw==&mid=206250998&idx=1&sn=281be1ba3b9e1a4437086483f646fde7#rd";
}

function downloadApp(){
	startDownloadApp();
}

function setInfo(obj){
	$(".main .name p").eq(0).html(obj.result.data_json.chenghao + obj.result.data_json.xingxiang);
	$(".main .tip span").html(obj.result.data_json.chenghao_find + obj.result.data_json.xingxiang_find);
	$(".main .photoBox").css({
		"background":"url(" + obj.result.user_avatar + ") no-repeat center center",
		"background-size":"contain"
	});
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}