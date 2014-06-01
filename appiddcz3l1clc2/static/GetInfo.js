/*=================================================== 新闻中心 ===================================================*/

/*定义新闻列表页模板*/
var newsListHtml = '<li class="newslist"><a href="news_txt.shtml?NewsID=$ID$"><p class="thelist_pic">$Pic$</p><p class="thelist_tit f16 black">$Title$</p><p class="thelist_txt f12 black2">$Remark$</p><!--<p class="news_z3 f10">$AgreeCount$</p><p class="news_l3 f10">$CommentCount$</p>--></a></li>';

/*获取新闻列表*/
function getNewsList(page) {
    var condition = $("#tbSearch").val();
    var htmlList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getinfolist", "Page": page, "ClassID": 1, "Condition": condition },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () {
            //$("#thelist").html("<li>数据加载中……</li>");
        },
        success: function (statuback) {
            //alert(statuback.pageindex);

            if (statuback.rows.length < 1) {
                //$("li").remove(".newslist");
                curPage = 1;
                $("#thelist .newslist").remove();
                $("#thelist").append("<li class=\"newslist\">暂无相关新闻</li>");
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += newsListHtml;
                //htmlList = htmlList.replace("$Url$", unescape(statuback.rows[i].FilePath));
                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].Id));
                if (unescape(statuback.rows[i].SmallImg) != "") {
                    htmlList = htmlList.replace("$Pic$", "<img src=\"" + unescape(statuback.rows[i].SmallImg) + "\" width=\"80\" height=\"80\">");
                }
                else {
                    htmlList = htmlList.replace("$Pic$", "<span class=\"fw f14\">暂无图片</span>");
                }

                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$Remark$", unescape(statuback.rows[i].ShortContent));
                htmlList = htmlList.replace("$AgreeCount$", unescape(statuback.rows[i].AgreeCount));
                htmlList = htmlList.replace("$CommentCount$", unescape(statuback.rows[i].CommentCount));
            }

            //搜索或第一页为重新显示，其他为持续加载
            if (page == 1) {
                curPage = page + 1;
                //$("li").remove(".newslist");
                $("#thelist .newslist").remove();
                $("#thelist").append(htmlList);
            }
            else {
                if (page > statuback.pagecount) {
                    return;
                }
                else {
                    curPage = page + 1;
                    $("#thelist").append(htmlList);
                }
            }
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });
}

/*定义新闻列表页Banner模板*/
var newsBannerHtml = '<li><!--<a href="news_txt.shtml?NewsID=$ID$">--><img src="$Pic$" width="312" height="150"><p class="slider2_box"></p><p class="slider2_tit white f14">$Title$</p><!--<p class="news_z f10">$AgreeCount$</p><p class="news_l f10">$CommentCount$</p>--><!--</a>--></li>';

/*获取新闻Banner列表*/
function getNewsBanner() {
    var htmlList = "";
    var tagList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getinfolist", "Page": 1, "ClassID": 4, "Condition": "" },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { },
        success: function (statuback) {
            //alert(statuback.pageindex);

            if (statuback.rows.length < 1) {
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += newsBannerHtml;
                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].Id));
                //htmlList = htmlList.replace("$Url$", unescape(statuback.rows[i].FilePath));
                htmlList = htmlList.replace("$Pic$", unescape(statuback.rows[i].SmallImg));
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$AgreeCount$", unescape(statuback.rows[i].AgreeCount));
                htmlList = htmlList.replace("$CommentCount$", unescape(statuback.rows[i].CommentCount));
                if (i == 0) {
                    tagList += "<div class = 'item selected'></div>";
                }
                else {
                    tagList += "<div class = 'item'></div>";
                }
            }
            $("#thelist .slider2").html(htmlList);
            $(".indicators").html(tagList);
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });
    if ($(".slider2 li").length > 1) {
        dobannerdown2();
    }
}

/*定义新闻详细页模板*/
var newsDetailHtml = '<div data-role="content" class="news_txt_box fw black2 clearfix f14"><h2 class="f16">$Title$</h2>$Content$<!--<p class="news_l5 f10"><a href="#" onclick="commentTo($ID1$,$ParentID1$)" class="bbs_btn">$CommentCount$</a></p><p class="news_z5 f10"><a href="#" onclick="agreeTo($ID$,$ParentID$)">$AgreeCount1$</a></p>--></div>';


