$(function(){
	function getMyMSG(page, limit, isAppend) {
		$.ajax({
			url: '/message/getMsg?page=' + page + '&limit=' + limit,
			type: 'get',
			success: function(data){
				showMsg(data, isAppend);
			},
			error: function(){
				console.error("网络异常");
			}
		});
	}
	
	function deleteMsg($dom) {
		var id = $dom.data('id');
		
		$.ajax({
			url: '/message/deleteMsg?id=' + id,
			type: 'get',
			success: function(data){
				if (data.errno) {
					alert('操作失败！');
				} else {
					$dom.parents('tr').remove();
				}
			},
			error: function(){
				alert('操作失败！');
			}
		});
	}
	
	function markMsg($dom) {
		var id = $dom.data('id');
		$.ajax({
			url: '/message/markMsg?id=' + id,
			type: 'get',
			success: function(data){
				if (data.errno) {
					alert('操作失败！');
				} else {
					$dom.removeClass('msg-unread js-msg-unread');
				}
			},
			error: function(){
				alert('操作失败！');
			}
		});
	}
	
	function showMsg(data, isAppend) {
		var html = template('msg-table', data),
			dom = $('#msg-body');
		if (!isAppend) {
			dom.empty();
		}
		dom.append(html);
	}
	
	getMyMSG(1, 10);
	
	$('#msg-body').on('click', '.remove', function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (confirm('确认要删除吗?')) {
			deleteMsg($(this));
		}
		
	});
	
	$(document).on('click', '.js-msg-unread', function(e){
		markMsg($(this));
	});
});