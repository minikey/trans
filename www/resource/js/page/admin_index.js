$(function(){
	$('#moneyForm').validate({
		rules:{
			editUsername:{
				required: true
			},
			editMoney:{
				required: true,
				number: true
			}
		},
		messages:{
			editUsername:{
				required: "用户名不能为空;"
			},
			editMoney: {
				required: "输入的积分不能为空;",
				number: "请输入有效的十进制数字"
			}
		},
		errorClass: "valid-error",
		errorPlacement: function(error, element) {  
			error.appendTo(element.parent().siblings('.js-error-tip'));  
		},
		success: function(label){
			label.remove();
		}
	});

	/* 增减用户积分*/
	$(document).on('click','.js-money-submit',function(event){
		event.preventDefault();
		
		if(!$('#moneyForm').valid()){
				return ;
		}
		var params = {
			ausername : $.trim($('#editUsername').val()),
			merit : $.trim($('#editMoney').val())
		};
		userCharger(params);
	});

	function userCharger(params) {
		$.ajax({
			url: '/admin/userCharger',
			data: params,
			type: 'post',
			success: function(data){
				
				var errorTip = $('#moneyForm .js-error-tip');
				if(data.errno == 0){
					errorTip.html('');
					// 操作成功后，同时更新最新积分列表
					getNewestAccHistory();
				}else if(data.errno == 2){
					errorTip.html(data.errmsg);
				}else{
					alert(data.errmsg);
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("网络错误");
				return;
			}
		});
	}
	$("#moneyListForm").validate({
		rules:{
			searchUsername:{
				required: true
			}
		},
		messages:{
			searchUsername:{
				required: "用户名不能为空;"
			}
		},
		errorClass: "valid-error",
		errorPlacement: function(error, element) {  
			error.appendTo(element.parent().siblings('.js-error-tip'));  
		},
		success: function(label){
			label.remove();
		}
	});

	/* 获取指定用户的积分清单*/
	$(document).on('click','.js-moneylist-submit',function(event){
		event.preventDefault();
		
		if(!$('#moneyListForm').valid()){
				return ;
		}
		var params = {
			name : $.trim($('#searchUsername').val())
		};
		seachUserAccHistory (1, params);
	});

	var searchedUserId = 0; // 全局变量，用户ID
	function seachUserAccHistory (page, params) {
		var moneylistWrap = $('.moneylist-wrap');
			limit = 5;

		$.ajax({
			url: '/acchistory/seachUserAccHistory?page='+page+'&limit='+limit,
			data: params,
			type: 'post',
			success: function(data){

				// 处理用户不存在时情况
				if(data.errno){
					moneylistWrap.find('.js-moneylist-user').hide();
					$('#moneyListForm .js-error-tip').html(data.errmsg);

				}else{
					// 返回积分清单
					$('#moneyListForm .js-error-tip').html('');

					// params.userId： 用来区分是第一次查询还是点击查看更多查询 
					// 第一次查询之前为undefined，第一次查询时赋值
					if(params.userId == undefined){
						moneylistWrap.find('.js-moneylist-new').hide().end()
									.find('.js-moneylist-user').show();

						if(data.count > 0){
							searchedUserId = data.data[0].userId;
						}
					}

					var html = template('moneylist', data);
					
					// 防止查询同一个用户，多次点击按钮，记录重复出现
					if(data.page == 1){
						$('.js-moneylist-user tbody').html(html);
					}else{
						$('.js-moneylist-user tbody').append(html);
					}
					
					if(data.page < data.total){
						totalPages[2] = data.total;
						$('.js-moneylist-user .js-more').show();
					}
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("网络错误");
				return;
			}
		});
	}

	// 依次记录undo, done, moneyList，需要显示的页数/总页数
	var showPages = [1, 1, 1],
		totalPages = []; 

	$('.doc').on('click','.js-more',function(e){
		e.preventDefault();
		var me = $(this)
			index = me.data('index');

		showPages[index]++;

		if(index == 0){
			getUncheckedTask(showPages[index], 0);
		}else if(index == 1){
			getUnevaluatedTask(showPages[index]);
		}else if(index == 2){
			var params = {userId : searchedUserId};
			seachUserAccHistory (showPages[index], params);
		}
		
		if(showPages[index] == totalPages[index]){
			me.hide();
		}
	});

	var uncheckedArticleIds = [], // 存放待审核列表中状态更改了的文章id
		unevaluatedArticleIds = []; // 存放待评分列表中状态更改了的文章id

	/* 获取待审核列表*/
	/* page: 需要获取第几页的数据，isNew: 是否为第一次载入*/
	function getUncheckedTask(page, isNew){
		var page = page || showPages[1] || 1,
			limit = 2;
		var params = {};
			params.articleIdCache = (uncheckedArticleIds != undefined) ? uncheckedArticleIds.join(",") : "";

		$.ajax({
			url: '/task/getUncheckedTask?page='+page+'&limit='+limit,
			data: params,
			type: 'post',
			success: function(data){

				var datas = {data: data, isUnchecked: 1};
				var html = template('getTasks', datas);
				$('.js-unChecked-task tbody').append(html);

				if(data.page <= data.total){
					$('.modal-trigger').leanModal();

					// 每次刷新页面时都重置存放已操作过文章id的数组
					if(isNew == 1){
						uncheckedArticleIds = [];
					}

					if(data.page < data.total){
						totalPages[0] = data.total;
						$('.js-unChecked-task .js-more').show();
					}
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getUncheckedTask(1, 1);

	/* 获取待评分列表*/
	/* page: 需要获取第几页的数据，isNew: 是否为第一次载入*/
	function getUnevaluatedTask(page, isNew){
		var page = page || 1,
			limit = 1;
		var params = {};
			params.articleIdCache = (unevaluatedArticleIds != undefined) ? unevaluatedArticleIds.join(",") : "";

		$.ajax({
			url: '/task/getUnevaluatedTask?page='+page+'&limit='+limit,
			data: params,
			type: 'post',
			success: function(data){
	
				var datas = {data: data, isUnchecked: 0};
				var html = template('getTasks', datas);
				$('.js-unEvaluated-task tbody').append(html);

				if(data.page <= data.total){
					$('.modal-trigger').leanModal();

					// 每次刷新页面时都重置存放已操作过文章id的数组
					if(isNew == 1){
						unevaluatedArticleIds = [];
					}

					if(data.page < data.total){
						totalPages[1] = data.total;
						$('.js-unEvaluated-task .js-more').show();
					}
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getUnevaluatedTask(1, 1);

	/* 获取最新积分历史清单*/
	function getNewestAccHistory(){
		
		$.ajax({
			url: '/acchistory/getNewestAccHistory',
			type: 'get',
			success: function(data){
				var html = template('moneylist', data);
				$('.moneylist-wrap').find('.js-moneylist-user').hide().end().find('.js-moneylist-new').show();

				$('.js-moneylist-new tbody').html(html);
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getNewestAccHistory();

	/* 更新列表: updateTask*/
	function updateTask(params, me){

		$.ajax({
			url: '/home/admin/reviewTask',
			data: params,
			type: 'post',
			success: function(data){
				if(data.errno == 0){
					var stateTxt = '',
						stateTxtArr = ['已通过', '已驳回', '合格', '已淘汰'];

					if(params.isCheckList){
						stateTxt = params.isOk ? stateTxtArr[0] : stateTxtArr[1];
						uncheckedArticleIds.push(params.articleId);

					}else{
						stateTxt = params.isOk ? stateTxtArr[2] : stateTxtArr[3];
						unevaluatedArticleIds.push(params.articleId);
					}
					// 更改文章'状态'一栏的显示
					me.closest('.status-link-td').find('.status-link').removeClass('status-link red-mine').html(stateTxt);
					me.closest('.status-link-td').find('.pop-cont').empty();
				}else{
					alert(data.errmsg);
				}
			},
			error: function(){
				console.log("网络异常");
				return;
			}
		});
	}

	$(document).on('click', '.js-ok',function(e){
		e.preventDefault();
		var me = $(this);

		var params = getArticleInfo(me),
			addParams = {};

		var closestTr = me.closest('tr');
		params.merit = $.trim(closestTr.find('.js-merit').html());
		params.cusername = $.trim(closestTr.find('.js-cusername').html());
		params.ausername = $.trim(closestTr.find('.js-ausername').html());

		// params.isCheckList: 1,待审核列表的操作
		// params.isOk: 1,肯定操作(通过，合格)
		params.isOk = me.hasClass('js-giveup') ? 0 : 1;
		params.isCheckList = params.articleStatus ? 0 : 1;

		updateTask(params, me);
	});

});