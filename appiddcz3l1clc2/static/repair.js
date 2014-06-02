/*================================================== 在线报修 ==================================================*/

/*验证姓名*/
function checkName() {
    var controlTemp = document.getElementById("repair_input_text01");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#repair_input_text01").val() == "" || $("#repair_input_text01").val() == "请输入您的真实姓名") {
        $("#repair_input_text01").val("请输入您的真实姓名");
        //$("#divName").attr("class", "input_text02_box_err");
        $("#wNames").show();
        return false;
    }
    else {
        var patrn = eval('/^[\\u4e00-\\u9fa5]{2,6}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
           //$("#divName").attr("class", "input_text02_box_ok");
            $("#wName").html("正确");
            $("#wNames").hide();
            return true;
        }
        else {
           // $("#divName").attr("class", "input_text02_box_err");
            $("#wName").html("错误");
            $("#wNames").show();
            return false;
        }
    }
}

/*验证电话*/
function checkTel() {
    var controlTemp = document.getElementById("repair_input_text02");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#repair_input_text02").val() == "" || $("#repair_input_text02").val() == "请输入11位手机号码") {
        $("#repair_input_text02").val("请输入11位手机号码");
        //$("#divTel").attr("class", "input_text02_box_err");
        $("#wTels").show();
        return false;
    }
    else {
        var patrn = eval('/^1[3,4,5,8]{1}[0-9]{9}$/');
        var rtnValue = patrn.exec(controlTemp.value);
        if (rtnValue) {
           //$("#divTel").attr("class", "input_text02_box_ok");
            $("#wTel").html("正确");
            $("#wTels").hide();
            return true;
        }
        else {
            //$("#divTel").attr("class", "input_text02_box_err");
            $("#wTel").html("错误");
            $("#wTels").show();
            return false;
        }
    }
}

var errHtml;

/*验证项目*/
function checkPro() {
    errHtml = $("#wAddress").html();
    if ($("#selProject").val() == "") {
        $("#divProject").addClass("repair_select01_err");
        if (errHtml.indexOf("请选择您所属的项目<br>") < 0) {
            $("#wAddress").append("请选择您所属的项目<br>");
        }
        $("#wAddress").show();
        return false;
        //请选择项目，楼栋号，单元号，房间号
    }
    else {
        $("#divProject").removeClass("repair_select01_err");
        errHtml = errHtml.replace("请选择您所属的项目<br>", "");
        $("#wAddress").html(errHtml);
        if ($("#wAddress").html() == "<span></span>") {
            $("#wAddress").hide();
        }
        return true;
    }
}

/*验证楼栋号*/
function checkBuildingArea() {
    var controlTemp = document.getElementById("repair_input_text03");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    errHtml = $("#wAddress").html();
    if ($("#repair_input_text03").val() == "" || $("#repair_input_text03").val() == "请输入楼栋") {
        $("#repair_input_text03").val("请输入楼栋");
        //divBuildingArea").attr("class", "input_text02_box_err");
        //$("#wBuildingArea").html("错误");
        if (errHtml.indexOf("请输入您所属的楼栋<br>") < 0) {
            $("#wAddress").append("请输入您所属的楼栋<br>");
        }
        $("#wAddress").show();
        return false;
    }
    else {
        //$("#divBuildingArea").attr("class", "input_text02_box_ok");
        //$("#wBuildingArea").html("正确");
        errHtml = errHtml.replace("请输入您所属的楼栋<br>", "");
        $("#wAddress").html(errHtml);
        if ($("#wAddress").html() == "<span></span>") {
            $("#wAddress").hide();
        }
        return true;
    }
}

/*验证单元号*/
function checkApartment() {
    var controlTemp = document.getElementById("repair_input_text04");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    errHtml = $("#wAddress").html();
    if ($("#repair_input_text04").val() == "" || $("#repair_input_text04").val() == "请输入单元") {
        $("#repair_input_text04").val("请输入单元");
        //$("#divApartment").attr("class", "input_text02_box_err");
        //$("#wApartment").html("错误");
        if (errHtml.indexOf("请输入您所属的单元<br>") < 0) {
            $("#wAddress").append("请输入您所属的单元<br>");
        }
        $("#wAddress").show();
        return false;
    }
    else {
        //$("#divApartment").attr("class", "input_text02_box_ok");
        //$("#wApartment").html("正确");
        errHtml = errHtml.replace("请输入您所属的单元<br>", "");
        $("#wAddress").html(errHtml);
        if ($("#wAddress").html() == "<span></span>") {
            $("#wAddress").hide();
        }
        return true;
    }
}

