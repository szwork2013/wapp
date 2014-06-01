/*================================================== 个人中心 ==================================================*/

/*获取会员信息*/
function getMemberInfo() {
    var allData = "";
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=getuserinfo", allData, function (response) {
        //alert(response.ErrorCode);
        if (response.ErrorCode == 0) {
            $("#MemberName").html(response.MemberName);
            $("#MemberPic").attr("src", response.MemberPic);
            $("#IDNumber").html(response.IDNumber);
            if (response.ActiveLevel != "") {
                $("#ActiveLevel").html("活跃级别：" + response.ActiveLevel);
            }
            else {
                $("#ActiveLevel").html("活跃级别：暂无");
            }
            if (response.SignInState == 1) {
                $("#HasSignIn").show();
                $("#ShowSignIn").hide();
            }
            else {
                $("#HasSignIn").hide();
                $("#ShowSignIn").show();
            }
            switch (response.MemberType) {
                case 1:
                    //蓝卡
                    $("#ShowMemberType").addClass("card01");
                    $("#ShowBlueRight").show();
                    $("#ShowGoldenRight").hide();
                    break;
                case 3:
                    //金卡
                    $("#ShowMemberType").addClass("card02");
                    $("#ShowBlueRight").hide();
                    $("#ShowGoldenRight").show();
                    break;
                default:
                    $("#ShowMemberType").addClass("card01");
                    $("#ShowBlueRight").show();
                    $("#ShowGoldenRight").hide();
                    alert("未验证会员");
                    break;
            }
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

/*获取积分详情*/
function getMemberScoreInfo() {
    var allData = "";
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=getuserscore", allData, function (response) {
        if (response.ErrorCode == 0) {
            $("#ActiveScore").html(response.ActiveScore + "分");
            $("#JoinScore").html(response.JoinScore + "分");
            $("#WechatScore").html(response.WechatScore + "分");
            $("#MagazineScore").html(response.MagazineScore + "分");
            $("#BirthdayScore").html(response.BirthdayScore + "分");
            $("#OnlineScore").html(response.OnlineScore + "分");
            $("#GameScore").html(response.GameScore + "分");
            $("#SumScore").html(response.TotalScore);
            $("#OtherScore").html(response.OtherScore + "分");
            $("#TotalScore").html(response.TotalScore + "分");
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

/*签到方法*/
function signIn() {
    var allData = "";
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=signin", allData, function (response) {
        if (response.ErrorCode == 0) {
            $("#HasSignIn").show();
            $("#ShowSignIn").hide();
            getSignInRecord();
            getMemberScoreInfo();
            alert(response.ErrorMsg);
            return;
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

/*获取签到记录*/
function getSignInRecord() {
    //    var allData = "QueryDate=" + $("#ShowMonth").attr("ShowDate");
    //    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=getsigninrecord", allData, function (response) {
    //        if (response.ErrorCode == 0) {
    //            alert(response.SignInList.length);
    //            //{"ErrorCode":0,"ErrorMsg":"签到信息获取成功！","SignInList":[{"SignInTime":"12"},"SignInTime":"13"},}],"SignCount":"2","SignScore":"0}
    //            $("#ShowSignCount").html(response.SignCount);
    //            $("#ShowSignScore").html(response.SignScore);
    //            for (var i = 0; i < response.SignInList.length; i++) {
    //                $(".slider_date li").each(function (j) {
    //                    //if (response.SignInList[i].SignInTime.split('/')[2].substr(0, 2) == $(this).html()) {
    //                    if (response.SignInList[i].SignInTime == $(this).html()) {
    //                        $(this).addClass("sign");
    //                    }
    //                });
    //            }
    //            return;
    //        }
    //        else if (response.ErrorCode == -1) {
    //            //微信授权码失效
    //            alert(response.ErrorMsg);
    //            return;
    //        }
    //        else if (response.ErrorCode == -2) {
    //            //未绑定
    //            alert(response.ErrorMsg);
    //            window.location.href = "/mobile/activation_r2.shtml?ReturnURL=/mobile/member.shtml";
    //            return;
    //        }
    //        else {
    //            //其他错误
    //            alert(response.ErrorMsg);
    //            return;
    //        }
    //    }, "json");

    $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx?callback=?",
        type: "Post",
        data: { "Type": "getsigninrecord", "QueryDate": $("#ShowMonth").attr("ShowDate") },
        dataType: "jsonp",
        jsonp: "callback",
        async: false,
        cache: false,
        beforeSend: function () { },
        success: function (response) {
            if (response.ErrorCode == 0) {
                //{"ErrorCode":0,"ErrorMsg":"签到信息获取成功！","SignInList":[{"SignInTime":"12"},{"SignInTime":"13"}],"SignCount":"2","SignScore":0}
                $("#ShowSignCount").html(response.SignCount);
                $("#ShowSignScore").html(response.SignScore);
                for (var i = 0; i < response.SignInList.length; i++) {
                    $(".slider_date li a").each(function (j) {
                        //if (response.SignInList[i].SignInTime.split('/')[2].substr(0, 2) == $(this).html()) {
                        if (response.SignInList[i].SignInTime == $(this).html()) {
                            $(this).addClass("sign");
                        }
                    });
                }
                return;
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
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#ShowSignIn").attr("href", "javascript:signIn()");
            alert(XMLHttpRequest.status);
            alert(textStatus);
            errorThrown;
        }
    });
}

/*获取会员个人资料*/
function getPersonalInfo() {
    alert("重要提醒：万客会将严格按照《商品房买卖合同》上的电话和地址，不定期为您寄送各种重要资料及刊物，请确保的电话和地址信息有效。如您通过万客会网站修改电话和地址，将视为您同意和《商品房买卖合同》的信息同步更新，一经更改，即刻生效。");
    var allData = "";
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=getpersoninfo", allData, function (response) {
        if (response.ErrorCode == 0) {
            $("#RealName").html(response.RealName);
            $("#IDType").html(response.IDType);
            $("#IDNumber").html(response.IDNumber);
            $("#reg_input_text01").val(response.MobileNum);
            $("#reg_input_text01").attr("OldMobileNum", response.MobileNum);
            $("#reg_input_text02").val(response.Address);
            $("#reg_input_text03").val(response.Email);
            $("#reg_input_text03").attr("OldEmail", response.Email);
            $("#reg_input_text04").val(response.Profession);
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

/*验证手机号码*/
function updMobileNum() {
    var controlTemp = document.getElementById("reg_input_text01");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text01").val() == "" || $("#reg_input_text01").val() == "请输入11位手机号码") {
        $("#reg_input_text01").val("请输入11位手机号码");
        $("#divMobileNum").attr("class", "input_text02_box_err");
        $("#wMobileNum").html("必填");
        $("#wMobileNums").html("请输入11位手机号码<span></span>");
        return false;
    }
    else {
        var patrn = eval('/^1[3,4,5,8]{1}[0-9]{9}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            if ($("#reg_input_text01").attr("OldMobileNum") == controlTemp.value) {
                //值相同
                $("#divMobileNum").attr("class", "input_text02_box_ok");
                $("#wMobileNum").html("正确");
                $("#wMobileNums").html("如您需要修改手机号码，将视为您同意和《商品房买卖合同》的信息同步更新，一经更改，即刻生效。<span></span>");
                return true;
            }
            else {
                return updMobileExists();
            }
        }
        else {
            $("#divMobileNum").attr("class", "input_text02_box_err");
            $("#wMobileNum").html("错误");
            $("#wMobileNums").html("请输入11位手机号码<span></span>");
            return false;
        }
    }
}

/*验证手机号码存在*/
function updMobileExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("MobileNum|" + $("#login_input_text01").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "0") {
        $("#divMobileNum").attr("class", "input_text02_box_ok");
        $("#wMobileNum").html("正确");
        $("#wMobileNums").html("如您需要修改手机号码，将视为您同意和《商品房买卖合同》的信息同步更新，一经更改，即刻生效。<span></span>");
        return true;
    }
    else {
        $("#divMobileNum").attr("class", "input_text02_box_err");
        $("#wMobileNum").html("错误");
        $("#wMobileNums").html("该手机号已存在<span></span>");
        return false;
    }
}

/*验证通讯地址*/
function updAddress() {
    var controlTemp = document.getElementById("reg_input_text02");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text02").val() == "" || $("#reg_input_text02").val() == "请输入您的通讯地址") {
        $("#reg_input_text02").val("请输入您的通讯地址");
        $("#divAddress").attr("class", "input_text02_box_err");
        $("#wAddress").html("错误");
        $("#wAddresses").html("请输入您的通讯地址，6个字符以上<span></span>");
        return false;
    }
    else {
        if (controlTemp.value.length < 6) {
            $("#divAddress").attr("class", "input_text02_box_err");
            $("#wAddress").html("错误");
            $("#wAddresses").html("请输入您的通讯地址，6个字符以上<span></span>");
            return false;
        }
        else {
            $("#divAddress").attr("class", "input_text02_box_ok");
            $("#wAddress").html("正确");
            $("#wAddresses").html("如您需要修改通讯地址，将视为您同意和《商品房买卖合同》的信息同步更新，一经更改，即刻生效。<span></span>");
            return true;
        }
    }
}

/*验证邮箱地址*/
function updEmail() {
    var controlTemp = document.getElementById("reg_input_text03");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text03").val() == "" || $("#reg_input_text03").val() == "请输入您的常用邮箱") {
        $("#login_input_text04").val("请输入您的常用邮箱");
        $("#divEmail").attr("class", "input_text02_box_err");
        $("#wEmail").html("必填");
        $("#wEmails").html("请输入您的常用邮箱<span></span>");
        $("#wEmails").show();
        return false;
    }
    else {
        var patrn = eval('/^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            if ($("#reg_input_text03").attr("OldEmail") == controlTemp.value) {
                //值相同
                $("#divEmail").attr("class", "input_text02_box_ok");
                $("#wEmail").html("正确");
                $("#wEmails").html("请输入您的常用邮箱<span></span>");
                $("#wEmails").hide();
                return true;
            }
            else {
                return updEmailExists();
            }
        }
        else {
            $("#divEmail").attr("class", "input_text02_box_err");
            $("#wEmail").html("错误");
            $("#wEmails").html("请输入您的常用邮箱<span></span>");
            $("#wEmails").show();
            return false;
        }
    }
}

/*验证邮箱存在*/
function updEmailExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("Email|" + $("#reg_input_text03").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "0") {
        $("#divEmail").attr("class", "input_text02_box_ok");
        $("#wEmail").html("正确");
        $("#wEmails").html("请输入您的常用邮箱<span></span>");
        $("#wEmails").hide();
        return true;
    }
    else {
        $("#divEmail").attr("class", "input_text02_box_err");
        $("#wEmail").html("错误");
        $("#wEmails").html("该邮箱已被使用<span></span>");
        $("#wEmails").show();
        return false;
    }
}

