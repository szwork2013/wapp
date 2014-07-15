var specialtop ='<li class="newsHead newsHead2" >'+
				'<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
				'<div class="specialtop"><img class="specialtop_img" src="{pic}" />'+
				'<span class="specialtop_title">{title}</span></div></a></li>'

var specialListTemplate = '<li class="newsHead" >'+
                '<a class="img_a_box2" href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<img class="listimg" src="{pic}" width="70" height="52"/></a>'+
                '<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<div class="listdiv"><p class="newsTitle newsTitle2">{title}</p>'+
                '<p class="call_p">{writeTime}</p>'+
                '</div>'+
                '</a> </li>'

var specialListTemplate2 = '<li class="newsHead" >'+
                '<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<img class="listimg" src="{pic}" width="70" height="52"/></a>'+
                '<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<div class="listdiv"><p class="newsTitle newsTitle2">{title}</p>'+
                '<p class="call_p"><a href="javascript:;" name="cancelFavor" spid="{spid}" class="reda">取消收藏</a></p>'+
                '</div>'+
                '</a></li>'

var specialCommentTemplate = '<div><p class="clearfix">'+
    						 '<span class="fl-l author61">{name}</span>'+
    					     '<span class="fl-r">{time}</span></p>'+
  							 '<p>{content}</p></div>'

var specialCommentTemplate2 ='<div><a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank"><p class="clearfix">'+
    						 '<span class="fl-l author61">{name}</span>'+
    					     '<span class="fl-r">{time}</span></p>'+
  							 '<p>{content}</p></a></div>'


