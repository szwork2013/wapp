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
window.oauth_scope = [
                  { text: "仅OPenId，自动跳转", value: 'snsapi_base' },
                  { text: "详细信息，用户授权", value: 'snsapi_userinfo' }
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
              { text: "推荐新客户", value: 4 },
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
              { text: "文字回复", value: 2 },
              { text: "图文回复", value: 1 }
            ]

window.reply_type=[
              { text: "关键字回复", value: 1 },
              { text: "菜单图文回复", value: 2 },
              { text: "关注回复", value: 3 },
              { text: "默认回复", value: 4 }
            ]

window.menu_type=[
              { text: "一级菜单", value: 1 },
              { text: "二级菜单", value: 2 }
            ]

window.prize_type=[
              { text: "概率抽取", value: 1 },
              { text: "次数抽取", value: 2 }
            ]

window.news_type2=[
              { text: "乐活空间活动", value: 1 },
              { text: "乐活空间公告", value: 2 },
              { text: "物语空间公告", value: 3 }
            ]

window.special_type=[
              { text: "专刊新闻", value: 1 },
              { text: "专刊人文", value: 2 },
              { text: "专刊生活", value: 3 },
              { text: "专刊娱乐", value: 4 },
              { text: "专刊专题", value: 5 },
            ]

window.comment_type=[
              { text: "评论", value: 1 },
              { text: "收藏", value: 2 }
            ]

window.scoreWay_type = [
              { text: "注册获取", value: 'regist' },
              { text: "签到获取", value: 'daysign' },
              { text: "活动获取", value: 'active' },
              { text: "转发获取", value: 'forwarding' },
              { text: "游戏获取", value: 'game' },
              { text: "推荐获取", value: 'recommend' },
              { text: "评论获取", value: 'comment' },
              { text: "下线获取", value: 'extra' },
              
              { text: "购房抵用", value: 'buyhouse' },
              { text: "实物兑换", value: 'exchange' },
              { text: "服务消费", value: 'service' },
              { text: "手工方式", value: 'manual' },
]

window.scoreWay_type1 = [
              { text: "注册获取", value: 'regist' },
              { text: "签到获取", value: 'daysign' },
              { text: "活动获取", value: 'active' },
              { text: "转发获取", value: 'forwarding' },
              { text: "游戏获取", value: 'game' },
              { text: "推荐获取", value: 'recommend' },
              { text: "评论获取", value: 'comment' },
              { text: "手工方式", value: 'manual' },
              { text: "下线获取", value: 'extra' },
]

window.scoreWay_type2 = [
              { text: "购房抵用", value: 'buyhouse' },
              { text: "实物兑换", value: 'exchange' },
              { text: "服务消费", value: 'service' },
              { text: "竞拍消费", value: 'sale' },
              { text: "手工方式", value: 'manual' },
]

window.scoreget_type = [
                              { text: "获取", value: 1 },
                              { text: "消费", value: 2 }
                            ]

window.recommend_status = [
                        { text: "待审核", value: 1 },
                        { text: "审核通过", value: 2 },
                        { text: "审核不通过", value: 3 }
                      ]

window.sale_status = [
                        { text: "未拍出", value: 1 },
                        { text: "已拍出", value: 2 },
                        { text: "已发货", value: 3 }
                      ]

window.exchange_status = [
                        { text: "待发货", value: '' },
                        { text: '已发货', value: '1' }
                      ]


window.special_top = [
                        { text: "不置顶", value: '' },
                        { text: '置顶', value: '1' }
                      ]

window.scoreWay_type2 = [
              { text: "购房抵用", value: 'buyhouse' },
              { text: "实物兑换", value: 'exchange' },
              { text: "服务消费", value: 'service' },
              { text: "竞拍消费", value: 'sale' },
              { text: "手工方式", value: 'manual' },
]


window.recStatus_type = [
              { text: "待审核", value: 1 },
              { text: "不通过", value: 2 },
              { text: "预约", value: 3 },
              { text: "带看", value: 4 },
              { text: "认筹", value: 5 },
              { text: "签约", value: 6 },
]

