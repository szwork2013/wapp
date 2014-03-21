// JavaScript Document
window.DataHost = ''

$(function(){

	var local_uri = location.pathname;
	$('.nav-list a').each(function(){
		var that = $(this)
		if(that.attr('href').indexOf(local_uri) === 0){
			that.parent().addClass('active')
		}
	})


})

$.fn.inputTips = function (msg) {
    var that = this;
    that.after('<br/><p>'+msg+'</p>');
    return that;
}