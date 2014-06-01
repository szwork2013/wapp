/*------------------------------------------------- 手机号认证 -------------------------------------------------*/

/*验证手机号码*/
function authMobile() {
    var controlTemp = document.getElementById("login_input_text02");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text02").val() == "" || $("#login_input_text02").val() == "请输入11位手机号码") {
        $("#login_input_text02").val("请输入11位手机号码");
        $("#divMobile").attr("class", "input_text02_box_err");
        $("#wMobile").html("必填");
        $("#wMobiles").html("请输入11位手机号码<span></span>");
        $("#wMobiles").show();
        return false;
    }
    else {
        var patrn = eval('/^1[3,4,5,8]{1}[0-9]{9}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            return authMobileExists();
        }
        else {
            $("#divMobile").attr("class", "input_text02_box_err");
            $("#wMobile").html("错误");
            $("#wMobiles").html("请输入11位手机号码<span></span>");
            $("#wMobiles").show();
            return false;
        }
    }
}

/*验证手机号码存在*/
function authMobileExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("MobileNum|" + $("#login_input_text02").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "1") {
        $("#divMobile").attr("class", "input_text02_box_ok");
        $("#wMobile").html("正确");
        $("#wMobiles").html("请输入11位手机号码<span></span>");
        $("#wMobiles").hide();
        return true;
    }
    else {
        $("#divMobile").attr("class", "input_text02_box_err");
        $("#wMobile").html("错误");
        $("#wMobiles").html("您的信息不存在，请<a href='javascript:goRegister()'>注册</a><span></span>");
        $("#wMobiles").show();
        return false;
    }
}

/*手机号认证*/
function authByMobile() {
    if (!authMobile()) {
        return;
    }

    $("#anchorAuth").unbind("click");

    var allData = 'MobileNum=' + escape($("#login_input_text02").val());

    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=authentication", allData, function (response) {
        if (response.ErrorCode == 0) {
            $("#login_input_text02").val("请输入11位手机号码");
            $("#divMobile").attr("class", "input_text02_box");
            $("#wMobile").html("必填");
            $("#wMobiles").html("请输入11位手机号码<span></span>");
            $("#wMobiles").hide();
        }
        if (getParameterByName("ReturnURL") != "" && getParameterByName("ReturnURL") != "/") {
            alert("恭喜您，认证成功！");
            goToURL();
        }
        else {
            location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
        }
    }, "json");

    $("#anchorAuth").click(function () {
        authByMobile();
    })
}

/*------------------------------------------------- 身份证认证 -------------------------------------------------*/

/*验证真实姓名*/
function authRealName() {
    var controlTemp = document.getElementById("login_input_text02");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text02").val() == "" || $("#login_input_text02").val() == "请输入您的真实姓名") {
        $("#login_input_text02").val("请输入您的真实姓名");
        $("#divName").attr("class", "input_text02_box_err");
        $("#wNames").html("请输入您的真实姓名<span></span>");
        $("#wNames").show();
        return false;
    }
    else {
        var patrn = eval('/^[\\u4e00-\\u9fa5]{2,6}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            $("#divName").attr("class", "input_text02_box_ok");
            $("#wName").html("正确");
            $("#wNames").html("请输入您的真实姓名<span></span>");
            $("#wNames").hide();
            return true;
        }
        else {
            $("#divName").attr("class", "input_text02_box_err");
            $("#wName").html("错误");
            $("#wNames").html("请输入2-6个中文<span></span>");
            $("#wNames").show();
            return false;
        }
    }
}

/*验证证件号码*/
function authIDNumber() {
    var controlTemp = document.getElementById("login_input_text03");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text03").val() == "" || $("#login_input_text03").val() == "请输入您的证件号码") {
        $("#login_input_text03").val("请输入您的证件号码");
        $("#divIDNumber").attr("class", "input_text02_box_err");
        $("#wIDNumbers").html("请输入您的有效证件号码<span></span>");
        $("#wIDNumbers").show();
        return false;
    }
    else {
        if ($("#selIDType").val() == "A000011") {
            var idState = checkIdCardNumber(controlTemp.value);
            if (idState == "验证通过") {
                return authIdCardExists();
            }
            else {
                $("#divIDNumber").attr("class", "input_text02_box_err");
                $("#wIDNumber").html("错误");
                $("#wIDNumbers").html(idState + "<span></span>");
                $("#wIDNumbers").show();
                return false;
            }
        }
        else {
            return authIdCardExists();
        }
    }
}

