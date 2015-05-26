//这里定义一些全局通用的函数，该文件会被自动加载
var whitespace = "[\\x20\\t\\r\\n\\f]";
var rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g");

/* 将list中每条数据的note字段由字符串转成json*/
global.strToJson = function(list){
	var d = list.data,
		dLen = d.length;

	for(var i = 0;i < dLen; i++){
		if(d[i].note){
			var note = JSON.parse(d[i].note);

			for(var p in note){
				list.data[i][p] = note[p];
			}
		}	
	}
	return list;
};

/**
 * [trim 清除字符串两端的空白字符]
 * @param  {string|object} str
 * @return {string}
 */
global.trim = function(text) {
	return text == null ? "" : (text + "").replace(rtrim, "");
};

/* 日期格式化*/
Date.prototype.format = function(format){
	format = format || 'yyyy-MM-dd hh:mm:ss';
		
	var d = this;
	var reg = {
		y: d.getFullYear(),
		M: d.getMonth()+1,
		d: d.getDate(),
		h: d.getHours(),
		m: d.getMinutes(),
		s: d.getSeconds()
	};
	Object.keys(reg).forEach(function(key, idx){
		format = format.replace(new RegExp(key+'+'), function(a){
			return ('0000'+reg[key]).slice(0-a.length);
		});
	});
	return format;
};