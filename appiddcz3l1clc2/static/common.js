/*================================================== 全局变量 ==================================================*/

/*定义用户ID*/
var cusOpenID = "";
/*定义服务号ID*/
var comOpenID = "gh_7a1ef7027cb7";
/*定义当前页数*/
var curPage = 1;

/*================================================== 通用方法 ==================================================*/

/*跳转至认证页面*/
function goAuthentication(type) {
    var temp = getParameter("?");
    switch (type) {
        case 1:
            window.location = "activation_r1.shtml?" + temp;
            break;
        case 2:
            window.location = "activation_r2.shtml?" + temp;
            break;
    }
}

/*跳转至注册页面*/
function goRegister() {
    var temp = getParameter("?");
    window.location = "activation_zc.shtml?" + temp;
}

/*跳转至指定页面*/
function goToURL() {
    var returnURL = getParameterByName("ReturnURL");
    window.location = returnURL;
}

/*身份证详细验证*/
function checkIdCardNumber(idcard) {
    var Errors = new Array("验证通过", "身份证号码位数不对", "出生日期超出范围或含有非法字符", "身份证号码校验错误", "身份证地区非法");
    var area = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" };

    var idcard, Y, JYM;
    var S, M;
    var idcard_array = new Array();
    idcard_array = idcard.split("");
    //地区检验
    if (area[parseInt(idcard.substr(0, 2))] == null) {
        return Errors[4];
    }
    //身份号码位数及格式检验
    switch (idcard.length) {
        case 15:
            if ((parseInt(idcard.substr(6, 2)) + 1900) % 4 == 0 || ((parseInt(idcard.substr(6, 2)) + 1900) % 100 == 0 && (parseInt(idcard.substr(6, 2)) + 1900) % 4 == 0)) {
                ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/; //测试出生日期的合法性
            }
            else {
                ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/; //测试出生日期的合法性
            }
            if (idcard == "111111111111111") {
                return Errors[3];
            }
            else if (ereg.test(idcard)) {
                return Errors[0];
            }
            else {
                return Errors[2];
            }
            break;
        case 18:
            //18位身份号码检测
            //出生日期的合法性检查 
            //闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
            //平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
            if (parseInt(idcard.substr(6, 4)) % 4 == 0 || (parseInt(idcard.substr(6, 4)) % 100 == 0 && parseInt(idcard.substr(6, 4)) % 4 == 0)) {
                ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式
            }
            else {
                ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式
            }
            if (ereg.test(idcard)) {//测试出生日期的合法性
                //计算校验位
                S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 + parseInt(idcard_array[7]) * 1 + parseInt(idcard_array[8]) * 6 + parseInt(idcard_array[9]) * 3;
                Y = S % 11;
                M = "F";
                JYM = "10X98765432";
                M = JYM.substr(Y, 1); //判断校验位
                if (M == idcard_array[17]) {
                    //检测ID的校验位
                    return Errors[0];
                }
                else {
                    return Errors[3];
                }
            }
            else {
                return Errors[2];
            }
            break;
        default:
            return Errors[1];
            break;
    }
}

/*检查单选按钮*/
function checkRadio(radioName, spanID, errTxt) {
    var objSpan = $("#" + spanID);
    var cbValue = $("input[name='" + radioName + "']:radio:checked").length;
    if (cbValue == 0) {
        objSpan.html(errTxt);
        objSpan.show();
        return false;
    }
    else {
        objSpan.html("");
        objSpan.hide();
        return true;
    }
}

/*检查复选框*/
function checkCheckBox(cbName, spanID, errTxt) {
    var objSpan = $("#" + spanID);
    var cbValue = $("input[name='" + cbName + "']:checkbox:checked").length;
    if (cbValue == 0) {
        objSpan.html(errTxt);
        objSpan.show();
        return false;
    }
    else {
        objSpan.html("");
        objSpan.hide();
        return true;
    }
}

/*根据参数名称获取URL参数*/
function getParameter(param) {
    var query = window.location.search;
    var iLen = param.length;
    var iStart = query.indexOf(param);
    if (iStart == -1)
        return "";
    iStart += iLen;
    return query.substring(iStart, query.length);
}

