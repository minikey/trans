var taskService = require('../../service/TaskService'),
	userService = require('../../service/UserService'),
	accService = require('../../service/AccService'),
	accHistoryService = require('../../service/AccHistoryService');

/**
 * controller
 * @return 
 */
module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {
		/**
		 * [getWaitTaskAction 获取待翻译列表]
		 * @return {json}
		 */
		getWaitTaskAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			return taskService.getWaitTask(page, limit).then(function(res) {
				return self.json(strToJson(res));
			}).catch(function() {
				return self.error(100, '操作失败。');
			});
		},

		/**
		 * [getCompletedTaskAction 获取已完成列表]
		 * @return {json}
		 */
		getCompletedTaskAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			return taskService.getCompletedTask(page, limit).then(function(res) {
				return self.json(strToJson(res));
			});
		},

		/**
		 * [getRunningTaskAction 获取正在进行中的列表]
		 * @return {json}
		 */
		getRunningTaskAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			return taskService.getRuningTask(page, limit).then(function(res) {
				return self.json(strToJson(res));
			});
		},

		/**
		 * [getUncheckedTaskAction 获取待审核的列表]
		 * @return {json}
		 */
		getUncheckedTaskAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			var params = self.post(),
				articleIds = params.articleIdCache || '';

			return taskService.getUncheckedTask(page, limit, articleIds).then(function(res) {
				return self.json(strToJson(res));
			});
		},
		
		/**
		 * [getUnevaluatedTaskAction 获取待评分的列表]
		 * @return {json}
		 */
		getUnevaluatedTaskAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;
			
			var params = self.post(),
				articleIds = params.articleIdCache || '';

			return taskService.getUnevaluatedTask(page, limit, articleIds).then(function(res) {
				return self.json(strToJson(res));
			});
		},

		/**
		 * [getTopTaskUserAction 获取翻译文章最多的用户]
		 * @return {json}
		 */
		getTopTaskUserAction: function() {
			var page = this.get('page') || 1,
				limit = this.get('limit') || 10,
				self = this;

			return taskService.getTopTaskUser(page, limit).then(function(res) {
				return self.json(res);
			});
		},

		/**
		 * [saveTaskAction 投稿]
		 * @return {json}
		 */
		saveTaskAction: function() {
			var self = this,
				params = self.post(),
				rewAccId = 8, // 系统奖励金币id
				rewAccType = 5; // 系统奖励类型

			return self.session('userInfo').then(function(userInfo) {

				var getAcc = accService.getAccById(rewAccId);

				return getAcc.then(function (acc) {
					if (acc) {
						var merit = acc.merit, // 获得对应积分type的积分值
							ctime = new Date().format(),
							note = {
								"ourl": params.ourl,
								"des": params.des
							},
							noteStr = JSON.stringify(note),
							task = {
								"state": 0,
								"title": params.title,
								"type": 1,
								"cuser": userInfo.id,
								"priority": 1,
								"ctime": ctime,
								"merit": merit,
								"note": noteStr
							};

						return taskService.saveTask(task).then(function(id){
							var taskid = id;
							var accHistory = {
								"type": rewAccType, // 系统奖励类型
								"merit": merit,
								"ctime": ctime,
								"taskid": taskid,
								"note": 'system' // 备注一下,表明是系统增加的
							};

							var saveAccHistory = accHistoryService.saveAccHistory(accHistory);

							return saveAccHistory.then(function(list){
								return self.success('投稿成功。');
							}).catch(function(){
								return self.error(1, '投稿失败。');
							});
						});
					}
				}).catch(function(err){
					console.log(err);
					return self.error(2, '用户不存在或无法获取积分信息。');
				});
			});
		},

		/**
		 * [getMyCreateTaskAction 我投稿的文章]
		 * @return {}
		 */
		getMyCreatedTaskAction: function() {
			var self = this,
				page = 1,
				limit = 3,
				isCreated = 1;
	
			return self.session('userInfo').then(function(userInfo) {
				return taskService.getMyCreatedAllTask(userInfo.id, isCreated).then(function(list) {
					return self.json(list);
				});
			});
		},

		/**
		 * [getMyTaskAction 我领取的文章]
		 * @return {}
		 */
		getMyTaskAction: function() {
			var self = this,
				page = 1,
				limit = 3,
				isCreated = 0;

			return self.session('userInfo').then(function(userInfo) {
				return taskService.getMyAllTask(userInfo.id, isCreated).then(function(list) {
					return self.json(strToJson(list));
				});
			});
		},
		/**
		 * [getMyTaskAction 更新任务状态]
		 * @return {}
		 */
		updateTaskAction: function() {
			var self = this;
			var task = {},
				params = self.post(),
				state = isEmpty(params.articleStatus) ? -1 : +params.articleStatus,
				undo = isEmpty(params.undo) ? -1 : +params.undo;

			return self.session('userInfo').then(function(userInfo){

				switch(state){
					case 1: // 领取文章
						state = 4; // 直接进行中
						task.auser = userInfo.id;
						break;
					case 3:
						if(undo == 1){
							state = 1; // 被用户取消的文章回到待翻译列表中
							task.auser = null;
						}else{
							state = 4;
						}
						break;
					case 4:
						if(undo == 1){
							state = 1; // 被用户取消的文章回到待翻译列表中
							task.auser = null;
						}else{
							state = 5;
							var note = {};
							note["ourl"] = params.ourl;
							note["turl"] = params.turl;

							task.note = JSON.stringify(note);
						}
						break;
					default:
						console.error('the state is wrong!!!!');
				};	

				task.id = params.articleId;
				task.state = state;

				return taskService.updateTask(task).then(function(affectedRows) {
					if( affectedRows > 0 ) {
						return self.success('操作成功。');
					} else {
						return self.error(100, '操作失败。', affectedRows);
					}
				});
			}).catch(function(){
				return self.error(99, '操作失败。无法获取登录用户信息');
			});
		}
	};
});
