/**
 * controller
 * @return
 */
module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {
		indexAction: function() {
			var self = this;

			this.session('userInfo').then(function(userInfo) {
				self.display();
			});
		}
	};
});
