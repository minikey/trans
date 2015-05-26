$(function(){

	$('#completeForm').validate({
		rules:{
			useremail:{
				required: true,
				email: true
			}
		},
		messages:{
			useremail: {
				required: "请输入邮箱地址",
				email: "请输入正确格式的邮箱地址"
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

	$(document).on('click','.js-complete-info',function(event){
		event.preventDefault();
		
		if(!$('#completeForm').valid()){
				return ;
		}
		var params = {
			username : $.trim($('#username').val()),
			useremail : $.trim($('#useremail').val())
		};

		// 这里给后端传输数据
		console.log(params);
		
	});
});