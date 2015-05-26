var msgService = require('../../service/MessageService');

module.exports = Controller("Home/BaseController", function() {
    "use strict";
    return {
        indexAction: function() {
            var self = this;

            this.session('userInfo').then(function(userInfo) {
                self.display();
            });
            
        },
    	/**
    	 * [getUnReadMsgAction 获取未读消息]
    	 * @return {json}
    	 */
        getUnReadMsgAction: function() {
        	var self = this,
        		page = 1,
        		limit = 5;

        	return this.session('userInfo').then(function(userInfo) {
        		return msgService.getUnReadMsg(userInfo.id, page, limit).then(function(spa) {
        			return self.json({errno: 0, data:spa});
        		});
        	}).catch(function(err) {
        		console.error(err);

        		return self.error(100, 'error');
        	});
        },
        
        /**
         * [getMsgAction 获取消息]
         * @return {json}
         */
        getMsgAction: function() {
        	var self = this,
        		page = this.get('page') || 1,
        		limit = this.get('limit') || 10;

        	return this.session('userInfo').then(function(userInfo) {
        		return msgService.getOwnMsg(userInfo.id, page, limit).then(function(spa) {
        			return self.json(spa);
        		});
        	}).catch(function(err) {
        		console.error(err);

        		return self.error(100, 'error');
        	});
        },
        
        /**
         * [getMsgAction 标记消息为已读]
         * @return {json}
         */
        markMsgAction: function() {
            var id = this.get('id'),
                self = this;
            
            if (!isEmpty(id)) {
                return msgService.markMsg(id).then(function(flag) {
                    flag ? self.success({errno: 0, msg: '操作成功！'}) : self.error(2, '操作失败！');
                }).catch(function(err) {
                    console.error(err);
                    
                    self.error(9, '操作失败！');
                });
            } else {
                this.error(1, '操作失败！');
            }
        },
        
        deleteMsgAction: function() {
            var self = this,
                id = this.get('id');
                
            if (!isEmpty(id)) {
                return msgService.deleteMsg(id).then(function(flag) {
                    flag ? self.success({errno: 0, msg: '操作成功！'}) : self.error(2, '操作失败！');
                }).catch(function(err) {
                    console.error(err);
                    
                    self.error(9, '操作失败！');
                });
            } else {
                this.error(1, '操作失败！');
            }
        }
    };
});
