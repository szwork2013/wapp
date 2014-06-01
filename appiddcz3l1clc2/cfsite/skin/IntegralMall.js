/*================================================== 积分商城 ==================================================*/

/*定义商品信息列表页模板*/
var goodsListHtml = '<li><a href="integral_txt.shtml?GoodsID=$ID$"><p class="property_logo1">$Pic$</p><p class="property_tit f16 black">$Title$</p><p class="property_tit1 f12">兑换分值：$Score$分</p><p class="property_tit1 f12">人气值：$Popularity$</p><span>立即兑换</span></a></li>';

/*获取商品信息列表*/
function getGoodsList(page) {
    var condition = "";
    //var condition = $("#tbSearch").val();
    var htmlList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getgoodslist", "Page": page, "Condition": condition },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () {
            $("#divLoadMore").hide();
            $("#divLoading").show();
            $("#divAtLast").hide();
            $("#GetMoreInfo").attr("href", "javascript:void(0)");
        },
        success: function (statuback) {
            //alert(statuback.pageindex);
            if (statuback.rows.length < 1) {
                $(".property_list ul").html("<li>暂无相关商品信息</li>");
                $("#ShowList").html('<a><p>暂无相关信息</p></a>');
                $("#divLoadMore").hide();
                $("#divLoading").hide();
                $("#divAtLast").show();
                $("#GetMoreInfo").attr("href", "javascript:void(0)");
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += goodsListHtml;

                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].id));
                if (unescape(statuback.rows[i].smimg) != "") {
                    htmlList = htmlList.replace("$Pic$", "<img src=\"" + unescape(statuback.rows[i].smimg) + "\" width=\"97\" height=\"80\">");
                }
                else {
                    htmlList = htmlList.replace("$Pic$", "<span class=\"fw f14\">暂无图片</span>");
                }

                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].title));
                htmlList = htmlList.replace("$Score$", unescape(statuback.rows[i].score));
                htmlList = htmlList.replace("$Popularity$", unescape(statuback.rows[i].buynumber));
            }

            //搜索或第一页为重新显示，其他为持续加载
            if (page == 1) {
                $(".property_list ul").html(htmlList);
            }
            else {
                if (page > statuback.pagecount) {
                    return;
                }
                else {
                    $(".property_list ul").append(htmlList);
                }
            }
            if (statuback.pagecount > page) {
                $("#GetMoreInfo").attr("href", "javascript:getGoodsList(" + (statuback.pageindex + 1) + ")");
                $("#divLoadMore").show();
                $("#divLoading").hide();
                $("#divAtLast").hide();
            }
            else {
                $("#GetMoreInfo").removeAttr("href");
                $("#divLoadMore").hide();
                $("#divLoading").hide();
                $("#divAtLast").show();
            }
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });
}

/*定义商品详细页模板*/
var goodsDetailHtml = '<div class="commodity_txt"><div class=" shoptxt_m " style=" height:172px;"><div class="shoptxt_banner"><div class="sliderContainer"><div class="iosSlider"><ul class="slider ">$BigImgList$</ul></div></div></div></div><p class="explain clearfix f14">图片仅供参考，积分兑换礼品以实物为准；<br/>礼品颜色随机选取</p><p class="b f20">$Title$</p><p class="f14">兑换分值：<span>$Score$分</span></p><p class="f14">人气值：<span>$Popularity$</span></p><p class="f14">兑换份数：<a class="fh" href="javascript:reduceCount()">-</a><span class="num" id="GetCount">1</span><a class="fh" href="javascript:increaseCount()">+</a><span class="f12 red leave">剩余<font id="RemainCount">$RemainCount$</font></span></p><p class="f14">领取方式：包邮<span class="f12 s1">（万客会工作人员会于10个工作日内为您寄出礼品）</span></p></div><div class="clearfix commodity_txtBtn"><a class="commodity_txtBtnBg" href="javascript:exchangeGoods($ID$)">立即兑换</a><a class="commodity_txtBtnBg" href="integral.shtml">返回</a></div>';

/*定义商品大图模板*/
var bigImgList = '<li><img src="$BigImg$" width="312"/></li>';

/*获取商品详细信息*/
function getGoodsInfo(goodsID) {
    var htmlList = "";
    var scrollList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getgoodsinfo", "GoodsID": goodsID },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { },
        success: function (statuback) {
            //alert(statuback.pageindex);
            if (statuback.rows.length < 1) {
                window.location.href = "integral.shtml";
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += goodsDetailHtml;
                var imgList = unescape(statuback.rows[i].bigimg).split('|');
                for (var j = 0; j < imgList.length; j++) {
                    scrollList += bigImgList;
                    scrollList = scrollList.replace("$BigImg$", imgList[j]);
                }
                htmlList = htmlList.replace("$BigImgList$", scrollList);
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].title));
                htmlList = htmlList.replace("$Score$", unescape(statuback.rows[i].score));
                htmlList = htmlList.replace("$Popularity$", unescape(statuback.rows[i].buynumber));
                htmlList = htmlList.replace("$RemainCount$", unescape(statuback.rows[i].num));
                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].id));
            }
            $("#GoodsDetail").html(htmlList);
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });

    autoScaling("#GoodsDetail img", 312, 172);

    if ($(".slider li").length > 1) {
        dobannerdown();
    }
}

/*商品兑换*/
function exchangeGoods(goodsID) {
    var allData = "GoodsID=" + goodsID + "&GoodsCount=" + $("#GetCount").html();
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=exchangegoods", allData, function (response) {
        if (response.ErrorCode == 0) {
            alert(response.ErrorMsg);
        }
        else if (response.ErrorCode == -1) {
            //微信授权码失效
            alert(response.ErrorMsg);
            return;
        }
        else if (response.ErrorCode == -2) {
            //未绑定
            alert(response.ErrorMsg);
            window.location.href = "/mobile/activation_r2.shtml?ReturnURL=/mobile/member.shtml";
            return;
        }
        else {
            //其他错误
            alert(response.ErrorMsg);
            return;
        }
    }, "json");
}