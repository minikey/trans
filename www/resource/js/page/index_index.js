$(function() {

	/* 这代码写的。。。。*/
	/* panel小弹框出现*/
	$(document).on({
		click: function(e){
			e.preventDefault();
			var me = $(this);

			if(me.hasClass('js-get-moneylist')){
				getDonAccmulation();
				
				// 读取acc表并插入模板到邻近的collection中
				$('.js-money-panel').html('');
				me.siblings('.js-money-panel').html(moenyPanelHtml);
				$('.modal-trigger').leanModal();
			}

			me.closest('.panel-wrap').find('.js-pop-cont').fadeIn();
			return false;
		}
	},'.panel-wrap .js-panel-btn');
	
	var moenyPanelHtml = '';
	// 得到moneyPanle中的collection列表 
	function getDonAccmulation(){
		!moenyPanelHtml && $.ajax({
			url: '/acc/getDonAcc',
			type: 'get',
			success: function(data){
				if(data.errno == 401){
					alert(data.errmsg);
				}else{
					var html = template('moenyPanel', data);
					moenyPanelHtml = html;
				}
			},
			error: function(){
				console.log("网络异常");
				return;
			}
		});
	}
	
	getDonAccmulation();
	
	/* 点击领走文章小弹框的确认或取消：隐藏小弹框*/
	$(document).on({
		click: function(e){
			e.preventDefault();

			var me = $(this);
			me.closest('.js-pop-cont').hide();

			// 点击确认领取按钮
			if(me.hasClass('ok-btn')){
				var params = getArticleInfo(me);
				updateTask(params);
			}
			return false;
		}
	},'.panel-wrap .js-confirm-article-btn');

	/* 更新列表: updateTask*/
	function updateTask(params){
		$.ajax({
			url: '/home/task/updateTask',
			data: params,
			type: 'post',
			success: function(data){
				if(data.errno == 0){
					// 重新获取wait列表
					getWaitTask(1, 1);
					
				}else{
					console.error("updateTask is wrong");
					alert(data.errmsg);
				}
			},
			error: function(){
				console.error("网络异常");
				return;
			}
		});
	}

	/* 点击除了打赏选择框之外区域，打赏框消失*/
	$(document).on('click',function(e){
		if ($(e.target).is('.js-coll-item')){
			return;
		}else{

			$('.money-panel').each(function (index) {
				var me = $(this);
				if(me.css("display") == "block") {
					me.hide();
				}
			});
		}
	});

	var donateMoneyId = 0,
		donateMoneyValue = 0,
		donateMoneyType = -1;
	$(document).on('click', '.panel-wrap .js-coll-item', function(e){
		e.preventDefault();
		var me = $(this),
			num = me.data('num'),
			type = me.data('index'),
			moenyValue = +me.find('.js-money-value').text();

		donateMoneyId = num; //保存要打赏金额的所属id
		donateMoneyValue = moenyValue;
		donateMoneyType = type;

		$('.confirm-money-num').text(donateMoneyValue);
	});

	/* 确认打赏*/
	$(document).on('click', '#confirm-money .ok-btn', function(e){
		e.preventDefault();
		var me = $(this);
		var params = getArticleInfo(me);
		params.donateMoneyId = donateMoneyId;

		donateMoney(params, me);
	});

	function donateMoney(params, me){
		$.ajax({
			url: '/acchistory/donateMoney',
			data: params,
			type: 'post',
			success: function(data){

				if(data.errno == 0){
					var articleMoneyEl = me.closest('.js-article').find('.article-money'),
						articleMoney = +(articleMoneyEl.text());

					articleMoneyEl.text(articleMoney + donateMoneyValue);
				}else{
					alert(data.errmsg);
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}

	/* 获取给某一文章打赏过的用户*/
	function getTaskMeritUser($dom, taskId){
		var page = 1,
			limit = 10,
			params = {
				taskId: taskId
			};

		$.ajax({
			url: '/acchistory/getTaskMeritUser?page='+page+'&limit='+limit,
			data: params,
			type: 'post',
			success: function(data){
				var html = template('collection', data);
				$dom.append(html);
				$dom.find('.donate-money-list').show();
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}

	$('.main').on({
		mouseenter: function(e){
			e.preventDefault(); 
			var me = $(this);
			
			var params = getArticleInfo(me);
			if(me.find('.donate-money-list').length == 0){
				getTaskMeritUser(me, params.articleId);
			}else{
				$(this).find('.donate-money-list').show();
			}
		},
		mouseleave: function(e){
			e.preventDefault();
			$(this).find('.donate-money-list').hide();
		}
	}, '.js-donate-money');

	
	// 依次记录undo, done, undo，需要显示的页数/总页数
	var showPages = [1, 1, 1],
		totalPages = []; 

	$('.doc').on('click','.js-more',function(e){
		e.preventDefault();
		var me = $(this),
			index = me.data('index');

		showPages[index]++;

		if(showPages[index] >= totalPages[index]){
			me.hide();
		}

		if(index == 0){
			getWaitTask(showPages[index], 0);
		}else if(index == 1){
			getCompletedTask(showPages[index]);
		}else if(index == 2){
			getRunningTask(showPages[index]);
		}
	});

	/* 获取待领取文章列表 */
	/* page: 需要获取第几页的数据，isFirst: 是重新载入还是点击more获取*/
	function getWaitTask(page, isFirst){
		var limit = 10;
		page = page || 1;

		$.ajax({
			url: '/task/getWaitTask?page='+page+'&limit='+limit,
			type: 'post',
			success: function(data){

				var undoList = $('.js-undo-list'),
					more = $('.js-undo-list-wrap .js-more');

				var html = template('getWaitTask', data);
				isFirst ? undoList.html(html) : undoList.append(html);
			
				if(data.page <= data.total){
					$('.modal-trigger').leanModal();

					if(data.page < data.total){
						totalPages[0] = data.total;
						more.show();
					}else{
						more.hide();
					}
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getWaitTask(1, 1);

	function getCompletedTask(page){
		var limit = 10;
		page = page || showPages[1] || 1;
			
		$.ajax({
			url: '/task/getCompletedTask?page='+page+'&limit='+limit,
			type: 'post',
			success: function(data){
				var html = template('getOtherTask', data);
				$('.js-done-list-wrap').append(html);
		
				if(data.page < data.total){
					totalPages[1] = data.total;
					$('.js-done-list-wrap .js-more').show();
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getCompletedTask(1);

	function getRunningTask(page){
		var limit = 10;
		page = page || showPages[2] || 1;

		$.ajax({
			url: '/task/getRunningTask?page='+page+'&limit='+limit,
			type: 'post',
			success: function(data){
				var html = template('getOtherTask', data);
				$('.js-doing-list-wrap').append(html);

				if(data.page < data.total){
					totalPages[2] = data.total;
					$('.js-doing-list-wrap .js-more').show();
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getRunningTask(1);

	/* 提交译文验证*/
	function validateForm(){
		var validater = $("#newArticleForm").validate({
			rules:{
				title:{
					required: true
				},
				addr:{
					required: true,
					url: true
				},
				des:{
					required: true
				}
			},
			messages:{
				title:{
					required: "原文标题不能为空;"
				},
				addr:{
					required: "原文地址不能为空;",
					url: "请输入合法的url地址"
				},
				des:{
					required: "原文描述不能为空;"
				}
			},
			errorClass: "valid-error",
			errorPlacement: function(error, element) {  
				error.appendTo(element.parent().siblings('.js-error-tip'));  
			},
			success: function(label,el){
				label.remove();
			}
		});

		if($('#newArticleForm').valid()){
			// 清空表单
			$('#newArticleForm')[0].reset();
			$('#newArticleForm .js-error-tip').empty();
			return true;
		}else{
			return false;
		}
	}

	function saveTask(params){
		$.ajax({
			url: '/task/saveTask',
			data: params,
			type: 'post',
			success: function(data){

				if(!data.errno){
					alert(data.data);
				}else{
					alert(data.errmsg);
				}
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	
	/* 投稿form*/
	$(document).on('click','.js-submit-article',function(e){
		e.preventDefault();
		var me = $(this);

		var params = {
			"title": $.trim($('#title').val()),
			"ourl": $.trim($('#addr').val()),
			"des": $.trim($('#des').val())
		};
		if(validateForm()){
			saveTask(params);
			// 手动关闭弹出层
			$('.new-article-modal').hide();
			$('#lean-overlay').hide();
		}else{
			// console.log("表单验证不通过");
			return;
		}
	});

	/* 获取翻译文章最多的用户*/
	function getTopTaskUser(){
		var page = 1,
			limit = 10;
		$.ajax({
			url: '/task/getTopTaskUser?page='+page+'&limit='+limit,
			type: 'post',
			success: function(data){

				var lists = {userList: data};
				var html = template('topTaskUser', lists);
				$('.js-top-task-user').append(html);
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getTopTaskUser();

	function getTopRichUser(){
		var page = 1,
			limit = 10;
		$.ajax({
			url: '/acchistory/getTopRichUser?page='+page+'&limit='+limit,
			type: 'post',
			success: function(data){
				
				var lists = {userList: data};
				var html = template('topRichUser', lists);
				$('.js-top-rich-user').append(html);
					
			},
			error: function(data){
				console.log("网络异常");
				return;
			}
		});
	}
	getTopRichUser();
});