/*获取新闻详细信息*/
function getNewsDetail(newsID) {
    var htmlList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getdetailinfo", "NewsID": newsID },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { },
        success: function (statuback) {
            //alert(statuback.pageindex);

            if (statuback.rows.length < 1) {
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += newsDetailHtml;
                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].Id));
                htmlList = htmlList.replace("$ParentID$", "0");
                //htmlList = htmlList.replace("$ID1$", unescape(statuback.rows[i].Id));
                //htmlList = htmlList.replace("$ParentID1$", "0");
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$Content$", unescape(statuback.rows[i].Content));
                htmlList = htmlList.replace("$AgreeCount$", unescape(statuback.rows[i].AgreeCount));
                htmlList = htmlList.replace("$AgreeCount1$", unescape(statuback.rows[i].AgreeCount));
                $("#ShowAgreeCount").html(unescape(statuback.rows[i].AgreeCount));
                //htmlList = htmlList.replace("$CommentCount$", unescape(statuback.rows[i].CommentCount));
            }
            $("#NewsContent").html(htmlList);
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });

    autoScaling("#NewsContent img", 272, 0);
}

/*定义新闻详细页评论模板*/
var newsCommentHtml = '<p class="clearfix"><span class="l"><img src="$UserIcon$" width="166" height="166">$NickName$</span><span class="r black3">$AddTime$</span></p><p>$Content$</p><!--$CommentCount$$AgreeCount$-->';
//<div class="news_bbs clearfix"><p class="clearfix"><span class="l"><img src="$UserIcon$" width="166" height="166">$NickName$</span><span class="r black3">$AddTime$</span></p><p>$Content$</p>$CommentCount$$AgreeCount$</div>
//<p class="news_l6 f10">123</p><p class="news_z6 f10">999+</p>

/*获取新闻详细页评论*/
function getNewsComment(newsID, parentID) {
    var htmlList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getcomment", "NewsID": newsID },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { //$("#thelist").html("<li>数据加载中……</li>");
        },
        success: function (statuback) {
            //alert(statuback.pageindex);

            if (statuback.rows.length < 1) {
                //$("#thelist").html("<li>数据加载中……</li>");
                return;
            }

            var el, div, p, i;
            el = document.getElementById('thelist');

            for (var i = 0; i < statuback.rows.length; i++) {
                div = document.createElement('div');
                //p = document.createElement('p');

                htmlList += newsListHtml;
                htmlList = htmlList.replace("$UserIcon$", unescape(statuback.rows[i].UserIcon));
                htmlList = htmlList.replace("$NickName$", unescape(statuback.rows[i].NickName));
                htmlList = htmlList.replace("$AddTime$", unescape(statuback.rows[i].AddTime));

                htmlList = htmlList.replace("$Content$", unescape(statuback.rows[i].Content));
                htmlList = htmlList.replace("$AgreeCount$", unescape(statuback.rows[i].AgreeCount));
                htmlList = htmlList.replace("$CommentCount$", unescape(statuback.rows[i].CommentCount));

                div.innerHTML = htmlList;
                //el.insertBefore(li, el.childNodes[0]);
                el.appendChild(div, el.childNodes[0]);
            }

            curPage = page + 1;
            //$("#thelist").append(htmlList);
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });

    $(".news_txt_box div").addClass("news_bbs clearfix");
}

/*显示评论*/
function showComment(newsID, parentID) {
    $("").attr("click", "commentTo(" + newsID + "," + parentID + ")");
}

/*评论*/
function commentTo(newsID, parentID) {

}

/*点赞*/
function agreeTo(newsID, parentID) {

}

/*============================================== 最新优惠、会员活动 ==============================================*/

/*定义列表页模板*/
var tempListHtml = '<li><a href="$URL$.shtml?NewsID=$ID$">$NewOrEnd$<p class="activit_pic">$Pic$</p><p class="activit_box01 white">$Title$</p><p class="activit_txt01 f14 black2">$Remark$</p><!--<p class="activit_txt02 f12 black3">$AgreeCount$人关注</p>--></a></li>';

/*定义当前类别*/
var curClass = 0;

