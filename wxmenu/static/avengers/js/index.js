var rot = 0;
$(function(){
	localStorage.removeItem("myId");
	//判断本地是否有存储id，有则直接展示，没有则开始新的页面
	if(localStorage.myId){
		$(".loadingModal").addClass('show');

		var infoAjax = $.ajax({
			url:'http://apps.me-link.com/open/avengers/get',
			data:{'id':localStorage.myId},			
			dataType:'jsonp',
			error:function(){},
			jsonp:'callback',
			success:function(result){
				setInfo(result);
			},
			timeout : 60000, 
			complete : function(XMLHttpRequest,status){ 
		　　　　if(status=='timeout'){
		 　　　　　 infoAjax.abort();
		 			$(".modal").removeClass('show');
		　　　　　  $(".netFailedModal").addClass('show');
		　　　　}
		　　}
		})

	} else {
		bindInput()
	}
	
	//绑定事件
	$("#rotatePhoto").on("click",rotatePhoto);
	$("#changePhoto").on("click",changePhoto);
	//$(".photo footer button").on("click",usePhoto);
	$(".modal").click(function(){
		if($(this).hasClass('loadingModal')){
			return;
		} else if($(this).hasClass('shareModal')){
			$(this).removeClass('show');
		} else {
			$(this).removeClass('show');
//			uploadPhoto();
		}
	});
	
	$(".share .tryAgain button").on("click",changePhoto);
	$(".downloadAppBtn").on("click",downloadApp);
});


window.imgDataBase64 = false
function bindInput(){
	$('#selectPhoto').change(function(){
		// console.log(event);
		var img = event.target.files[0]; 
		
		// 判断是否图片  
        if(!img){  
            return ;  
        }

        var fileNameList = img.name.split('.')
		var fileName = fileNameList[fileNameList.length-1].toLowerCase()
		window.fileType = fileName
		
        // 判断图片格式  
        if(fileName!='jpg' && fileName!='gif' && fileName!='png'){  
            alert('图片只能是jpg,gif,png');  
            return ;  
        } 

        var reader = new FileReader();  
        reader.readAsDataURL(img);  
        reader.onload = function(e){ // reader onload start  
        	window.imgDataBase64 = e.target.result
			initCanvas();
        } // reader onload end  

	})

	var ajaxIng = false
	$('#uploadPhotoBtn').click(function(){
		if(!window.imgDataBase64) return false
		if(ajaxIng) return false;
		$(".uploadModal").addClass('show');
		ajaxIng = true
		//上传图片
		var uploadAjax = $.ajax({
			url:'/api/base64/upload',
			type:"POST",
			data:{
				imgData:window.imgDataBase64,
				fileType:'png'
			},
			timeout:60000,
			dataType:"json",
			success:function(d){
				ajaxIng = false;
				if(d.error == 1){
					$(".failedModal").addClass('show');
					return
				}
				var imgUrl = 'http://'+location.host+d.data;
				usePhoto(imgUrl);
			},
			complete : function(XMLHttpRequest,status){ 
		　　　　if(status=='timeout'){
		 　　　　　 uploadAjax.abort();
		 			$(".modal").removeClass('show');
		　　　　　  $(".netFailedModal").addClass('show');
		　　　　}
		　　}
		});
	})
}

function initCanvas(){
	var image = new Image(); 
	var MAX_HEIGHT = 400; 
	image.onload = function(){ 
		var canvas = document.getElementById("myCanvas");  
        // 如果高度超标  
        if(image.height > MAX_HEIGHT) {  
            // 宽度等比例缩放 *=  
            image.width *= MAX_HEIGHT / image.height;  
            image.height = MAX_HEIGHT;  
        }  
        // 获取 canvas的 2d 环境对象,  
        // 可以理解Context是管理员，canvas是房子  
        var ctx = canvas.getContext("2d");  
        // canvas清屏  
        ctx.clearRect(0, 0, canvas.width, canvas.height);  
        // 重置canvas宽高  
        canvas.width = image.width;  
        canvas.height = image.height;  
        // 将图像绘制到canvas上  
        ctx.drawImage(image, 0, 0, image.width, image.height);  
        window.imgDataBase64 = canvas.toDataURL("image/png")
        $(".photo .picWrapper div").css({
			"background":"url(" + window.imgDataBase64 + ") no-repeat center center",
			"background-size":"contain"
		  });
        $(".index").removeClass('active');              
        $(".photo").addClass('active');
	}
	image.src = window.imgDataBase64;  
}

