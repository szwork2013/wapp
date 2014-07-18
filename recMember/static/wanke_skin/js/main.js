/*******************************************
 * Copyright:智讯互动(www.zhixunhudong.com)
 * Author:Mr.Think
 * Description:移动设备JS
 *******************************************/

/**************
 * 微信分享
 **************/
_WXShare('分享显示的LOGO','100','100','分享标题','分享描述','分享链接','微信APPID(一般不用填)');

/**************
 * 分享提示
 **************/
//var wit_wechatShare_=null,wit_wechatShare=function(e){this.Mask=e,this.imgUrl="http://cdn.w-i-t.cn/13_qdvanke1212/img/img-guide.png"};KISSY.use("node,dom,event,gallery/simple-mask/1.0/",function(e,t,n,r,i){var s=t.all;ShareMask=i({zIndex:999,opacity:.9}),wit_wechatShare.prototype.openMask=function(e){this.Mask.removeMask(),this.Mask.addMask(),s("body").append('<img src="'+this.imgUrl+'" alt="" id="J_share-tips" '+'style="position: fixed;left:50%;margin-left:-140px;;top:0px;width:280px;height: auto;z-index:1000;'+' background-repeat: no-repeat;background-position:center 0px;z-index:99999999"/>');var t=this;s("#J_share-tips").on("click",function(){t.Mask.removeMask(),s(this).remove(),(e)})},wit_wechatShare_=new wit_wechatShare(ShareMask)})

/**************
 * 预加载
 **************/
//function _PreLoadImg(b,e){var c=0,a={},d=0;for(src in b){d++}for(src in b){a[src]=new Image();a[src].onload=function(){if(++c>=d){e(a)}};a[src].src=b[src]}};

/**************
 * KISSY
 **************/
KISSY.use('node,gallery/qrcode/1.0/',function(S,Node,QRCode){
	var $ = Node.all;
	/*//预加载
	_PreLoadImg(['static/img/01.jpg',
	'static/img/02.png'],function(){  
		$('.loading').remove();
		$('.p-index').show();
	});*/
	//二维码
	var qrcode = new QRCode("qrcode",{
		text:url,
		width:167,
		height:167,
		colorDark:"#000",
		colorLight:"#fff",
		correctLevel:QRCode.CorrectLevel.H
    });
});

/**************
 * jquery
 **************/
//var jq=jQuery.noConflict();
$(function(){
	//导航弹出
	$(".page-header .menu").click(function(){
		$("nav,.mask").show();
		$("nav").removeClass("hide").addClass("show");
	});
	//导航隐藏
	$(".mask,.menu-back").click(function(){
		$(".mask").hide();
		$("nav").addClass("hide").removeClass("show");
		setTimeout(function(){
			$("nav").hide();
		},600);
	});
	//下拉字体颜色
	$(".content-index .info select").click(function(){
		$(this).css("color","#333");
	});
	//协议勾选
	$(".protocol .tick").click(function(){
		$(this).toggleClass("icon");
	});
	//查看协议
	$(".protocol .enter").click(function(){
		$(".protocol-dialog,.mask").show();
	});
	$(".protocol-dialog a").click(function(){
		$(".protocol-dialog,.mask").hide();
	});
	//关闭报错
	$(".sorry-dialog a").click(function(){
		$(".sorry-dialog,.mask").hide();
	});
});
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
	WeixinJSBridge.call('hideOptionMenu');
});