/*获取列表页面*/
function getInfoList(page, classid) {
    var condition = $("#tbSearch").val();
    curClass = classid;
    var htmlList = "";
    $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getinfolist", "Page": page, "ClassID": classid, "Condition": condition },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { //$("#thelist").html("<li>数据加载中……</li>");
        },
        success: function (statuback) {
            //alert(statuback.pageindex);
            if (statuback.rows.length < 1) {
                $("#thelist").html("<li>暂无相关信息</li>");
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += tempListHtml;
                switch (classid) {
                    case 2:
                        htmlList = htmlList.replace("$URL$", "activities_txt");
                        break;
                    case 3:
                        htmlList = htmlList.replace("$URL$", "discount_txt");
                        break;
                }
                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].Id));
                if (unescape(statuback.rows[i].SmallImg) != "") {
                    htmlList = htmlList.replace("$Pic$", "<img src=\"" + unescape(statuback.rows[i].SmallImg) + "\" width=\"312\" height=\"150\">");
                }
                else {
                    htmlList = htmlList.replace("$Pic$", "<span class=\"fw f16\">暂无图片</span>");
                }

                //var addDate = unescape(statuback.rows[i].AddTime).split('-');
                var addDate = unescape(statuback.rows[i].AddTime).split('/');
                var addYear, addMonth, addDay;
                if (addDate.length != 3) {
                    //alert('invalid format');
                    htmlList = htmlList.replace("$NewOrEnd$", "");
                }
                else {
                    addYear = addDate[0];
                    addMonth = addDate[1];
                    addDay = addDate[2].substring(0, 2);
                }
                var isNew = checkInfoNew(addYear, addMonth, addDay);
                if (isNew == 1) {
                    htmlList = htmlList.replace("$NewOrEnd$", "<p class=\"sale_home_news\"></p>");
                }
                else if (isNew == 0) {
                    htmlList = htmlList.replace("$NewOrEnd$", "<p class=\"sale_home_news2\"></p>");
                }
                else {
                    htmlList = htmlList.replace("$NewOrEnd$", "");
                }
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$Remark$", unescape(statuback.rows[i].ShortContent));
                htmlList = htmlList.replace("$AgreeCount$", unescape(statuback.rows[i].AgreeCount));
                htmlList = htmlList.replace("$CommentCount$", unescape(statuback.rows[i].CommentCount));
            }

            //搜索或第一页为重新显示，其他为持续加载
            if (page == 1) {
                curPage = page + 1;
                //$("li").remove(".newslist");
                $("#thelist .newslist").remove();
                $("#thelist").append(htmlList);
            }
            else {
                if (page > statuback.pagecount) {
                    return;
                }
                else {
                    curPage = page + 1;
                    $("#thelist").append(htmlList);
                }
            }
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });
}

/*=================================================== 工程进度 ===================================================*/

/*定义工程进度列表页模板*/
var scheduleListHtml = '<div class="e_txt_box fw black2 clearfix f14"><p class="e_txt_box_tit"><span class="l">$AddTime$</span><!--<span class="e_r_y f14 r">$CaseArea$</span>--><span class="r">$CaseName$</span></p><p class="sl"></p><div class="newsImg"><img src="$SmallImg$" width="292" height="173"></div><p>$CasePercent$</p></div>';

/*获取月份列表*/
function setMonthList() {
    $("#selMonth").html("<option value=''>请选择月份</option>");
    if ($("#selYear").val() != "") {
        for (i = 1; i < 13; i++) {
            $("#selMonth").append("<option value='" + i + "'>" + i + "月</option>");
        }
    }
    $("#selMonth").siblings(".ui-btn-inner").children(".ui-btn-text").html("请选择月份");
    getScheduleList(1);
}

