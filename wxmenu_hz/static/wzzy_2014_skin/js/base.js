$(function(){
	$('.hbox').each(function(index, element) {//鼠标移动上去切换
		var that = $(this),
			hc = that.find('.hcontrol'),
			hcon = that.find('.hcontent'),
			hmore = that.find('.hmore');
        hc.mouseenter(function(){
			hc.removeClass('sel');
			$(this).addClass('sel');
			var n = $(this).index();
			hcon.hide().eq(n).show();
			hmore.hide().eq(n).show();
		}).click(function(){return false;});
		hc.first().triggerHandler('mouseenter');
    });
	
	
});


function wwwinit(info){	
	if(info.haslogin == true){	
		$('#topName').html(info.lname);
		$('#topLineIsLogin').show();
		$('#uname').html(info.lname);
		$('#isLogin').show();
	}
	else{
		$("#topLine").show();
		$("#logoBox").show();
		flushLoginTicket(); 
	}
}
//jsonp
function flushLoginTicket() {        
	$.getScript('https://passport.6998.com/api/getlt?rand=' + Math.random(),
	function () {
		$('#J_LoginTicket').val(_loginTicket);
	});
}
var JSONP = document.createElement("script") ;
	JSONP.onload = JSONP.onreadystatechange = function(){
		if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
			JSONP.onload = JSONP.onreadystatechange = null;
		}
	};
	JSONP.type = "text/javascript";
	JSONP.src = "https://passport.6998.com/api/logininfo?jsoncallback=wwwinit&rand=" + Math.random();
	document.getElementsByTagName("head")[0].appendChild(JSONP); 