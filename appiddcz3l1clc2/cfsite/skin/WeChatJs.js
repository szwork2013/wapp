var Request = new Object();
Request = GetRequest();

/*****************需要配置的值*********************/
var domain = "http://xm.vanke.com/"; 	//回调域名，跟帐号同步修改
var defaultPage = domain + "index.shtml";	//默认网站首页
var webroot = domain + "weixin/";			//后台根目录
var com_openid = "gh_7a1ef7027cb7"; //Request['state']; //矩阵互动新媒体

var option_hideToolbar = true;		//隐藏下方工具栏
var option_hideOptionMenu = false;	//隐藏右上方菜（分享）

var option_oauth_userinfo = true;	//如果未关注，转到授权页面读取个人信息
var option_subscribe = true;		//如果未关注，转到公众账号关注页面
/************************************************/

//var subscribe_link = "weixin://contacts/profile/" + com_openid;//关注帐号链接
var subscribe_link = "http://xm.vanke.com/2014/hongbao2014/attention.shtml"; //抢红包2014关注页面

window.onload = function () {
    //如果页面上存在 GetMemberInfo 方法，表示需要读取客户信息。
    if (typeof GetMemberInfo != 'undefined') {
        if (Request['code'] == 'undefined') { //用户未授权
            location.href = defaultPage;
            return;
        }

        var getopenid_url = webroot + "WebServices/WeChatApi.aspx?v=GetCusOpenID&code=" + Request['code'] + "&state=" + com_openid;
        $.ajax({
            type: "get", dataType: "json", url: getopenid_url, data: "",
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('获取数据失败，请关闭页面以后重新访问！'); //alert(XMLHttpRequest.status); alert(XMLHttpRequest.readyState); alert(textStatus);
            },
            success: function (openid_data) {
                var openid = openid_data.UserToken.openid; /*客户微信号*///UserToken.refresh_token 刷信用token; UserToken.scope 信息类型//UserToken.access_token 获取信息用token;	UserToken.expires_in 超时时间
                var access_token = openid_data.UserToken.access_token; //alert(openid_data.UserToken.scope);

                if (openid_data.UserToken.scope.indexOf("snsapi_base") >= 0) {
                    var getinfo_url = webroot + "WebServices/WeChatApi.aspx?v=GetCusInfo&openid=" + openid + "&state=" + com_openid;
                    $.ajax({
                        type: "get", dataType: "json", url: getinfo_url, data: "",
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert('获取数据失败，请关闭页面以后重新访问！'); //alert(XMLHttpRequest.status); alert(XMLHttpRequest.readyState); alert(textStatus);
                        },
                        success: function (userinfo_data) {
                            if (userinfo_data.ErrorCode == -5) {
                                //if (option_oauth_userinfo) {
                                //	var url = location.href;
                                //	if (url.indexOf("?") >= 0) {
                                //		var arr = new Array();
                                //		for (var key in Request) {	//遍历所有参数		//去掉code和state参数
                                //			if (key.toLowerCase() == "code" || key.toLowerCase() == "state") {
                                //				continue;
                                //			}
                                //			arr.push(key + "=" + Request[key]);
                                //		}
                                //		url = url.substr(0, url.indexOf("?") + 1);//获得？前的部分
                                //		//alert(url);
                                //		//alert(arr.toString());
                                //		url = url + arr.join('&');
                                //		//alert(url);
                                //	}
                                //	//转移当前页面到授权页面
                                //	RedirectAuthUrl(url, "userinfo");
                                //} else if (option_subscribe) {
                                //	alert('您未关注此公众帐号，请先关注公众帐号以后再使用本功能！');
                                location.href = subscribe_link;
                                //} else {
                                //	alert('error option_subscribe!');
                                //}
                            } else if (userinfo_data.ErrorCode == 0) {
                                GetMemberInfo(userinfo_data);
                            } else {
                                alert(userinfo_data.ErrorMsg);
                            }
                        }
                    });
                } else if (openid_data.UserToken.scope.indexOf("snsapi_userinfo") >= 0) {
                    var getauthinfo_url = webroot + "WebServices/WeChatApi.aspx?v=getauthcusinfo&openid=" + openid + "&token=" + access_token + "&state=" + com_openid;
                    $.ajax({
                        type: "get", dataType: "json", url: getauthinfo_url, data: "",
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            alert('获取数据失败，请关闭页面以后重新访问！'); //alert(XMLHttpRequest.status); alert(XMLHttpRequest.readyState); alert(textStatus);
                        },
                        success: function (userinfo_data) {
                            if (userinfo_data.ErrorCode == 0) {
                                GetMemberInfo(userinfo_data);
                            } else {
                                alert(userinfo_data.ErrorMsg);
                            }
                        }
                    });
                } else {
                    alert('错误的scope参数值，scope:' + openid_data.UserToken.scope);
                }
            }
        });
    }
    WechatNavigateSetting();
}


/*设置微信浏览器*/
function WechatNavigateSetting() {
	document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
		//隐藏下方工具栏，需要显示顶部导航栏，请把hideToolbar换成showToolbar
		if (option_hideToolbar) {
			WeixinJSBridge.call('hideToolbar');
		}
		//隐藏右上角菜单，需要显示请把hideOptionMenu换成showOptionMenu
		if (option_hideOptionMenu) {
			WeixinJSBridge.call('hideOptionMenu');
		}
	});
}

/*获取授权url，然后将当前页面转到oauth2页面*/
function RedirectAuthUrl(url) {
	var type = arguments[1] || "";
	var getauth_url = webroot + "WebServices/WeChatApi.aspx?v=getauthurl&url=" + domain + url + "&state=" + com_openid + "&type=" + type;
	$.ajax({
		type: "get", dataType: "json", url: getauth_url, data: "",
    	error: function (XMLHttpRequest, textStatus, errorThrown) {
    		alert('获取数据失败，请关闭页面以后重新访问！');
    	},
    	success: function (auth_data) {
    		if (auth_data.ErrorCode == 0) {
    			location.href = auth_data.AuthPageUrl;
    		} else {
    			alert(auth_data.ErrorMsg);
    			location.href = domain + url;
        	}
        }
    });
}

/*获取url参数*/
function GetRequest() {
	var url = location.search; //获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		var params = str.split("&");
		for (var i = 0; i < params.length; i++) {
			theRequest[params[i].split("=")[0]] = unescape(params[i].split("=")[1]);
		}
	}
	return theRequest;
}