/*验证证件号码存在*/
function authIdCardExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("IDNumber|" + $("#login_input_text03").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "1") {
        $("#divIDNumber").attr("class", "input_text02_box_ok");
        $("#wIDNumber").html("正确");
        $("#wIDNumbers").html("请输入您的有效身份证号码<span></span>");
        $("#wIDNumbers").hide();
        return true;
    }
    else {
        $("#divIDNumber").attr("class", "input_text02_box_err");
        $("#wIDNumber").html("错误");
        $("#wIDNumbers").html("您的信息不存在，请<a href='javascript:goRegister()'>注册</a><span></span>");
        $("#wIDNumbers").show();
        return false;
    }
}

/*身份证认证*/
function authByIDNumber() {
    var err = 0;
    if (!authRealName()) err++;
    if (!authIDNumber()) err++;
    if (err > 0) {
        return;
    }

    $("#anchorAuth").unbind("click");

    var allData = 'RealName=' + escape($("#login_input_text02").val()) + '&IDNumber=' + escape($("#login_input_text03").val());

    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=authentication", allData, function (response) {
        //alert(response.ErrorCode + "|" + response.ErrorMsg + "|" + getParameterByName("ReturnURL"));
        if (response.ErrorCode == 0) {
            $("#login_input_text02").val("请输入您的真实姓名");
            $("#divName").attr("class", "input_text02_box");
            $("#wName").html("必填");
            $("#wNames").html("请输入您的真实姓名<span></span>");
            $("#wNames").hide();
            $("#login_input_text03").val("请输入您的证件号码");
            $("#divIDNumber").attr("class", "input_text02_box");
            $("#wIDNumber").html("必填");
            $("#wIDNumbers").html("请输入您的有效证件号码<span></span>");
            $("#wIDNumbers").hide();

            if (getParameterByName("ReturnURL") != "" && getParameterByName("ReturnURL") != "/") {
                alert("恭喜您，认证成功！");
                goToURL();
            }
            else {
                location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
            }
        }
        else {
            location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
        }

    }, "json");

    $("#anchorAuth").click(function () {
        authByIDNumber();
    });
}

/*-------------------------------------------------- 会员入会 --------------------------------------------------*/

/*验证真实姓名*/
function regRealName() {
    return authRealName();
}

/*验证证件号码*/
function regIDNumber() {
    var controlTemp = document.getElementById("login_input_text01");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text01").val() == "" || $("#login_input_text01").val() == "请输入您的证件号码") {
        $("#login_input_text01").val("请输入您的证件号码");
        $("#divIDNumber").attr("class", "input_text02_box_err");
        $("#wIDNumbers").html("请输入您的有效证件号码<span></span>");
        $("#wIDNumbers").show();
        return false;
    }
    else {
        if ($("#selIDType").val() == "A000011") {
            var idState = checkIdCardNumber(controlTemp.value);
            if (idState == "验证通过") {
                return regIdCardExists();
            }
            else {
                $("#divIDNumber").attr("class", "input_text02_box_err");
                $("#wIDNumber").html("错误");
                $("#wIDNumbers").html(idState + "<span></span>");
                $("#wIDNumbers").show();
                return false;
            }
        }
        else {
            return regIdCardExists();
        }
    }
}

/*验证证件号码存在*/
function regIdCardExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("IDNumber|" + $("#login_input_text01").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "0") {
        $("#divIDNumber").attr("class", "input_text02_box_ok");
        $("#wIDNumber").html("正确");
        $("#wIDNumbers").html("请输入您的有效证件号码<span></span>");
        $("#wIDNumbers").hide();
        return true;
    }
    else {
        $("#divIDNumber").attr("class", "input_text02_box_err");
        $("#wIDNumber").html("错误");
        $("#wIDNumbers").html("您已经是会员，请点击<!--<a href='javascript:goAuthentication(1)'>手机号认证</a>|--><a href='javascript:goAuthentication(2)'>身份证认证</a><span></span>");
        $("#wIDNumbers").show();
        return false;
    }
}

/*验证手机号码*/
function regMobileNum() {
    var controlTemp = document.getElementById("login_input_text03");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text03").val() == "" || $("#login_input_text03").val() == "请输入11位手机号码") {
        $("#login_input_text03").val("请输入11位手机号码");
        $("#divMobile").attr("class", "input_text02_box_err");
        $("#wMobile").html("必填");
        $("#wMobiles").html("请输入11位手机号码<span></span>");
        $("#wMobiles").show();
        return false;
    }
    else {
        var patrn = eval('/^1[3,4,5,8]{1}[0-9]{9}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            return regMobileExists();
        }
        else {
            $("#divMobile").attr("class", "input_text02_box_err");
            $("#wMobile").html("错误");
            $("#wMobiles").html("请输入11位手机号码<span></span>");
            $("#wMobiles").show();
            return false;
        }
    }
}

