// JavaScript Document
$(function(){
	var oLabelLi=$(".labelBox ul li");
	$(".actCont:gt(0)").hide();
	oLabelLi.click(function(){
		$(this).addClass("active").siblings().removeClass("active");
		$(".actCont").eq(oLabelLi.index(this)).show().siblings().hide();
		});
	oLabelLi.last().css('border','none');
	
	var oTop=window.screen.height-50;
	var oBottom=$(".bottom");
	oBottom.css('top',oTop+'px')
	
	});