/*验证从事行业*/
function updProfession() {
    var controlTemp = document.getElementById("reg_input_text04");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text04").val() == "" || $("#reg_input_text04").val() == "请输入您从事的行业") {
        $("#reg_input_text04").val("请输入您从事的行业");
        $("#divProfession").attr("class", "input_text02_box_err");
        $("#wProfession").html("错误");
        $("#wProfessions").html("请输入您从事的行业<span></span>");
        $("#wProfessions").show();
        return false;
    }
    else {
        $("#divProfession").attr("class", "input_text02_box_ok");
        $("#wProfession").html("正确");
        $("#wProfessions").html("请输入您从事的行业<span></span>");
        $("#wProfessions").hide();
        return true;
    }
}

/*提交前全局验证*/
function preCheckUpdate() {
    var err = 0;
    if (!updMobileNum()) err++;
    if (!updAddress()) err++;
    if (!updEmail()) err++;
    if (!updProfession()) err++;
    if (err > 0)
        return false;
    else
        return true;
}

/*更新会员信息*/
function updateInfo() {
    if (!preCheckUpdate()) {
        return;
    }

    var mobileNum = $("#reg_input_text01").val();
    var address = $("#reg_input_text02").val();
    var email = $("#reg_input_text03").val();
    var profession = $("#reg_input_text04").val();

    var allData = 'MobileNum=' + mobileNum + '&Address=' + escape(address) + '&Email=' + email + '&Profession=' + escape(profession);
    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=updateinfo", allData, function (response) {
        if (response.ErrorCode == 0) {
            alert(response.ErrorMsg);
            window.location.href = "member.shtml";
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