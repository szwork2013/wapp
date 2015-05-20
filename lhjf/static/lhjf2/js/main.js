		$(function() {
			$('#showmore').click(function(){
					$('.show_con').slideToggle();
			})
			$('#sigin').on('click',function(){
			$.post(url.e,{'sigin':1},function(data){
				$('#myModal2').modal('show')
				$('.modal-body').html(data.i);
				//window.location.reload();
//				alert(data.s);
//				alert(data.t);
			},'json')
			$('#close1').on('click',function(){
				window.location.reload();
			})
			
		})
			var height=$(window).height();
			var width=$(window).width()*0.6;
			$('body').css('min-height',height);
			$('#subuserinfo').click(function(){

				var name=$('input[name=name]').val();
				var tel=$('input[name=tel]').val();
				var roomnum=$('input[name=roomnum]').val();
				if(name==''||!name){
					$('input[name=name]').popover('show');

					return false;
				}
				if(tel==''||!tel){
					$('input[name=tel]').popover('show');
					return false;
				}
				$.post(url.d,{"name":name,"tel":tel,"roomnum":roomnum},function(data){
					if(Number(data)==1){
						$('#input-info').modal('hide')
						window.location.reload();
					}
				},'json')
			})
				$('#usescore').click(function() {
					var id = $("#pic").attr('data-info');
					$('.loading').show();
							$('#usescore').hide();
					$.post(url.a, {
						'id': id
					}, function(data) {
						// alert(data);
							if(Number(data.num)==0){

							$('.loading').hide();
							$('#myModal').modal('hide')
							$('#prompt').html(data.info);
							$('#myModal2').modal('show');	
							$('#sub_all,#usescore').show();						
						}else{
							$('.loading').hide();
							$('#usescore').show();	
							$('#myModal').modal('hide')
							$('#prompt').html(data.info);
							$('#myModal2').modal('show');	
							$('#sub_all').hide();	
						}
					
					}, 'json')
				})
				$("#perfect").click(function(){
					window.location.href=url.b;
				})
				$(".moreinfo").click(function() {
					var id = $(this).attr('data-info');
					var pro=$(this).attr('data-pro');
					var ajaxurl;
					if (pro=='use') {
						ajaxurl=url.c_use;
							$.post(ajaxurl, {
						'id': id
					}, function(data) {
						// alert(data);
						$("#picurl").attr('src', data.picurl)
						$("#pic").attr('data-info', data.id)
						$("#myModalLabel").html(data.name)
						$("#description").html("产品描述：" + data.description)
						$("#score").html("需要分数：" + data.score)
						$("#totalcount").html("总数：" + data.totalcount)
						$("#count").html("剩余数量：" + data.count)
						$("#startdate").html("开始时间：" + data.startdate);
						$("#lastdate").html("结束时间：" + data.lastdate)
					}, 'json');
					}else{
						ajaxurl=url.c_get;
							$.post(ajaxurl, {
						'id': id
					}, function(data) {

						 // alert(data);
						$("#picurl").attr('src', data.picurl)
						$("#pic").attr('data-info', data.id)
						$("#myModalLabel").html(data.name)
						$("#description").html("活动描述：" + data.description)
						$("#score").html("获得分数：" + data.score)
						$("#startdate").html("开始时间：" + data.startdate);
						$("#lastdate").html("结束时间：" + data.lastdate)
					}, 'json');
					}
					//alert(id);
				
				})
				$('#getscore').bind('click',function(){
					var id=$('.moreinfo').attr('data-info');
						$.post(url.j,{'id':id},function(data){
							window.location.href=data.url;
						},'json')
				})
				$('#score_info').click(function(){
					window.location.href=url.f;
				})
				$('#mb_info').click(function(){
					window.location.href=url.b;
				})
				$('#usescore_info').click(function(){
					window.location.href=url.x;
				})
			})