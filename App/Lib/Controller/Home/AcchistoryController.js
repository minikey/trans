var accHistoryService = require('../../service/AccHistoryService'),
	userService = require('../../service/UserService'),
	taskService = require('../../service/TaskService'),
	accService = require('../../service/AccService');

module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {

		/**
		 * [getTopUserAction 获取打赏金额最多的用户]
		 * @return {json}
		 */
		getTopRichUserAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;
			
			return accHistoryService.getTopRichUser(page, limit).then(function(res) {
				return self.json(res);
			});
		},

		/**
		 * [getTaskMeritUserAction 获取给某一文章打赏过的用户]
		 * @return {json}
		 */
		getTaskMeritUserAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			var params = self.post();

			return accHistoryService.getTaskMeritUser(page, limit, params.taskId).then(function(res) {
				return self.json(res);
			});
		},

		/**
		 * [getNewestAccHistoryAction 获取最新积分历史清单]
		 * @return {json}
		 */
		getNewestAccHistoryAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 5,
				self = this;
			return accHistoryService.getNewestAccHistory(page, limit).then(function(res) {
				return self.json(res);
			});
		},

		/**
		 * [seachAccHistoryAction 获取查询指定用户的积分历史清单]
		 * @return {json}
		 */
		seachUserAccHistoryAction: function(){
			var page = this.get('page') || 1,
				limit = this.get('limit') || 5,
				self = this;

			var params = self.post();
			// params.userId： 用来区分是第一次查询还是点击查看更多查询 
			if(params.userId == undefined){
	
				return userService.getUserByName(params.name).then(function(user){
					if(user != null){
						return accHistoryService.seachUserAccHistory(page, limit, user).then(function(res) {
							return self.json(res);
						});
					}else{
						return self.error(2, '查询的用户不存在');
					}
				}).catch(function(){
					return self.error(2, '查询的用户不存在或查询积分操作失败');
				});

			}else{
				// 点击查看更多查询
				return accHistoryService.seachUserAccHistory(page, limit, params.userId).then(function(res) {
					return self.json(res);
				}).catch(function(error){
					return self.error(2, '查询积分操作失败');
				});
			}
		},

		/**
		 * [donateMoneyAction 用户打赏]
		 * @return {json}
		 */
		donateMoneyAction: function(){
			var self = this,
				params = self.post(),
				donateMoneyId = params.donateMoneyId || 0,
				donateMoneyType = 0,
				taskid = params.articleId,
				ctime = new Date().format();

			return self.session('userInfo').then(function(userInfo){
			
				var getCuser = userService.getUserById(userInfo.id),
					getHist = accHistoryService.getAccHistory({
						'cuser': userInfo.id,
						'taskid': taskid,
						'type': 0 // 打赏类型
					}, ['id']),
					getAcc = accService.getDonAccById(donateMoneyId);

				return Promise.all([getCuser, getHist]).then(function(list){
					var cuser = list[0],
						his = list[1];
					
					if (his.length) {
						return self.error(9, '您已经打赏过了!');
					}
						
					return getAcc.then(function(acc) {
						if(cuser != null && acc){
							var merit = acc.merit;// 获得对应积分type的积分值
	
							if(cuser.riches >= merit){
								// 更新task信息
								// 用户riches更新
								// accHistory插入一条记录
								
	
								var task = {
									"id": taskid
								};
								
								var accHistory = {
									"type": donateMoneyType,
									"merit": -merit,
									"cuser": cuser.id,
									"ctime": ctime,
									"taskid": taskid
								};
	
								var updateTask = taskService.updateIncTaskMerit(task, merit),
									updateUserRiches = userService.updateIncUserRiches(cuser, -merit),
									saveAccHistory = accHistoryService.saveAccHistory(accHistory);
	
								return Promise.all([updateTask, updateUserRiches, saveAccHistory]).then(function(list){
							
									return self.success('为用户操作积分成功。');
	
								}).catch(function(){
									return self.error(1, '为用户操作积分失败。');
								});
							}else{
								return self.error(2, '打赏失败，用户财富值不够');
							}
						}
					});
				}).catch(function(){
					return self.error(2, '用户不存在或无法获取积分信息。');
				});
				
			}).catch(function(){
				return self.error(99, '操作失败。无法获取登录用户信息');
			});
		}
	};
});