/**
 * controller
 * @return
 */
var accService = require('../../service/AccService');

module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {
		getDonAccAction: function() {
			var self = this;

			return accService.getAllDonAcc().then(function(res){
				return self.json({errno:0, data: res});
			}).catch(function(err){
				console.error(err);
				return self.error('100','操作失败。');
			});
		}
	};
});