/*验证手机号码存在*/
function regMobileExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("MobileNum|" + $("#login_input_text03").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "0") {
        $("#divMobile").attr("class", "input_text02_box_ok");
        $("#wMobile").html("正确");
        $("#wMobiles").html("请输入11位手机号码<span></span>");
        $("#wMobiles").hide();
        return true;
    }
    else {
        $("#divMobile").attr("class", "input_text02_box_err");
        $("#wMobile").html("错误");
        $("#wMobiles").html("您已经是会员，请点击<!--<a href='javascript:goAuthentication(1)'>手机号认证</a>|--><a href='javascript:goAuthentication(2)'>身份证认证</a><span></span>");
        $("#wMobiles").show();
        return false;
    }
}

/*验证通讯地址*/
function regAddress() {
    return checkArea() && regDetailAddress();
}

/*验证居住区域*/
function checkArea() {
    if ($("#selProvince").val() != "" && $("#selCity").val() != "") {
        $("#divProvince").removeClass("repair_select02_err");
        $("#divCity").removeClass("repair_select02_err");
        $("#wAreas").hide();
        return true;
    }
    else {
        if ($("#selProvince").val() == "") {
            $("#divProvince").addClass("repair_select02_err");
            $("#divCity").removeClass("repair_select02_err");
            $("#wAreas").html("请选择您所在的省份<span></span>");
        }
        else {
            $("#divCity").addClass("repair_select02_err");
            $("#divProvince").removeClass("repair_select02_err");
            $("#wAreas").html("请选择您所在的城市<span></span>");
        }
        $("#wAreas").show();
        return false;
    }
}

/*验证详细地址*/
function regDetailAddress() {
    var controlTemp = document.getElementById("textarea1");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#textarea1").val() == "" || $("#textarea1").val() == "请输入您的详细地址") {
        $("#textarea1").val("请输入您的详细地址");
        //$("#divAreas").attr("class", "input_text02_box_err");
        $("#wAreas").html("请输入您的详细地址<span></span>");
        $("#wAreas").show();
        return false;
    }
    else {
        if (controlTemp.value.length < 6) {
            //$("#divAreas").attr("class", "input_text02_box_err");
            $("#wAreas").html("请输入您的详细地址，6个字符以上<span></span>");
            $("#wAreas").show();
            return false;
        }
        else {
            //$("#divAreas").attr("class", "input_text02_box_ok");
            $("#wAreas").html("万客会将通过以上地址寄送会员资料，请确保通讯地址有效。<span></span>");
            return true;
        }
    }
}

/*验证邮箱地址*/
function regEmail() {
    var controlTemp = document.getElementById("login_input_text04");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text04").val() == "" || $("#login_input_text04").val() == "请输入您的常用邮箱") {
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
            return regEmailExists();
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
function regEmailExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("Email|" + $("#login_input_text04").val()) },
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
function regProfession() {
    if ($("#selIndustry").val() == "") {
        $("#divIndustry").addClass("repair_select01_err");
        $("#wIndustrys").show();
        return false;
    }
    else {
        $("#divIndustry").removeClass("repair_select01_err");
        $("#wIndustrys").hide();
        return true;
    }
}

/*验证昵称*/
function regNickName() {
    var controlTemp = document.getElementById("login_input_text05");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#login_input_text05").val() == "" || $("#login_input_text05").val() == "请输入您的昵称") {
        $("#login_input_text05").val("请输入您的昵称");
        $("#divNickName").attr("class", "input_text02_box_err");
        $("#wNickName").html("必填");
        $("#wNickNames").html("请输入您的昵称<span></span>");
        $("#wNickNames").show();
        return false;
    }
    else {
        return regNickNameExists();
    }
}

/*验证昵称存在*/
function regNickNameExists() {
    var state = $.ajax({
        url: "/mobile/WebServices/AjaxMethods.aspx",
        type: "Post",
        data: { "Type": "checkexist", "Parameter": escape("NickName|" + $("#login_input_text05").val()) },
        async: false,
        cache: false
    }).responseText;

    if (state == "0") {
        $("#divNickName").attr("class", "input_text02_box_ok");
        $("#wNickName").html("正确");
        $("#wNickNames").html("该昵称用于后期各种活动登录账号，请牢记！<span></span>");
        return true;
    }
    else {
        $("#divNickName").attr("class", "input_text02_box_err");
        $("#wNickName").html("错误");
        $("#wNickNames").html("该昵称已被使用<span></span>");
        $("#wNickNames").show();
        return false;
    }
}

