/*================================================== 诚意登记 ==================================================*/

/*验证姓名*/
function checkRealName() {
    var controlTemp = document.getElementById("reg_input_text01");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text01").val() == "" || $("#reg_input_text01").val() == "请输入您的真实姓名") {
        $("#reg_input_text01").val("请输入您的真实姓名");
        $("#divName").attr("class", "input_text02_box_err");
        $("#wName").html("必填");
        $("#wNames").html("请输入您的真实姓名");
        $("#wNames").show();
        return false;
    }
    else {
        var patrn = eval('/^[\\u4e00-\\u9fa5]{2,6}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            $("#divName").attr("class", "input_text02_box_ok");
            $("#wName").html("正确");
            $("#wNames").hide();
            return true;
        }
        else {
            $("#divName").attr("class", "input_text02_box_err");
            $("#wName").html("错误");
            $("#wNames").html("请输入2-6位中文");
            $("#wNames").show();
            return false;
        }
    }
}

/*验证年龄*/
function checkAge() {
    var controlTemp = document.getElementById("reg_input_text02");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text02").val() == "" || $("#reg_input_text02").val() == "请输入您的真实年龄") {
        $("#reg_input_text02").val("请输入您的真实年龄");
        $("#divAge").attr("class", "input_text02_box_err");
        $("#wAge").html("必填");
        $("#wAges").html("请输入您的真实年龄");
        $("#wAges").show();
        return false;
    }
    else {
        var patrn = eval('/^\\d+$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            /*18-100岁*/
            if (parseInt(controlTemp.value) >= 18 && parseInt(controlTemp.value) <= 100) {
                $("#divAge").attr("class", "input_text02_box_ok");
                $("#wAge").html("正确");
                $("#wAges").hide();
                return true;
            }
            else {
                $("#divAge").attr("class", "input_text02_box_err");
                $("#wAge").html("错误");
                $("#wAges").html("请输入您的真实年龄");
                $("#wAges").show();
                return false;
            }
        }
        else {
            $("#divAge").attr("class", "input_text02_box_err");
            $("#wAge").html("错误");
            $("#wAges").html("请输入数字");
            $("#wAges").show();
            return false;
        }
    }
}

/*验证电话*/
function checkMobile() {
    var controlTemp = document.getElementById("reg_input_text03");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text03").val() == "" || $("#reg_input_text03").val() == "请输入11位手机号码") {
        $("#reg_input_text03").val("请输入11位手机号码");
        $("#divMobile").attr("class", "input_text02_box_err");
        $("#wMobile").html("必填");
        $("#wMobiles").show();
        return false;
    }
    else {
        var patrn = eval('/^1[3,4,5,8]{1}[0-9]{9}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            $("#divMobile").attr("class", "input_text02_box_ok");
            $("#wMobile").html("正确");
            $("#wMobiles").hide();
            return true;
        }
        else {
            $("#divMobile").attr("class", "input_text02_box_err");
            $("#wMobile").html("错误");
            $("#wMobiles").show();
            return false;
        }
    }
}

/*验证邮箱*/
function checkEmail() {
    var controlTemp = document.getElementById("reg_input_text04");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text04").val() == "" || $("#reg_input_text04").val() == "请输入您的邮箱地址") {
        $("#reg_input_text04").val("请输入您的邮箱地址");
        $("#divEmail").attr("class", "input_text02_box_err");
        $("#wEmail").html("必填");
        $("#wEmails").show();
        return false;
    }
    else {
        var patrn = eval('/^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
            $("#divEmail").attr("class", "input_text02_box_ok");
            $("#wEmail").html("正确");
            $("#wEmails").hide();
            return true;
        }
        else {
            $("#divEmail").attr("class", "input_text02_box_err");
            $("#wEmail").html("错误");
            $("#wEmails").show();
            return false;
        }
    }
}

/*验证家庭结构*/
function checkFamily() {
    if ($("#selFamily").val() == "") {
        $("#divFamily").addClass("repair_select01_err");
        $("#wFamilys").show();
        return false;
    }
    else {
        $("#divFamily").removeClass("repair_select01_err");
        $("#wFamilys").hide();
        return true;
    }
}

/*验证从事行业*/
function checkIndustry() {
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

/*验证获知渠道*/
function checkChannel() {
    //checkRadio("rdoChannel", "wChannels", "请选择您的获知渠道<span></span>");
    if ($("#selChannel").val() == "") {
        $("#divChannel").addClass("repair_select01_err");
        $("#wChannels").html("请选择您的获知渠道<span></span>");
        $("#divOther").hide();
        $("#wChannels").show();
        $("#reg_input_text05").val("");
        return false;
    }
    else if ($("#selChannel").val() == "其他") {
        $("#divOther").show();
        return checkOtherChan();
    }
    else {
        $("#divOther").hide();
        $("#wChannels").hide();
        $("#divChannel").removeClass("repair_select01_err");
        $("#reg_input_text05").val("");
        return true;
    }
}

/*验证其他渠道*/
function checkOtherChan() {
    var controlTemp = document.getElementById("reg_input_text05");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#reg_input_text05").val() == "" || $("#reg_input_text05").val() == "请输入其他渠道") {
        $("#reg_input_text05").val("请输入其他渠道");
        $("#divChannel").addClass("repair_select01_err");
        $("#divOther").attr("class", "input_text02_box_err");
        $("#wOther").html("必填");
        $("#wChannels").html("请输入其他渠道<span></span>");
        $("#wChannels").show();
        return false;
    }
    else {
        $("#divChannel").removeClass("repair_select01_err");
        $("#divOther").attr("class", "input_text02_box_ok");
        $("#wOther").html("正确");
        $("#wChannels").hide();
        return true;
    }
}

