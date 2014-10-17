try{

var share_score = 2000;
var _host = "http://" + window.location.host;

document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
WeixinJSBridge.call('hideToolbar');
});
function attention_wx()
{
    //$.cookie('isforward', '1', { expires: 365, path: '/' });
}
function is_zero()
{
    if(share_score == 0)
    {
        share_score = 2000;
    }
}
var dataForWeixin = {
    appId: "",
    MsgImg: window.forwardingImg,
    TLImg: window.forwardingImg,
    url:  window.forwardingUrl,
    title: window.forwardingTitle,
    desc: window.forwardingDesc,
    fakeid: "",
    callback: function() {
        setTimeout(function(){
          attention_wx();
         },2000);       }
}; (function() {
    var onBridgeReady = function() {
        WeixinJSBridge.on('menu:share:appmessage',
        function(argv) {
            is_zero();
            WeixinJSBridge.invoke('sendAppMessage', {
                "appid": dataForWeixin.appId,
                "img_url": dataForWeixin.MsgImg,
                "img_width": "120",
                "img_height": "120",
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            },
            function(res) { (dataForWeixin.callback)();
            });
        });
        WeixinJSBridge.on('menu:share:timeline',
        function(argv) { (dataForWeixin.callback)();
        is_zero();
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": dataForWeixin.TLImg,
                "img_width": "120",
                "img_height": "120",
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            },
            function(res) {});
        });
        WeixinJSBridge.on('menu:share:weibo',
        function(argv) {
            WeixinJSBridge.invoke('shareWeibo', {
                "content": dataForWeixin.title,
                "url": dataForWeixin.url
            },
            function(res) { (dataForWeixin.callback)();
            });
        });
        WeixinJSBridge.on('menu:share:facebook',
        function(argv) { (dataForWeixin.callback)();
            WeixinJSBridge.invoke('shareFB', {
                "img_url": dataForWeixin.TLImg,
                "img_width": "120",
                "img_height": "120",
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            },
            function(res) {});
        });
    };
    if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
    } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
    }
})();







var WeixinApi = (function () { 
 
    /* 这里省略了一堆代码……下面直接看调用接口 */ 
    return {
        ready           :wxJsBridgeReady,
        shareToTimeline :weixinShareTimeline,
        shareToWeibo    :weixinShareWeibo,
        shareToFriend   :weixinSendAppMessage,
        showOptionMenu  :showOptionMenu,
        hideOptionMenu  :hideOptionMenu,
        showToolbar     :showToolbar,
        hideToolbar     :hideToolbar,
        getNetworkType  :getNetworkType,
        imagePreview    :imagePreview
    };    
 
})();
// 所有功能必须包含在 WeixinApi.ready 中进行
WeixinApi.ready(function(Api){
    
    // 微信分享的数据
    var wxData = {
        "imgUrl":'',
        "link":'',
        "desc":'',
        "title":""
    };
 
    // 分享的回调
    var wxCallbacks = {
        // 分享操作开始之前
        ready:function () {
            alert('ready')
            // 你可以在这里对分享的数据进行重组
        },
        // 分享被用户自动取消
        cancel:function (resp) {
            alert('cancel')
            // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
        },
        // 分享失败了
        fail:function (resp) {
            // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
        },
        // 分享成功
        confirm:function (resp) {
                
        },
        // 整个分享过程结束
        all:function (resp) {
            // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
        }
    };
 
    // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
    Api.shareToFriend(wxData, wxCallbacks);
 
    // 点击分享到朋友圈，会执行下面这个代码
    Api.shareToTimeline(wxData, wxCallbacks);
 
    // 点击分享到腾讯微博，会执行下面这个代码
    Api.shareToWeibo(wxData, wxCallbacks);
})
}catch(e){
    console.log(e)
}