/*根据参数名称获取URL参数*/
function getParameterByName(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

/*判断该信息是否最新*/
function checkInfoNew(year, month, day) {
    //设定判断为最新的天数
    var setNewDays = 3;
    //获取当前时间
    var dateNow = new Date();
    //获取日期(month数，从0开始)
    var addDate = new Date(year, month - 1, day);
    //计算时间差
    var diffTemp = (dateNow - addDate) / 86400000;
    //返回绝对值
    var diffDays = Math.abs(diffTemp);
    //3天内的，均为最新
    if (diffDays < setNewDays) {
        return 1;
    }
    else if (diffDays > setNewDays * 10) {
        return 0;
    }
    else {
        return 2;
    }
}

/*图片自适应*/
function autoScaling(rq, wd, he) {
    $.each($(rq), function () {//把"content"修改为内容页显示内容的DIV的ID属性值
        var image = new Image();
        $(this).hide();
        var obj = $(this);
        image.onload = function () {
            if (image.width > 0 && image.height > 0) {
                if (image.width / image.height >= (wd / he))//把对应比例的宽高写进去即可
                {
                    //宽度处理
                    if (image.width >= wd && image.height >= he) {//三处"600"修改为需要等比例缩小的最大图片宽度
                        obj.attr('width', wd);
                        obj.attr('height', (image.height * wd) / image.width);
                        var aa = parseInt(he - image.height * wd / image.width);
                        if (aa >= 0) {
                            obj.css("padding-top", aa / 2);
                        }
                    }
                    else if (image.width < wd && image.height < he) {
                        if (wd / image.width > he / image.height) {
                            obj.attr('width', image.width);
                            obj.attr('height', image.height);
                            obj.css("padding-top", (he - image.height) / 2);
                            obj.css("padding-left", (wd - image.width) / 2);
                        }
                        else {
                            obj.attr('width', image.width);
                            obj.attr('height', image.height);
                            obj.css("padding-top", (he - image.height) / 2);
                            obj.css("padding-left", (wd - image.width) / 2);
                        }
                    }
                    else if (image.width > wd && image.height < he) {
                        obj.attr('width', wd);
                        obj.attr('height', (image.height * wd) / image.width);
                        var bb = (image.height * wd) / image.width;
                        obj.css("padding-top", (he - bb) / 2);
                    }
                    else {
                        return false;
                    }
                }
                else {
                    //高度处理
                    if (he == 0 && wd >= image.width) {
                        obj.attr('height', image.height);
                        obj.attr('width', image.width);
                        obj.css("padding-left", (wd - image.width) / 2);
                    }
                    else if (he == 0 && wd < image.width) {
                        obj.attr('height', image.height * wd / image.width);
                        obj.attr('width', wd);
                    }
                    else if (image.width >= wd && image.height >= he) {//三处"600"修改为需要等比例缩小的最大图片宽度
                        obj.attr('height', he);
                        obj.attr('width', (image.width * he) / image.height);
                        obj.css("padding-top", (he - image.height) / 2);
                        obj.css("padding-left", (wd - (image.width * he) / image.height) / 2);
                    }
                    else if (image.width < wd && image.height < he) {
                        obj.attr('width', image.width);
                        obj.attr('height', image.height);
                        obj.css("padding-top", (he - image.height) / 2);
                        obj.css("padding-left", (wd - image.width) / 2);
                    }
                    else if (image.width > wd && image.height < he) {
                        obj.attr('width', wd);
                        obj.attr('height', (image.height * wd) / image.width);
                        var bb = (image.height * wd) / image.width;
                        obj.css("padding-top", (he - bb) / 2);
                    }
                    else {
                        obj.attr('height', he);
                        obj.attr('width', (image.width * he) / image.height);
                        obj.css("padding-top", (he - image.height) / 2);
                        obj.css("padding-left", (wd - (image.width * he) / image.height) / 2);
                    }
                }
            }
            obj.show();
        }
        image.src = $(this).attr('src');
    });
}

/*新浪微博*/
function shareTSina(title, rLink, site, pic) {
    window.open('http://service.weibo.com/share/share.php?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(rLink) + '&appkey=' + encodeURIComponent(site) + '&pic=' + encodeURIComponent(pic), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

/*腾讯微博*/
function shareToWb(title, rLink, site, pic) {
    window.open('http://v.t.qq.com/share/share.php?url=' + encodeURIComponent(rLink) + '&title=' + encodeURI(title) + '&appkey=' + encodeURI(site) + '&pic=' + encodeURI(pic), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

/*人人*/
function shareRR(title, rLink, summary) {
    window.open('http://widget.renren.com/dialog/feed?title=' + encodeURIComponent(title) + '&link=' + encodeURIComponent(rLink) + '&description=' + encodeURIComponent(summary), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes');
}

/*开心网*/
function shareKX(title, rLink, summary) {
    window.open('http://www.kaixin001.com/repaste/bshare.php?rtitle=' + encodeURIComponent(title) + '&rurl=' + encodeURIComponent(rLink) + '&rcontent=' + encodeURIComponent(summary), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

/*QQ空间*/
function shareQzone(title, rLink, summary, site, pic) {
    window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(rLink) + '&summary=' + encodeURIComponent(summary) + '&site=' + encodeURIComponent(site) + '&pics=' + encodeURIComponent(pic), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

/*百度*/
function shareBaiDu(title, rLink) {
    window.open('http://apps.hi.baidu.com/share?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(rLink), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

/*豆瓣*/
function shareDouBan(title, rLink) {
    window.open('http://www.douban.com/recommend?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(rLink), '_blank', 'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes')
}

$(function(){
    $('#form1').submit(function(){
        return false;
    })

})