/*验证登记产品*/
function checkProduct() {
    var length = $("input[name=ckbProduct]:checkbox:checked").length;
    if (length < 1) {
        $(".divPro").addClass("reg_form_err01");
        $(".divPro").removeClass("reg_form01");
        $("#wProducts").show();
        return false;
    }
    else {
        $(".divPro").addClass("reg_form01");
        $(".divPro").removeClass("reg_form_err01");
        $("#wProducts").hide();
        return true;
    }
}

/*验证亲友介绍*/
function checkIntroducer() {
    if ($("#selIntroducer").val() == "") {
        $("#wIntroducers").show();
        return false;
    }
    else {
        $("#wIntroducers").hide();
        return true;
    }
}

/*验证产品引力*/
function checkAttr() {
    return allowChoise("ckbAttr", "wAttrs", "请选择对您有吸引力的三项", "divAttr");
}

/*验证产品引力*/
function checkUnattr() {
    return allowChoise("ckbUnattr", "wUnattrs", "请选择您不满意的三项", "divUnattr");
}

/*设置复选框*/
function allowChoise(ckbName, wDiv, errTxt, errDiv) {
    var length = $("input[name='" + ckbName + "']:checkbox:checked").length;
    if (length >= 3) {
        $("input[name='" + ckbName + "']:checkbox").each(function () {
            if ($(this).attr("checked") != "checked") {
                $(this).attr("disabled", "disabled");
            }
        });
        $("#" + wDiv).hide();
        $("#" + errDiv).attr("class", "reg_form01");
        return true;
    }
    else {
        $("input[name='" + ckbName + "']:checkbox").each(function () {
            $(this).removeAttr("disabled");
        });
        $("#" + wDiv).html(errTxt);
        $("#" + wDiv).show();
        $("#" + errDiv).attr("class", "reg_form_err01");
        return false;
    }
}

/*提交前全局验证*/
function preCheckSinreg() {
    var err = 0;
    if (!checkRealName()) err++;
    if (!checkAge()) err++;
    if (!checkMobile()) err++;
    if (!checkEmail()) err++;
    if (!checkFamily()) err++;
    if (!checkIndustry()) err++;
    if (!checkArea()) err++;
    if (!checkChannel()) err++;
    if (!checkProduct()) err++;
    //if (!checkIntroducer()) err++;
    if (!checkAttr()) err++;
    if (!checkUnattr()) err++;
    if (err > 0)
        return false;
    else
        return true;
}

/*提交登记信息*/
function addSinregInfo() {
    if (!preCheckSinreg()) {
        return;
    }

    var name = $("#reg_input_text01").val();
    var age = $("#reg_input_text02").val();
    var tel = $("#reg_input_text03").val();
    var email = $("#reg_input_text04").val();
    var family = $("#selFamily").val();
    var industry = $("#selIndustry").val();
    var area = $("#selProvince").val() + $("#selCity").val() + "市(区)";
    var channel = "";
    if ($("#selChannel").val() == "其他") {
        channel = $("#reg_input_text05").val();
    }
    else {
        channel = $("#selChannel").val();
    }
    var products = "";
    $("input[name=ckbProduct]:checkbox:checked").each(function () {
        products += $(this).val() + "，";
    });
    products = products.substring(0, products.length - 1);

    var attr = "";
    $("input[name=ckbAttr]:checkbox:checked").each(function () {
        attr += $(this).val() + "，";
    });
    attr = attr.substring(0, attr.length - 1);

    var unAttr = "";
    $("input[name=ckbUnattr]:checkbox:checked").each(function () {
        unAttr += $(this).val() + "，";
    });
    unAttr = unAttr.substring(0, unAttr.length - 1);

    var allData = 'RealName=' + escape(name) + '&Age=' + age + '&MobileNum=' + tel + '&Email=' + email + '&FamilyStructure=' + escape(family) + '&Industry=' + escape(industry) + '&ResidentialArea=' + escape(area) + '&LearningChannel=' + escape(channel) + '&Introducer=&Products=' + escape(products) + '&Attractive=' + escape(attr) + '&Unattractive=' + escape(unAttr);

    //alert(allData);
    //return;

    $.post("/mobile/WebServices/AjaxMethods.aspx?Type=addsinreginfo", allData, function (response) {
        if (response.ErrorCode == 0) {
            reSetSinregInfo();
        }
        location.href = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
    }, "json");
}

/*重置方法*/
function reSetSinregInfo() {
    $("#reg_input_text01").val("请输入您的真实姓名");
    $("#reg_input_text02").val("请输入您的真实年龄");
    $("#reg_input_text03").val("请输入11位手机号码");
    $("#reg_input_text04").val("请输入您的邮箱地址");
    $("#reg_input_text05").val("请输入其他渠道");
    $("select").val("");

    $(".wrong").html("必填");
    $(".wrongs").hide();

    $("#divName").attr("class", "input_text02_box");
    $("#divTel").attr("class", "input_text02_box");
    $("#divBuildingArea").attr("class", "input_text02_box");
    $("#divApartment").attr("class", "input_text02_box");
    $("#divRoomNum").attr("class", "input_text02_box");

    $("input[type=checkbox]").each(function () {
        $(this).removeAttr("disabled");
        $(this).removeAttr("checked");
    });
}