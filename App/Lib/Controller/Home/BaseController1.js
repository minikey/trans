/**
 * 项目里的Controller基类
 * 这里做一些通用的处理逻辑，其他Controller继承该类
 * @param  {[type]} 
 * @return {[type]}         [description]
 */
module.exports = Controller(function() {
    'use strict';
    
    var whiteList = {
        '/task/getWaitTask': 1,
        '/task/getCompletedTask': 1,
        '/task/getRunningTask': 1,
        '/task/getTopTaskUser': 1,
        '/acchistory/getTopRichUser': 1,
        '/acchistory/getTaskMeritUser': 1
    };

    var whiteController = {
        'github': 1,
        'login': 1
    };

    return {
        init: function(http) {
            this.super("init", http);
            //其他的通用逻辑
        },
        __before: function() {
           var self = this,
                url = this.http.req.url;

            return this.session('userInfo').then(function(info) {
                // 必须注册此变量，不然会报错哦，么么哒~（在header.html中有引用，不然ejs会报错，ejs太脆弱了..）
                self.assign('userInfo', info);

                if (isEmpty(info)) {

                    if(whiteController[self.http.controller.toLowerCase()]) {
                        return;
                    }

                    if (!isEmpty(url) && (url.indexOf('/login') === 0 || url === '/' || whiteList[url.split('?')[0]])) {
                        return;
                    }

                    // fix bug 不限制会出现直接访问json数据接口
                    if (url.indexOf('/user') === 0) {
                        url = '/user';
                    } else if (url.indexOf('/admin') === 0) {
                        url = '/admin';
                    } else {
                        url = null;
                    }

                    if (self.isAjax()) {
                        self.error(401, '没有权限访问！');
                    } else {
                        self.session('redir', url).then(function() {
                            return self.redirect("/login");
                        });
                    }
                } else {
                    // admin模块特殊处理
                    if (self.http.controller.toLowerCase() === 'admin') {
                        // 如果不是管理员权限禁止访问
                        if (info.type !== 0) {
                            if (self.isAjax()) {
                                self.error(401, '没有权限访问！');
                            } else {
                                return self.redirect("/");
                            }
                        }
                    }
                }
            });
        }
    };
});