/*验证密码*/
function regPassword() {
    if ($("#login_input_text06").val() == "") {
        $("#divPassword").attr("class", "input_text02_box_err");
        $("#wPassword").html("错误");
        $("#wPasswords").show();
        return false;
    }
    else {
        $("#divPassword").attr("class", "input_text02_box_ok");
        $("#wPassword").html("正确");
        $("#wPasswords").hide();
        return true;
    }
}

/*验证确认密码*/
function regPassConfirm() {
    if (regPassword()) {
        if ($("#login_input_text07").val() == "") {
            $("#divPassConfirm").attr("class", "input_text02_box_err");
            $("#wPassConfirm").html("错误");
            $("#wPassConfirms").html("请再次输入您的密码<span></span>");
            $("#wPassConfirms").show();
            return false;
        }
        else if ($("#login_input_text07").val() != $("#login_input_text06").val()) {
            $("#divPassConfirm").attr("class", "input_text02_box_err");
            $("#wPassConfirm").html("错误");
            $("#wPassConfirms").html("两次输入密码不一致<span></span>");
            $("#wPassConfirms").show();
            return false;
        }
        else {
            $("#divPassConfirm").attr("class", "input_text02_box_ok");
            $("#wPassConfirm").html("正确");
            $("#wPassConfirms").html("请再次输入您的密码<span></span>");
            $("#wPassConfirms").hide();
            return true;
        }
    }
    else {
        return;
    }
}

/*注册前全局验证*/
function preCheckRegister() {
    var err = 0;
    if (!regRealName()) err++;
    if (!regIDNumber()) err++;
    if (!regMobileNum()) err++;
    if (!regAddress()) err++;
    if (!regEmail()) err++;
    if (!regProfession()) err++;
    if (!regNickName()) err++;
    if (!regPassword()) err++;
    if (!regPassConfirm()) err++;
    if (err > 0)
        return false;
    else
        return true;
}

/*注册方法*/
function register() {
    if (!preCheckRegister()) {
        return;
    }

    $("#anchorReg").unbind("click");

    var realName = $("#login_input_text02").val();
    var idType = $("#selIDType").val();
    var idNumber = $("#login_input_text01").val();
    var mobileNum = $("#login_input_text03").val();
    var province = $("#selProvince").val();
    var city = $("#selCity").val();
    var address = $("#textarea1").val();
    var email = $("#login_input_text04").val();
    var profession = $("#selIndustry").val();
    var nickName = $("#login_input_text05").val();
    var password = $("#login_input_text06").val();

    var allData = 'RealName=' + escape(realName) + '&IDType=' + idType + '&IDNumber=' + idNumber + '&MobileNum=' + mobileNum + '&Province=' + escape(province) + '&City=' + escape(city) + '&Address=' + escape(address) + '&Email=' + escape(email) + '&Profession=' + escape(profession) + '&NickName=' + escape(nickName) + '&Password=' + escape(password);

    //alert(allData);
    //return;

    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=register", allData, function (response) {
        //alert(response.ErrorCode + "|" + response.ErrorMsg + "|" + getParameterByName("ReturnURL"));
        if (response.ErrorCode == 0) {
            reSetRegisterInfo();
            if (getParameterByName("ReturnURL") != "" && getParameterByName("ReturnURL") != "/") {
                alert("恭喜您，注册成功！");
                goToURL();
            }
            else {
                location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
            }
        }
        else {
            location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
        }
    }, "json");

    $("#anchorReg").click(function () {
        register();
    })
}

/*重置方法*/
function reSetRegisterInfo() {
    $("#reg_input_text01").val("请输入您的真实姓名");
    $("#reg_input_text02").val("请输入您的身份证号");
    $("#reg_input_text03").val("请输入11位手机号码");
    $("#reg_input_text04").val("请输入您的邮箱地址");
    $("#reg_input_text05").val("请输入您的昵称");
    $("#textarea1").val("请输入您的详细地址");
    $("select").val("");

    $(".wrong").html("必填");
    $(".wrongs").hide();

    $("#divName").attr("class", "input_text02_box");
    $("#divIDNumber").attr("class", "input_text02_box");
    $("#divMobile").attr("class", "input_text02_box");
    $("#divAreas").attr("class", "input_text02_box");
    $("#divEmail").attr("class", "input_text02_box");
    $("#divNickName").attr("class", "input_text02_box");
    $("#divPassword").attr("class", "input_text02_box");
    $("#divPassConfirm").attr("class", "input_text02_box");
}

/*显示提示信息*/
function showTips() {
    if ($("#selIDType").val() == "A000014") {
        $("#wIDNumbers").html("请正确填写证件号码例如：沈字第003411号 或 沈字第003411<span></span>");
        $("#wIDNumbers").show();
    }
    else {
        $("#wIDNumbers").html("请输入您的有效证件号码<span></span>");
        $("#wIDNumbers").hide();
    }
}