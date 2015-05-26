var userService = require('../../service/UserService'),
	taskService = require('../../service/TaskService'),
	accHistoryService = require('../../service/AccHistoryService'),
	accService = require('../../service/AccService'),
	msgService = require('../../service/MessageService');

/**
 * controller
 * @return
 */

module.exports = Controller("Home/BaseController", function() {
	"use strict";
	return {
		indexAction: function() {
			var self = this;		
			return self.display(); 
		},

		/**
		 * [userChargerAction 给某一用户增加积分，同时在AccHistory里增加一条记录]
		 * @return {json}
		 */
		userChargerAction: function(){
			var self = this;
			var params = self.post();
			
			var getAuser = userService.getUserByName(params.ausername),
				getCuser = params.cusername != null ? userService.getUserByName(params.cusername) : self.session('userInfo');

			return Promise.all([getAuser, getCuser]).then(function(list){
				var auser = list[0],
					cuser = list[1];

				if(auser != null && cuser != null){
					var ctime = new Date().format(),
						merit = +params.merit || 0;

					var accHistory = {
						"type": 1,
						"merit": merit,
						"cuser": cuser.id,
						"auser": auser.id, 
						"ctime": ctime
					};
					
					var saveAccHistory = accHistoryService.saveAccHistory(accHistory),
						updateUserRiches = userService.updateIncUserRiches(auser, merit); // 为相应的用户增加积分

					Promise.all([saveAccHistory, updateUserRiches]).then(function(saveList) {

						var ids = {'accHistoryId': saveList[0],'userId': saveList[1]};

						return self.success('为用户操作积分成功。');
					}).catch(function(error){
						return self.error(100, '操作失败。');
					});
				}else{
					return self.error(2, '用户不存在。');
				}
			});
		},

		reviewTaskAction: function(){
			var self = this;
			var addInfo = {},
				task = {},
				params = self.post(),
				isOk = isEmpty(params.isOk) ? -1 : +params.isOk;

			addInfo.state = isEmpty(params.articleStatus) ? -1 : +params.articleStatus;
			addInfo.taskid = isEmpty(params.articleId) ? -1 : params.articleId;

			var getAuser, getCuser;
			if(isEmpty(params.ausername)){
				getAuser = userService.getUserByName(params.cusername);
				getCuser = self.session('userInfo');
			}else{
				getAuser = userService.getUserByName(params.ausername);
				getCuser = userService.getUserByName(params.cusername);
			}

			Promise.all([getAuser, getCuser]).then(function(list){
				var auser = list[0],
					cuser = list[1];
	
				if(auser != null && cuser != null){
					addInfo.ctime = new Date().format(),
					addInfo.merit = +params.merit || 0;
	
					var addMoneyFlag = 0;
					if((addInfo.state == 0 && !isOk) || (addInfo.state == 5 && isOk)){
						addMoneyFlag = 1;
					}

					switch(addInfo.state){
						case 0:
							if(isOk){
								addInfo.state = 1;
							}else{
								addInfo.state = 2;
								addInfo.type = 4;
								addInfo.merit = addInfo.merit;
							}
							break;
						case 5:
							if(isOk){
								addInfo.state = 6;
								addInfo.type = 2;
							}else{
								addInfo.state = 4;
							}
							break;
						default:
							console.log('the state is wrong!!!!');
					};

					task.id = addInfo.taskid;
					task.state = addInfo.state;
					
					if(addMoneyFlag){
						// 实涉及到积分操作 + 需要更新task状态
						var accHistory = {
							"type": addInfo.type,
							"merit": addInfo.merit,
							"cuser": cuser.id,
							"auser": auser.id, 
							"ctime": addInfo.ctime,
							"taskid": addInfo.taskid
						};
				
						var updateTask = taskService.updateTask(task),
							saveAccHistory = accHistoryService.saveAccHistory(accHistory),
							updateUserRiches = userService.updateIncUserRiches(auser, addInfo.merit); // 为相应的用户增加积分

						Promise.all([updateTask, saveAccHistory, updateUserRiches]).then(function(list){
							return self.success("更新任务状态成功");
						}).catch(function(){
							return self.error(100, '操作失败。');
						});
					}else{
						// 只需要更新task状态
						return taskService.updateTask(task).then(function(affectedRows){
							if( affectedRows > 0 ) {
								return self.success('操作成功。');
							} else {
								return self.error(100, '操作失败。', affectedRows);
							}
						});
					}
				}
			}).catch(function(){
				return self.error(99, '操作失败。无法获取登录用户信息');
			});
		},
		sendMsgAction: function() {
			var self = this,
				msg = this.post('msg') || '',
				name = this.post('name'),
				type = 0; // 系统消息

			return this.session('userInfo').then(function(userInfo) {
				return msgService.send(userInfo.id, name, type, msg).then(function(message) {
					if (message) {
						message = null;
						self.success(0, "发送成功！");
					} else {
						self.error(100, "发送失败！");
					}
				});
			}).catch(function(err) {
				console.error(err);
				
				return self.error(err);
			});
		}
	};
});