function MathRand(length){ 
	var Num=""; 
	for(var i=0;i<length;i++) 
	{ 
		Num+=Math.floor(Math.random()*10); 
	} 
	return Num;
} 

function changePhoto(){
	$(".wrapper.active").removeClass('active');
	$(".index").addClass('active');
  	localStorage.removeItem("myId");
  	$('#selectPhoto').val('')
}

function rotatePhoto(){
	var file = document.getElementById("selectPhoto").files[0];
	rot = rot + 90;
	if(rot == 360){
		rot = 0;
	}
	canvasResize(file, {
        crop: false,
        quality: 80,
        rotate: rot,
        callback: function(data, width, height) {
        	window.imgDataBase64 = data;
            initCanvas();
        }
    });
}

function downloadApp(){
	startDownloadApp();
}

function usePhoto(imgWebUrl){
	//$(".loadingModal").addClass('show');
	var imgUrl = imgWebUrl
  	
	var usePhotoAjax = $.ajax({
		url:'http://apps.me-link.com/open/avengers/play',
		data:{
			file_url:imgUrl
		},
		dataType:'jsonp',
		error:function(){
			$(".loadingModal").removeClass('show');
			$(".uploadModal").removeClass('show');
    		$(".failedModal").addClass('show');
		},
		jsonp:'callback',
		success:function(result){

			if(result.status === "ok"){
	    		localStorage.myId=result.result.Id;
	    		setInfo(result);	
	    		clickShare(result.result);

	    	} else {
	    		$(".failedModal").addClass('show');
	    	}
    		$(".loadingModal").removeClass('show');
    		$(".uploadModal").removeClass('show');
		},
		timeout : 60000, 
		complete : function(XMLHttpRequest,status){ 
	　　　　if(status=='timeout'){
	 　　　　　 usePhotoAjax.abort();
	 			$(".modal").removeClass('show');
	　　　　　  $(".netFailedModal").addClass('show');
	　　　　}
	　　}
	})
}

function setInfo(obj){
	clickShare(obj.result)
	//console.log(obj);
	$(".share .name p").html("你是" + obj.result.data_json.chenghao + obj.result.data_json.xingxiang);
	$(".share .tip span").html(obj.result.data_json.chenghao_find + obj.result.data_json.xingxiang_find);
	$(".share .photoBox").css({
		"background":"url(" + obj.result.user_avatar + ") no-repeat center center",
		"background-size":"contain"
	});
	$(".share .shareBtn button").on("click",function(){
		$(".shareModal").addClass('show');	
	});
	$(".photo").removeClass("active");
	$(".share").addClass("active");
	$(".loadingModal").removeClass('show');


}

function clickShare(data){
	wx.config(window.jsconfig);
	wx.ready(function(){
			var shareOption = {
				title: '穿越！快来测试你是复仇者联盟2里面的谁谁谁?', // 分享标题
			    link: 'http://melink.siyanhui.com/static/avengers/share.html?r='+Date.now()+'&id=' + data.Id, // 分享链接
			    imgUrl: data.user_avatar, // 分享图标
			    desc: '我测了一下，居然是'+ data.data_json.chenghao + data.data_json.xingxiang +"!你会是我要找的" + data.data_json.chenghao_find  + data.data_json.xingxiang_find + "么?", // 分享描述
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			    }
			};
			//分享到朋友圈
			wx.onMenuShareTimeline({
			    title: '穿越！快来测试你是复仇者联盟2里面的谁谁谁?', // 分享标题
			    link: 'http://melink.siyanhui.com/static/avengers/share.html?r='+Date.now()+'&id=' + data.Id, // 分享链接
			    imgUrl: data.user_avatar, // 分享图标
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			    }
			});
			//分享给朋友
			wx.onMenuShareAppMessage(shareOption);
			//分享到QQ
			wx.onMenuShareQQ(shareOption);
			//分享到腾讯微博
			wx.onMenuShareWeibo(shareOption);

	})
}


