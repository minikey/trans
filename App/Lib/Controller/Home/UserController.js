/**
 * controller
 * @return
 */
var userService = require('../../service/UserService');
var taskService = require('../../service/TaskService');

module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {
		indexAction: function() {
			var self = this;

			/*return this.session('userInfo').then(function(userInfo) {
				var getUserInfo = userService.getUserInfo(userInfo),
					getMyTask = taskService.getMyTask(userInfo.id, 1, 5),
					getMyCreatedTask = taskService.getMyCreatedTask(userInfo.id, 1, 5);

				return Promise.all([getUserInfo, getMyTask, getMyCreatedTask]).then(function(list) {
					var user = list[0];

					user.myTask = list[1];
					user.myCreated = list[2];
					self.assign(user);

					getUserInfo = getMyTask = null;
					return self.display();
				});
				
			});*/
			this.session('userInfo').then(function(userInfo) {
				self.display();
			});
			
		},

		completeAction: function(){
			var self = this;
			return self.display(); 
		},

		getUserInfoAction: function() {
			var self = this;

			return self.session('userInfo').then(function(userInfo) {
				if (userInfo) {
					return userService.getUserInfo(userInfo).then(function(user) {
						return self.json(user);
					});
				} else {
					return self.json({
						errno: 1,
						msg: '无法获取当前用户信息'
					});
				}
			});
		},

		checkEmailAction: function() {
			var email = this.get('email'),
				self = this,
				result;

			if (isEmpty(email)) {
				result = {
					errno: 1,
					msg: 'Email为空'
				};
				return self.json(result);
			} else {
				return userService.checkEmail(email).then(function(flag) {
					result = {
						errno: 0,
						msg: '',
						data: flag
					};
					return self.json(result);
				});
			}
		},

		/**
		 * [checkNameAction 检测用户名是否存在]
		 * @return {json}
		 */
		checkNameAction: function() {
			var name = this.get('name'),
				self = this;
			if (isEmpty(name)) {
				return this.json({
					errno: 1,
					msg: '用户名为空'
				});
			} else {
				return userService.checkName(name).then(function(flag) {
					return self.json({
						erron: 0,
						msg: '',
						data: flag
					});
				});
			}
		}
	};
});
