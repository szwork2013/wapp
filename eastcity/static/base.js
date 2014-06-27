var specialListTemplate = '<li class="newsHead" >'+
                '<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<img src="{pic}" width="70" height="52"/></a>'+
                '<a href="/view/service/specialdetail?spid={spid}&wxuserid={uid}" target="_blank">'+
                '<div><p class="newsTitle">{title}</p></div>'+
                '</a> </li>'

var specialCommentTemplate = '<div><p class="clearfix">'+
    						 '<span class="fl-l author61">{name}</span>'+
    					     '<span class="fl-r">{time}</span></p>'+
  							 '<p>{content}</p></div>'


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
			$('#listMore').trigger('click')
		})

		$('#listMore').click(function(){
			if(window.isajax) return false
			window.isajax = true;
			$.post('/api/info/speciallist',{'type':window.current_sp_type,'wxuserid':window.userid, 'page':window.current_sp_page},function(d){
				window.isajax = false;
				window.current_sp_page++;
				if(d.error) return alert(d.data);
				if(d.length == 0) return $('#listMore').hide();
				var temp = ''
				d.forEach(function(o){
					var s = specialCommentTemplate;
					s = s.replace(/\{spid\}/g,o._id)
						 .replace(/\{uid\}/g,window.uid)
						 .replace(/\{pic\}/g,o.picture[0])
						 .replace(/\{title\}/g,o.title)
					temp += s;
				})
				$('#specialListContent').append(temp)
			},'json')
		})

	}


	if($('#commentList').length>0){
		window.current_sp_page = 1;
		window.current_sp_id = $('#listMore').attr('spid');

		$('#listMore').click(function(){
			if(window.isajax) return false;

			window.isajax = true
			$.post('/api/special/getcomment',{'spid':window.current_sp_id,'wxuserid':window.userid,'page':window.current_sp_page},function(d){
				window.isajax = false;
				window.current_sp_page++;
				if(d.error) return alert(d.data);
				if(d.length == 0) return $('#listMore').hide();
				var temp = ''
				d.forEach(function(o){
					var s = specialListTemplate;
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
					var s = specialListTemplate;
					s = s.replace(/\{name\}/g,window.appUserName)
						 .replace(/\{time\}/g,d.data.writeTime)
						 .replace(/\{content\}/g,contentv)

				$('#commentList').prepend(s)
				alert('回帖成功')
			},'json')

		})

		$('#sendFavor').click(function(){
			if(window.isajax) return false;
			var that = $(this);
			window.isajax = true
			$.post('/api/special/sendfavor',{'spid':window.current_sp_id, 'wxuserid':window.userid},function(d){
				window.isajax = false;
				if(d.error) return false;
				that.html('已收藏')
				alert('收藏成功')
			},'json')

		})

	}



})