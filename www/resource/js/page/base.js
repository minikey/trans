(function($){
	/**
	 * [arrayChunk 按指定个数切分数组]
	 * @param  {number|array}
	 * @return {array}
	 */
	$.arrayChunk = function(limit,array){
		var newDataList = [],
			len = array.length;
			
		if(len){
			var limit = limit || 2;

			for(var i = 0; i < len; i += limit){			
				var list = array.slice(i, i + limit);
				newDataList.push(list);
			}
		}
		return newDataList;
	};

	/**
	 * [getArticleInfo 获得文章的ID和状态]
	 * @param  {jquery对象,modal中确认按钮}
	 * @return {object}
	 */
	getArticleInfo = function(t) {
		var articleId = +(t.closest('.js-article').find('.js-article-id').val());
			articleStatus = +(t.closest('.js-article').find('.js-article-status').val());
		var params = {
			articleId : articleId,
			articleStatus : articleStatus
		};
		return params;
	};
})(jQuery);

$(function(){
	$('.hd .dropdown-button').dropdown({
			outDuration: 0,
			hover: false,
			belowOrigin: true
	});

	$('.modal-trigger').leanModal();

	$(document).on({
		mouseenter: function(e){
			e.preventDefault();

			var hasModal = 0;
			$($(this).find('.modal')).each(function(){
				var t = $(this);
				if(t.css('display') == 'block'){
					hasModal = 1;
					return;
				}
			});
			if(!hasModal){
				$(this).find('.status-link').addClass('active');
				$(this).find('.pop-cont').fadeIn();
			}
		},
		mouseleave: function(e){
			e.preventDefault();
			$(this).find('.status-link').removeClass('active');
			$(this).find('.pop-cont').hide();
		}
	},'table .status-link-td');

//	/* 处理footer的位置*/
//	var footer = $('.page-footer'),
//		windowHeight = $(window).height() || 0,
//		bodyHeight = $('body').height() || 0;
//
//	if(bodyHeight < windowHeight){
//		footer.addClass('fixed-footer');
//	}else{
//		footer.removeClass('fixed-footer');
//	}

});