$(function(){
	window.isajax = false;


	if($('#newsListContent').length>0){ //如果是新闻列表页
		var jq_li_block = $('#newsListContent').find('li')
		window.cur_news_page = 1;
		$('#listMore').click(function(){
			var jq_next_blk = $('li[name="newsBlock_'+window.cur_news_page+'"]');
			if(jq_next_blk.length>0){
				jq_next_blk.show();
				window.cur_news_page++;
			}
			else{
				$('#listMore').hide();
			}
		}).trigger('click')
	}

	if($('#specialListContent').length>0){//如果是专刊列表页
		window.current_sp_page = 1;
		window.current_sp_type = 1;
		var jq_nav_li = $('#specialNav li');

		$('#listMore').click(function(){
			if(window.isajax) return false
			window.isajax = true;
			$.post('/api/info/speciallist',{'type':window.current_sp_type,'wxuserid':window.userid, 'page':window.current_sp_page},function(d){
				window.isajax = false;
				window.current_sp_page++;
				if(d.error) return alert(d.data);
				if(d.data.length == 0) return $('#listMore').hide();
				var temp = ''
				d.data.forEach(function(o){
					var s = specialListTemplate;
					s = s.replace(/\{spid\}/g,o._id)
						 .replace(/\{uid\}/g,window.userid)
						 .replace(/\{pic\}/g,o.picture[0])
						 .replace(/\{title\}/g,o.title)
						 .replace(/\{writeTime\}/g,o.writeTime)

						 
					temp += s;
				})

				if(d.topdoc.length > 0){//如果有置顶的数据
					var o = d.topdoc[0];
					tops = specialtop.replace(/\{spid\}/g,o._id)
								.replace(/\{uid\}/g,window.userid)
								.replace(/\{pic\}/g,o.picture[0])
								.replace(/\{title\}/g,o.title)
					temp = tops + temp
				}

				$('#specialListContent').append(temp)
			},'json')
		})

		jq_nav_li.click(function(){
			var that = $(this);
			if(that.hasClass('current')){
				return false;
			}
			jq_nav_li.removeClass('current');
			that.addClass('current')

			window.current_sp_page = 1;
			window.current_sp_type = that.attr('type');
			$('#listMore').show();
			$('#specialListContent').empty();
			$('#listMore').click()

		})


		//$('#listMore').click()
		

	}


	if($('#special_detail').length>0){
		window.current_sp_page = 1;
		window.current_sp_id = $('#listMore').attr('spid');

		$('#listMore').click(function(){
			if(window.isajax) return false;

			window.isajax = true
			$.post('/api/special/getcomment',{'spid':window.current_sp_id,'wxuserid':window.userid,'page':window.current_sp_page},function(d){
				window.isajax = false;
				window.current_sp_page++;
				if(d.error) return alert(d.data);
				if(d.data.length == 0) return $('#listMore').hide();
				var temp = ''
				d.data.forEach(function(o){
					var s = specialCommentTemplate;
					s = s.replace(/\{name\}/g,o.appUserName)
						 .replace(/\{time\}/g,o.writeTime)
						 .replace(/\{content\}/g,o.content)
					temp += s;
				})
				$('#commentList').append(temp)
			},'json')
		}).trigger('click')


		$('#sendComment').click(function(){
			if(window.isajax) return false;

			var contentv = $.trim($('#sendCommentText').val())
			if(!contentv) return false;
			window.isajax = true
			$.post('/api/special/sendcomment',{'spid':window.current_sp_id, 'wxuserid':window.userid, 'content':contentv},function(d){
				window.isajax = false;

				window.current_sp_page++;
				if(d.error) return alert(d.data);		
					var s = specialCommentTemplate;
					s = s.replace(/\{name\}/g,window.username)
						 .replace(/\{time\}/g,d.data.writeTime)
						 .replace(/\{content\}/g,contentv)

				$('#commentList').prepend(s)
				alert('回帖成功')
				$('#sendCommentText').val('')
				var c = $('#replyCount').html() - 0
				$('#replyCount').html(c+1)
			},'json')

		})

		//收藏
		$('#sendFavor').click(function(){
			if(window.isajax) return false;
			var that = $(this);
			if(that.attr('hasfavor')=='1') return false;

			window.isajax = true
			$.post('/api/special/sendfavor',{'spid':window.current_sp_id, 'wxuserid':window.userid},function(d){
				window.isajax = false;
				if(d.error) return false;
				that.html('已收藏')
				that.attr('hasfavor',1)
				alert('收藏成功')
			},'json')

		})

		//未认证会员
		$('#sendFavor2').click(function(){
			var confirmTitle = '使用收藏功能，必须关注上院生活，确定关注吗？'
			if(confirmTitle){
				location.href = 'http://mp.weixin.qq.com/s?__biz=MjM5ODI3ODYzNQ==&mid=200487799&idx=1&sn=11e18128416d4ca8847a1ffeba4b3248#rd'
			}
			return false
		})



	}

	if($('#my_nav').length>0){ //如果是个人空间
		var pos = window.my_pos || 0;
		$('#my_nav').find('li').eq(pos).addClass('current');
		window.current_sp_page = 1;

			if($('#commentList').length>0){ //我的评论
					$('#listMore').click(function(){
						if(window.isajax) return false;

						window.isajax = true
						$.post('/api/user/mycomment',{'wxuserid':window.userid,'page':window.current_sp_page},function(d){
							window.isajax = false;
							window.current_sp_page++;
							if(d.error) return alert(d.data);
							if(d.data.length == 0) return $('#listMore').hide();
							var temp = ''
							d.data.forEach(function(o){
								var s = specialCommentTemplate2;
								s = s.replace(/\{spid\}/g,o.specialId)
									 .replace(/\{uid\}/g,window.userid)
									 .replace(/\{name\}/g,window.username)
									 .replace(/\{time\}/g,o.writeTime)
									 .replace(/\{content\}/g,o.content)
								temp += s;
							})
							$('#commentList').append(temp)
						},'json')
					}).trigger('click')
			}

			if($('#my_favor_list').length>0){
				$('#listMore').click(function(){
					if(window.isajax) return false
					window.isajax = true;
					$.post('/api/user/myfavor',{'wxuserid':window.userid, 'page':window.current_sp_page},function(d){
						window.isajax = false;
						window.current_sp_page++;
						if(d.error) return alert(d.data);

						if(d.data.length == 0){
							$('#listMore').hide();
						} 
						var temp = ''
						d.data.forEach(function(o){
							var s = specialListTemplate2;
							s = s.replace(/\{spid\}/g,o.specialId)
								 .replace(/\{uid\}/g,window.userid)
								 .replace(/\{pic\}/g,o.picture[0])
								 .replace(/\{title\}/g,o.title)
							temp += s;
						})

						$('#my_favor_list').append(temp)
					},'json')
				}).trigger('click')

				$('#my_favor_list').delegate('a[name="cancelFavor"]','click',function(){
						var that = $(this);
						var spid = that.attr('spid');
						$.post('/api/special/cancelfavor',{'spid':spid, 'wxuserid':window.userid},function(d){
								if(d.error) return alert(d.data);
								alert('取消收藏成功');
								var c = $('#favor_count').html() - 1
								$('#favor_count').html(c)
								that.closest('.newsHead').remove();
						},'json')
				})

			}

	}




      $.post('/api/score/daysign',{
        'wxuserid':window.userid
      },function(d){
          window.isajax = false;
          if(d.error) return;
          $('#day_sign_toolbar').fadeIn()
          setTimeout(function(){
          	$('#day_sign_toolbar').fadeOut()
          },3000)
      },'json')



})