window.isCash_type = [
              { text: "未结佣金", value: 0 },
              { text: "已结佣金", value: 1 },
]

window.bank_status = [
              { text: "待审核", value: 1 },
              { text: "不通过", value: 2 },
              { text: "已受理", value: 3 },
              { text: "已发放", value: 4 },
              ]
window.is_get_prize = [
  { text: "未发奖", value: '' },
  { text: "未发奖", value: '0' },
  { text: "已发奖", value: '1' },
]

window.kendo_edit_option = {
    tools: window.editor_tools,
    messages: window.editor_messages,
    imageBrowser: {
           messages: {
            dropFilesHere: "将图片拖进来"
           },
           transport: {
                read: {
                     url:"/manger/thumb/read",
                     type: "POST"
                },
                destroy: {
                    url: "/manger/thumb/destroy",
                    type: "POST"
                },
                create: {
                    url: "/manger/thumb/create",
                    type: "POST"
                },
                thumbnailUrl: "/upload/",
                uploadUrl: "/manger/thumb/upload",
                imageUrl: "/upload/{0}"
           }
        }
}


window.dropdown_init = function($obj, $array,onchange,init){
      var $obj = $obj || $("#isShow_inp")
      var $array = $array || window.is_show_array
      var onchange = onchange || $.noop;
      
      if(init && (!$obj.val() || $obj.val()=='0')){
        $obj.val(init).change()
      }
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

var thumbBoxIdCount = 0;
window.multiUpload = function($uploadInp, $dataInp, maxFiles){
    var maxFiles = maxFiles || 1;
    if(!$uploadInp) throw('no $uploadInp')
    if(!$dataInp) throw('no $dataInp')
    thumbBoxIdCount++

    var domId = Date.now() + '' +thumbBoxIdCount
    var thumbTemplate = '<div class="k-edit-label w-800-l">'+
                        '<label for="pictrue"></label></div>'+          
                        '<div data-container-for="pictrue" class="k-edit-field w-800-r" id="thumbBox_'+domId+'"></div>'
    var imgTemplate = '<div class="thumbDivBox"><a href="{src}" target="_blank"><img src="{src}" class="thumb"/></a>'+
                      '<a href="javascript:;" class="deletethumb">删除</a></div>'
    

    var filesPathArray = [];

    $uploadInp.parent().after(thumbTemplate); //插入缩略图html文件
    var thumbBox = $('#thumbBox_'+domId);

    var getDateToArrayAndPutThumb = function(){
        var v = $.trim($dataInp.val())
        if(!v){
            filesPathArray = [];
            return;
        }

        v = v.split(',');

        var str = ''
        v.forEach(function(path){
            str += imgTemplate.replace(/\{src\}/g, path);
        })
        filesPathArray = v;
        thumbBox.html(str);
    }

    var addNewPath = function(newPath){
        filesPathArray.push(newPath);
        $dataInp.val(filesPathArray.join(',')).change()
        getDateToArrayAndPutThumb()
    }

    var removePath = function(rmPath){
        filesPathArray = filesPathArray.filter(function(p){
            return p != rmPath
        })
        $dataInp.val(filesPathArray.join(',')).change()
        getDateToArrayAndPutThumb()
    }
    
    thumbBox.delegate('.deletethumb','click',function(){
        if(confirm('确定删除吗?')){
            var that = $(this);
            var rmpath = that.parent().find('img').attr('src');
            removePath(rmpath);
            that.parent().remove();
          }
    })


    $uploadInp.kendoUpload({
            async: {
                saveUrl: "/manger/upload/save",
                removeUrl: "/manger/upload/remove",
                autoUpload: true
            },
            success:function(e){
                var path = e.response.result;
                addNewPath(path)               
            },
            localization:{
                select: '请选择图片',
                remove: '',
                cancel: '',
                done:'完成'
            },
            select: function(e) {
                var len = filesPathArray.length;
                if(len >= maxFiles) {
                  e.preventDefault();
                  alert("最多上传: " + maxFiles+ ' 张图片');
                }
              }
        });

    getDateToArrayAndPutThumb();//初始化老数据

}

