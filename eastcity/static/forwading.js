$(function(){
        var dataForWeixin = {
            appId: "",
            MsgImg: "http://imgdn5.soufunimg.com/2014/04/07/gz/gebz/ab601d81e4724a4a8bd5ac01ee66ee62/mlylogo.jpg",
            TLImg: "http://imgdn5.soufunimg.com/2014/04/07/gz/gebz/ab601d81e4724a4a8bd5ac01ee66ee62/mlylogo.jpg",
            url:  "http://imgdn5.soufunimg.com/2014/04/07/gz/gebz/ab601d81e4724a4a8bd5ac01ee66ee62/",
            title: "我挑战了“搜房豪宅之梦”快来一起挑战吧！",
            desc: "我挑战了“搜房豪宅之梦”，获得了" + share_score + "分的好成绩！你也来试试吧!",
            fakeid: "",
            callback: function() {
        		if(window.articleid){
        			$.post('/api/score/forwarding',{'articleid':window.articleid,'wxuserid':window.userid},function(d){

        			},'json')
        		}
        		}
        	};

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
                        "desc": "我挑战了“搜房豪宅之梦”获得了" + share_score + "分的好成绩！你也来试试吧！",
                        "title": "我挑战了“搜房豪宅之梦”获得了" + share_score + "分的好成绩！你也来试试吧!"
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
                        "desc": "我挑战了“搜房豪宅之梦”获得了" + share_score + "分的好成绩！你也来试试吧！",
                        "title": "我挑战了“搜房豪宅之梦”获得了" + share_score + "分的好成绩！你也来试试吧！"
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

})