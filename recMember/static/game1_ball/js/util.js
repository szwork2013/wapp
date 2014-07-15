var Util = (function () {
    var that;
	var obj = function () {
	    this.ajaxCount = 0;
	    that = this;
	};

	obj.prototype = {
		getQueryString: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return "";
		},

		getApiUrl: function (method, param) {
			var url = Config.Api.replace("{method}", method);
			if (param) {
				if (url.indexOf("?") < 0) url += "?";
				for (var key in param) {
					url += key + "=" + param[key] + "&";
				}
				url = url.substring(0, url.length - 1);
			}
			console.log(url);
			return url;
		},

		info: function (msg) {
			if (top != window) {
				top.Util.info(msg);
				return;
			}

			$(".pop_info").remove();

			var div = document.createElement("div");
			div.className = "pop_info";
			div.style.cssText = "position:fixed;top:20px;left:0;width:100%;text-align:center;z-index:10000;";

			var innerDiv = document.createElement("div");
			innerDiv.style.cssText = "display:inline-block;background-color:rgba(0,0,0,0.8);border-radius:3px;padding:5px 8px;color:white;";
			innerDiv.innerHTML = msg;
			div.appendChild(innerDiv);

			top.document.body.appendChild(div);
			setTimeout(function () {
				top.document.body.removeChild(div);
			}, 3000);
		},

		redirect: function (url, param, isNewWindow) {
			url = this.getRedirectPath(url, param);

			if (!isNewWindow) {
				location.href = url;
			}
			else {
				window.open(url, "newwindow", "fullscreen=yes");
			}
		},

		getRedirectPath: function (url, param) {
			url = Config.RootPath + url;
			while (url.lastIndexOf("?") == url.length - 1
                || url.lastIndexOf("&") == url.length - 1) {
				url = url.substring(0, url.length - 1);
			}

			if (url.indexOf("?") < 0) {
				url += "?";
			} else {
				url += "&";
			}

			if (param) {
				for (var key in param) {
					url += key + "=" + param[key] + "&";
				}
			}
			url += "_rtype=1#mp.weixin.qq.com";

			return url;
		},

		ajax: function ($http, option, callback) {
			var that = this;
			this.showLoading();
		   
			$http(option).success(function (data) {
				that.hideLoading();
				callback(data);
			}).error(function (msg, status) {
			    console.log(msg);
				that.hideLoading();
				//if (status != 0) that.info("请重试");
			});
		},

		getShareParam: function ($http, instanceId) {
			this.ajax($http, {
				method: "get",
				url: this.getApiUrl("GetShareParam", {
					'insId': instanceId
				})
			}, function (data) {
				window.shareParam = data;
			});
		},

		showLoading: function () {
			this.ajaxCount++;

			var loading = top.document.getElementById("loading");
			if (!loading) {
				loading = document.createElement("div");
				loading.id = "loading";
				loading.innerHTML = '<img src="images/loading.gif" />';
				top.document.body.appendChild(loading);
			}
		},

		hideLoading: function () {
			this.ajaxCount--;
			if (this.ajaxCount <= 0) {
				var loading = top.document.getElementById("loading");
				if (loading) {
					top.document.body.removeChild(loading);
				}
				this.ajaxCount = 0;
			}
		},

		alert: function (msg) {
			alert(msg);
		},

		isMobile: function (v) {
		    var reg = /^(1\d{10})$/;
		    return reg.test(v);
		},

		isInteger: function (v) {
		    var reg = /^(\-?\d+)$/;
		    return reg.test(v);
		},

		isEmpty: function (v) {
		    return !v || /^\s*$/.test(v);
		},

		zoomImg: function (src) {
		    var fade = document.createElement("div");
		    fade.style.cssText = "position:fixed;top:0;bottom:0;right:0;left:0;background-color:rgba(0,0,0,0.9);padding:20px 0;";
		    fade.onclick = function () {
		        $(this).remove();
		    }

		    var imgDiv = document.createElement("div");
		    imgDiv.style.cssText = "width:100%;height:100%;background:url(" + src + ") center center no-repeat;background-size:contain;";
		    fade.appendChild(imgDiv);

		    document.body.appendChild(fade);
		},

		getDateString: function (strDate) {
		    var r = /(\d+)/.exec(strDate);
		    if (r) {
		        var date = new Date(parseFloat(r[1]));
		        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		    }

		    return "";
		}
	};

	return new obj();
})();