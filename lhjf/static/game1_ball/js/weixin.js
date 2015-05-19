document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
var rootPath = "";
var appId = "";

function onBridgeReady() {
	WeixinJSBridge.on('menu:share:appmessage',
		function (argv) {
			WeixinJSBridge.invoke('sendAppMessage', {
				"appid": appId,
				"img_url": shareParam.ShareImgUrl,
				"img_width": "640",
				"img_height": "640",
				"link": shareParam.ShareLink,
				"title": shareParam.ShareTitle,
				"desc": shareParam.ShareDesc
			},
			function(res) {
			})
		}
	);
	
	WeixinJSBridge.on('menu:share:timeline',
		function (argv) {
			WeixinJSBridge.invoke('shareTimeline', {
				"appid": appId,
				"img_url": shareParam.ShareImgUrl,
				"img_width": "640",
				"img_height": "640",
				"link": shareParam.ShareLink,
				"title": shareParam.ShareDesc,
				"desc": ""
			},
			function(res) {
			});
		}
	);

	WeixinJSBridge.call('hideToolbar');
}