/*验证房间号*/
function checkRoomNum() {
    var controlTemp = document.getElementById("repair_input_text05");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    errHtml = $("#wAddress").html();
    if ($("#repair_input_text05").val() == "" || $("#repair_input_text05").val() == "请输入房号") {
        $("#repair_input_text05").val("请输入房号");
        //$("#divRoomNum").attr("class", "input_text02_box_err");
        //$("#wRoomNum").html("错误");
        if (errHtml.indexOf("请输入您所属的房号<br>") < 0) {
            $("#wAddress").append("请输入您所属的房号<br>");
        }
        $("#wAddress").show();
        return false;
    }
    else {
       //$("#divRoomNum").attr("class", "input_text02_box_ok");
        //$("#wRoomNum").html("正确");
        errHtml = errHtml.replace("请输入您所属的房号<br>", "");
        $("#wAddress").html(errHtml);
        if ($("#wAddress").html() == "<span></span>") {
            $("#wAddress").hide();
        }
        return true;
    }
}

/*验证报修内容*/
function checkContent() {
    var controlTemp = document.getElementById("textarea2");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#textarea2").val() == "" || $("#textarea2").val() == "请输入留言内容") {
        $("#textarea2").val("请输入留言内容");
        $("#wContent").show();
        return false;
    }
    else {
        $("#wContent").hide();
        return true;
    }
}

/*验证报修内容*/
function checkContent3() {
    var controlTemp = document.getElementById("textarea3");
    controlTemp.value = controlTemp.value.replace(/\s/gi, "");
    if ($("#textarea3").val() == "" || $("#textarea3").val() == "请输入推荐备注") {
        $("#textarea3").val("请输入推荐备注");
        $("#wContent3").show();
        return false;
    }
    else {
        $("#wContent3").hide();
        return true;
    }
}

//提交前全局验证
function preCheckRepair() {
    var err = 0;
    if (!checkName()) err++;
    if (!checkTel()) err++;
    if (!checkPro()) err++;
    if (!checkBuildingArea()) err++;
    //if (!checkApartment()) err++;
    if (!checkRoomNum()) err++;
    if (!checkContent()) err++;
    if (err > 0)
        return false;
    else
        return true;
}

function checkBirthday(){
    var v = $('#reg_birth_text02').val();
    if(!v){
        $("#wAges").show();
        return false;
    }
    $("#wAges").hide();
    return true;
}

function checkUserName(){
    var v = $('#repair_input_text00').val();
    var reg = /^[a-zA-Z0-9]{6,20}$/
    if(!reg.test(v)){
        $("#wLoginNames").show();
        return false;
    }
    $("#wLoginNames").hide();
    return true;
}




//提交报修信息
function addRepairInfo() {
    if (!preCheckRepair()) {
        return;
    }

    var name = $("#repair_input_text01").val();
    var tel = $("#repair_input_text02").val();
    var project = $("#selProject").val();
    var buildingArea = $("#repair_input_text03").val();
    //var apartment = $("#repair_input_text04").val();
    var apartment = "";
    var roomNum = $("#repair_input_text05").val();
    //var note = $("#textarea1").val();
    var note = "";
    var content = $("#textarea2").val();

    var allData = '{"ProjectName":"' + project + '","Section":"","ProjectArea":"","BuildingArea":"' + buildingArea + '","Apartment":"' + apartment + '","FloorNum":"","RoomNum":"' + roomNum + '","OwnerNames":"","Contacts":"' + name + '","ContactWay":"' + tel + '","RepairContent":"' + content + '","Note":"' + note + '","AddTime":"\\/Date(' + new Date().getTime() + ')\\/","RepairStatus":"D","RepairTime":null,"RepairWorker":"","RepairResults":""}';

    //alert(allData);
    //location = "ok.shtml?Result=1&Tips=出错了！";
    //return;

    $.post("/weixin/API/OnlineRepairService.aspx?v=add", allData, function (response) {
        if (response.ErrorCode == 0) {
            reSetRepairInfo();
        }
        location = "ok.shtml?Result=" + response.ErrorCode + "&Msg=" + escape(response.ErrorMsg);
    }, "json");
}

/*重置方法*/
function reSetRepairInfo() {
    $("input").val("");
    //    $.each($("input"), function () {
    //        $(this).val("");
    //    });
    $("textarea").val("");
    //    $.each($("textarea"), function () {
    //        $(this).val("");
    //    });
    $(".wrong").html("必填");

    $("#divName").attr("class", "input_text02_box");
    $("#divTel").attr("class", "input_text02_box");
    $("#divBuildingArea").attr("class", "input_text02_box");
    $("#divApartment").attr("class", "input_text02_box");
    $("#divRoomNum").attr("class", "input_text02_box");
}