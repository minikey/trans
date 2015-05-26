$(function(){

	/* 获得用户信息*/
	function getUserInfo(){
		$.getJSON('/home/user/getUserInfo').then(function(data){
			if(data){
				var html = template('getUserInfo', data);
				$('.js-info-wrap').html(html);
			}else{
				$('.js-info-wrap').html("获取用户资料失败");
			}	
		});
	}

	var showArticleListNum = 1, // 显示第几页已获取的文章
		showCArticleListNum = 1; // 显示第几页已投稿的文章

	/* 点击查看更多，获取文章; wrap，jquery对象；isCreated，区分两个列表*/
	/* 左边文章状态的改变会影响右边的列表*/
	/* todo: 提成公用函数*/
	function getMore(wrap,isCreated){
		var moreEl = $('.js-more', wrap),
			showListNum = !isCreated ? showArticleListNum : showCArticleListNum;

		moreEl.click(function(e){
			e.preventDefault();
			showListNum++;

			var trs = wrap.find('.js-tr');
			trs.each(function(index){
				var me = $(this);
				if(me.data('num') == showListNum){
					me.removeClass('showLater');
				}
			});
			if(!trs.hasClass('showLater')){
				wrap.find('tr').last().remove();
			}
			if(!isCreated){
				showArticleListNum = showListNum;
			}else{
				showCArticleListNum = showListNum;
			}
		});
	}
	
	/* 获得已领取的文章列表*/
	function getMyTask(){
		$.getJSON('/home/task/getMyTask').then(function(datas){

			var limit = 2,
				newDataList = $.arrayChunk(limit, datas.data);

			var data = {newDataList:newDataList, limit:limit, showListNum:showArticleListNum};
			var html = template('getArticleTable', data);
			$('.js-get-article tbody').html(html);

			if(datas.data.length){
				$('.modal-trigger').leanModal();

				getMore($('.js-get-article'), 0);
			}
		});
	}

	/* 更新getMyCreateTask*/
	function getMyCreatedTask(){
		$.getJSON('/home/task/getMyCreatedTask').then(function(datas){

			var limit = 2,
				newDataList = $.arrayChunk(limit,datas.data);

			var data = {newDataList:newDataList,limit:limit,showListNum:showCArticleListNum};
			var html = template('getCreatedArticleTable', data);

			$('.js-get-created-article tbody').html(html);

			datas.data.length && getMore($('.js-get-created-article'),1);
		});
	}

	/*更新三个区域的数据*/
	getUserInfo();
	getMyTask();
	getMyCreatedTask();

	/* 更新列表:updateTask*/
	function updateTask(params){
		$.ajax({
			url: '/home/task/updateTask',
			data: params,
			type: 'post',
			success: function(data){

				// 更新三个区域的数据
				$('.js-get-article tbody').html();
				getMyTask();

				$('.js-info-wrap').html();
				getUserInfo();

				$('.js-get-create-article tbody').html();
				getMyCreatedTask();
			},
			error: function(){
				console.log("网络异常");
				return;
			}
		});
	}

	/* 提交译文验证*/
	function validateForm(){
		$("#submitArticleForm").validate({
			rules:{
				doneAddr:{
					required: true,
					url: true
				}
			},
			messages:{
				doneAddr:{
					required: "译文地址不能为空;",
					url: "请输入合法的url地址"
				}
			},
			errorClass: "valid-error",
			errorPlacement: function(error, element) {  
				error.appendTo(element.parent().siblings('.js-error-tip'));  
			},
			success: function(label){
				label.remove();
			},
			onfocusout: function(el, evt){
				return $(el).valid();
			}
		});
		return $('#submitArticleForm').valid();
	}

	/* 提交译文*/
	$(document).on('click','.js-submit-task',function(e){
		e.preventDefault();
		var me = $(this);

		if(!validateForm()){
			return;
		}else{
			var turl = $.trim($('#doneAddr').val()),
				ourl = $.trim($('#doneAddr').closest('.status-link-td').siblings('.js-article-info').find('.js-ourl').attr('href'));

			var params = getArticleInfo(me);
			params.turl = turl;
			params.ourl = ourl;

			updateTask(params);
			$('#lean-overlay').hide();
		}
	});	
	

	/*取消翻译*/
	$(document).on('click','.js-confirm-giveup',function(e){
			e.preventDefault();
			var me = $(this);

			var params = getArticleInfo(me);
				params.undo = 1;

			$.ajax({
				url: '/home/task/updateTask',
				data: params,
				type: 'post',
				success: function(data){
					if(!data.errno){
						me.closest('.status-link-td').find('.status-link').removeClass('status-link red-mine').html('已取消');
						me.closest('.status-link-td').find('.pop-cont').empty();

						//更新个人信息部分的数据
						$('.js-info-wrap').html();
						getUserInfo();
						getMyCreatedTask();
					}else{
						alert("取消失败");
					}
				},
				error: function(){
					console.log("网络异常");
					return;
				}
			});
		}
	);

	/* 开始翻译*/
	$(document).on('click','.js-start-task',function(e){
		e.preventDefault();
		var me = $(this);

		var params = getArticleInfo(me);
		updateTask(params);
	});	
});