/*获取工程进度列表页面*/
function getScheduleList(page) {
    var caseName = $('.e-menubox .hover').attr("CaseName");
    var year = $("#selYear").val();
    var month = $("#selMonth").val();
    var htmlList = "";
    $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getschedule", "Page": page, "CaseName": caseName, "Year": year, "Month": month },
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
                $("#ShowList").html('<div class="e_txt_box fw black2 clearfix f14" style="text-align:center;"><p class="e_txt_box_tit">暂无相关信息</p></div>');
                $("#divLoadMore").hide();
                $("#divLoading").hide();
                $("#divAtLast").show();
                $("#GetMoreInfo").attr("href", "javascript:void(0)");
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += scheduleListHtml;
                htmlList = htmlList.replace("$CaseArea$", unescape(statuback.rows[i].CaseArea));
                htmlList = htmlList.replace("$SmallImg$", (statuback.rows[i].SmallImg));
                //htmlList = htmlList.replace("$CaseName$", unescape(statuback.rows[i].CaseName));
                var caseName = unescape(statuback.rows[i].CaseName).split('(')[1];
                htmlList = htmlList.replace("$CaseName$", caseName.substring(0, caseName.length - 1));
                var addDate = unescape(statuback.rows[i].AddTime).split('-');
                //var addDate = unescape(statuback.rows[i].AddTime).split('/');
                var addYear, addMonth, addDay;
                if (addDate.length != 3) {
                    //alert('invalid format');
                    htmlList = htmlList.replace("$AddTime$", "");
                }
                else {
                    addYear = addDate[0];
                    addMonth = addDate[1];
                    addDay = addDate[2].substring(0, 2);
                    htmlList = htmlList.replace("$AddTime$", addYear + "年" + addMonth + "月" + addDay + "日");
                }
                htmlList = htmlList.replace("$CasePercent$", unescape(statuback.rows[i].CasePercent));
            }

            //搜索或第一页为重新显示，其他为持续加载
            if (page == 1) {
                $("#ShowList").html(htmlList);
            }
            else {
                if (page > statuback.pagecount) {
                    return;
                }
                else {
                    $("#ShowList").append(htmlList);
                }
            }
            if (statuback.pagecount > page) {
                $("#GetMoreInfo").attr("href", "javascript:getScheduleList(" + (statuback.pageindex + 1) + ")");
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

/*=================================================== 联盟商家 ===================================================*/

/*定义联盟商家列表页模板*/
var shopListHtml = '<a href="shop_txt.shtml?ShopID=$ID$">$NewOrEnd$<p class="card_logo">$Pic$</p><!--<p class="card_sale f40 red">$Note1$</p>--><p class="card_tit f16 black">$Title$</p><!--<p class="card_txt f12 black2">$ShopType$<span class="card_txts red">了解详细</span>--></p></a>';

/*获取联盟商家列表页面*/
function getShopList(page) {
    var condition = $("#tbSearch").val();
    var htmlList = "";
    $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getshop", "Page": page, "Condition": condition },
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
                $("#ShowList").html('<a><p>暂无相关信息</p></a>');
                $("#divLoadMore").hide();
                $("#divLoading").hide();
                $("#divAtLast").show();
                $("#GetMoreInfo").attr("href", "javascript:void(0)");
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += shopListHtml;

                htmlList = htmlList.replace("$ID$", unescape(statuback.rows[i].ID));
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$ShopType$", "");
                if (unescape(statuback.rows[i].smimg) != "") {
                    htmlList = htmlList.replace("$Pic$", "<img src=\"" + unescape(statuback.rows[i].smimg) + "\" width=\"128\" height=\"80\" >");
                }
                else {
                    htmlList = htmlList.replace("$Pic$", "<span class=\"fw f14\">暂无图片</span>");
                }
                htmlList = htmlList.replace("$NewOrEnd$", "");
                //var addDate = unescape(statuback.rows[i].AddTime).split('-');
                //                var addDate = unescape(statuback.rows[i].AddTime).split('/');
                //                var addYear, addMonth, addDay;
                //                if (addDate.length != 3) {
                //                    //alert('invalid format');
                //                    htmlList = htmlList.replace("$NewOrEnd$", "");
                //                }
                //                else {
                //                    addYear = addDate[0];
                //                    addMonth = addDate[1];
                //                    addDay = addDate[2].substring(0, 2);
                //                }
                //                var isNew = checkInfoNew(addYear, addMonth, addDay);
                //                if (isNew == 1) {
                //                    htmlList = htmlList.replace("$NewOrEnd$", "<p class=\"sale_home_news\"></p>");
                //                }
                //                else if (isNew == 0) {
                //                    htmlList = htmlList.replace("$NewOrEnd$", "<p class=\"sale_home_news2\"></p>");
                //                }
                //                else {
                //                    htmlList = htmlList.replace("$NewOrEnd$", "");
                //                }
                if (unescape(statuback.rows[i].note1) != "") {
                    htmlList = htmlList.replace("$Note1$", unescape(statuback.rows[i].note1) + "<span class=\"f12\">折</span>");
                }
                else {
                    htmlList = htmlList.replace("$Note1$", "");
                }
            }

            //搜索或第一页为重新显示，其他为持续加载
            if (page == 1) {
                $("#ShowList").html(htmlList);
            }
            else {
                if (page > statuback.pagecount) {
                    return;
                }
                else {
                    $("#ShowList").append(htmlList);
                }
            }
            if (statuback.pagecount > page) {
                $("#GetMoreInfo").attr("href", "javascript:getShopList(" + (statuback.pageindex + 1) + ")");
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

    //autoScaling("#ShowList img", 80, 80);
}

/*定义商家详情模板*/
var shopDetailHtml = '<div class="movie"><img src="$SmallImg$" width="312" /></div><div class="shoptxt_m clearfix"><div class="l movietxt"><p><b class="f16">$Title$</b></p><p class="f14"><span><img src="/mobile/images/location.png" width="10" /></span>$Address$</p></div><div class="redbg r"><a class="moviephone" href="tel:$Phone$">$Phone1$</a></div></div><div class="shoptxt_m clearfix"><div class="timel l"><p class="f12"><span><img src="/mobile/images/clock.png" width="10" /></span>营业时间：$BusinessHours$</p></div><div class="timer r"><p class="f12"><span><img src="/mobile/images/money.png" width="10" /></span>人均消费:<b class="red f16">$Consumption$</b></p></div></div><div class=" shoptxt_m clearfix"><div style="line-height:15px; background:#fff; padding:5px 0;"><table width="270" border="0" cellspacing="0" cellpadding="0" style=" font-size:12px; margin:0 auto;"><tr><td width="20" height="17" nowrap><img src="/mobile/images/car.png" width="10" /></td><td width="70" height="17" nowrap>乘车路线：</td><td width="100" height="17" nowrap>$BusLines$</td></tr></table></div></div><div class="shoptxt_m clearfix"><div class="detail"><h2 class="red f16">优惠详情</h2><p>$Preferential$</p></div></div><!--<div class=" shoptxt_m clearfix"><div class="shoptxt_banner"><div class ="sliderContainer"><div class = "iosSlider"><ul class ="slider">$Note2$</ul></div></div></div></div>--><div class=" shoptxt_m clearfix"><div class="detail"><h2 class="red f16">商户介绍</h2><p>$Introduce$</p></div></div><div class=" shoptxt_m clearfix"><div class="detail"><h2 class="red f16">主推产品</h2><p>$Content$</p></div></div>';

//var shopImgList = '<li><!--<p class="shoptxt_font">图片标题</p>--><img src="$SmallImg$" width="312"/></li>';

/*获取新闻详细信息*/
function getShopDetail(shopID) {
    var htmlList = "";
    var tagList = "";
    $.ajax({
        url: "WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getshopinfo", "ShopID": shopID },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { },
        success: function (statuback) {
            //alert(statuback.pageindex);

            if (statuback.rows.length < 1) {
                return;
            }
            for (var i = 0; i < statuback.rows.length; i++) {
                htmlList += shopDetailHtml;
                htmlList = htmlList.replace("$SmallImg$", unescape(statuback.rows[i].smimg));
                htmlList = htmlList.replace("$Title$", unescape(statuback.rows[i].Title));
                htmlList = htmlList.replace("$Address$", unescape(statuback.rows[i].Address));
                htmlList = htmlList.replace("$Phone$", unescape(statuback.rows[i].phone));
                htmlList = htmlList.replace("$Phone1$", "");
                htmlList = htmlList.replace("$BusinessHours$", unescape(statuback.rows[i].BusinessHours));
                htmlList = htmlList.replace("$Consumption$", unescape(statuback.rows[i].Consumption));
                htmlList = htmlList.replace("$BusLines$", unescape(statuback.rows[i].BusLines));
                htmlList = htmlList.replace("$Preferential$", unescape(statuback.rows[i].Preferential));
                htmlList = htmlList.replace("$Note2$", "");
                htmlList = htmlList.replace("$Introduce$", unescape(statuback.rows[i].Introduce));
                htmlList = htmlList.replace("$Content$", unescape(statuback.rows[i].Content));
            }
            $("#ShopContent").html(htmlList);
        },
        error: function () {
            //window.location = "index.shtml";
        }
    });

    autoScaling(".detail img", 272, 0);
}