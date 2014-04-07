// JavaScript Document
window.DataHost = ''

$(function(){

	var local_uri = location.pathname;
	$('.nav-list a').each(function(){
		var that = $(this)
		if(that.attr('href').indexOf(local_uri) === 0){
			that.parent().addClass('active')
		}
	})


})

$.fn.inputTips = function (msg) {
    var that = this;
    that.after('<br/><p>'+msg+'</p>');
    return that;
}

window.editor_tools = [
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "justifyLeft",
            "justifyCenter",
            "justifyRight",
            "justifyFull",
            "insertUnorderedList",
            "insertOrderedList",
            "indent",
            "outdent",
            "createLink",
            "unlink",
            "insertImage",
            //"subscript",
            //"superscript",
            //"createTable",
            //"addRowAbove",
            //"addRowBelow",
            //"addColumnLeft",
            //"addColumnRight",
            //"deleteRow",
            //"deleteColumn",
            "viewHtml",
            //"formatting",
            //"fontName",
            //"fontSize",
            //"foreColor",
            //"backColor"
        ]

window.editor_messages = {
            bold: "加粗",
            italic: "斜体",
            underline: "下划线",
            strikethrough: "中划线",
          
            justifyCenter: "剧中",
            justifyLeft: "居左",
            justifyRight: "居右",
            justifyFull: "左右对齐",
            insertUnorderedList: "插入列表",
            insertOrderedList: "插入有序列表",
            indent: "缩进",
            
            createLink: "插入超链接",
            unlink: "取消超链接",
            insertImage: "插入图片",
            insertHtml: "插入HTML",

            style: "样式",
            viewHtml: "查看源代码",
            emptyFolder: "空目录",
            uploadFile: "上传",
            orderBy: "根据排序:",
            orderBySize: "尺寸",
            orderByName: "名称",
            invalidFileType: "选择文件类型 \"{0}\" 已经无效. 支持的文件类型是 {1}.",
            deleteFile: "你确定删除文件 \"{0}\"?",
            overwriteFile: "文件 \"{0}\" 已经存在，是否覆盖它？",
            directoryNotFound: "没有找到此目录",
            imageWebAddress: "网络地址",
            imageAltText: "提示文字",
            linkWebAddress: "网络图片地址",
            linkText: "文本",
            linkToolTip: "描述",
            linkOpenInNewWindow: "在新窗口打开",
            dialogInsert: "插入",
            dialogUpdate: "确定",
            dialogButtonSeparator: " 或 ",
            dialogCancel: "取消"
          }


window.filter_obj = {
                        name: "筛选",
                        extra: true, // turns on/off the second filter option
                        messages: {
                              info: "请选择筛选条件:", // sets the text on top of the filter menu
                              filter: "筛选", // sets the text for the "Filter" button
                              clear: "清除", // sets the text for the "Clear" button
                              
                              // when filtering boolean numbers
                              isTrue: "值为True", // sets the text for "isTrue" radio button
                              isFalse: "值为false", // sets the text for "isFalse" radio button
                              
                              //changes the text of the "And" and "Or" of the filter menu
                              and: "并且",
                              or: "或者",

                              selectValue:'请选择值'
                        },
                        operators: {
                              //filter menu for "string" type columns
                              string: {
                                    eq: "等于",
                                    neq: "不等于",
                                    startswith: "开始于",
                                    contains: "包含于",
                                    endswith: "结束于"
                              },
                              //filter menu for "number" type columns
                              number: {
                                    eq: "等于",
                                    neq: "不等于",
                                    gte: "大于等于",
                                    gt: "大于",
                                    lte: "小于等于",
                                    lt: "小于"
                              },
                              //filter menu for "date" type columns
                              date: {
                                    eq: "等于",
                                    neq: "不等于",
                                    gte: "大于等于",
                                    gt: "大于",
                                    lte: "小于等于",
                                    lt: "小于"
                              },
                              enums:{
                                    eq: "等于",
                                    neq: "不等于",
                              }
                        }
                  }


window.is_show_array = [
                                      { text: "启用", value: 1 },
                                      { text: "不启用", value: 0 }
                                    ]
window.sex_ary=[
              { text: "男", value: 1 },
              { text: "女", value: 0 }
            ]
            
window.news_type = [
              { text: "新闻", value: 1 },
              { text: "楼盘活动", value: 2 },
              { text: "楼盘优惠", value: 3 },
            ]
window.suggest_type = [
              { text: "维修服务", value: 1 },
              { text: "意见投诉", value: 2 },
              { text: "用户留言", value: 3 },
            ]
window.process_type = [
              { text: "待受理", value: 1 },
              { text: "处理中", value: 2 },
              { text: "处理完毕", value: 3 },
              { text: "不处理", value: 4 },
            ]

window.rec_status = [
              { text: "待审核", value: 1 },
              { text: "推荐成功", value: 2 },
              { text: "推荐不成功", value: 3 },
            ]

window.reply_kind=[
              { text: "文字回复", value: 1 },
              { text: "图文回复", value: 2 }
            ]

window.reply_type=[
              { text: "关键字回复", value: 1 },
              { text: "菜单回复", value: 2 }
            ]

window.menu_type=[
              { text: "一级菜单", value: 1 },
              { text: "二级菜单", value: 2 }
            ]


window.dropdown_init = function($obj, $array,onchange){
      var $obj = $obj || $("#isShow_inp")
      var $array = $array || window.is_show_array
      var onchange = onchange || $.noop;

      var appid = $obj.val()
             var isFound = 0;
             $array.forEach(function(v){
                if(v.value == appid){
                    isFound++
                }
             })
             if(isFound == 0){
                $obj.val($array[0].value).change();
             }
              $obj.kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: $array,
                    select:onchange,
                })
    
}