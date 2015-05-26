var loginService = require('../../service/GithubService');
var userService = require('../../service/UserService');

/**
 * controller
 * @return 
 */
var loginURL = 'http://75fanyi.haeapp.com/';
var prox = 'http://';

function getHost(action) {
    var headers = action.http.req.headers;
    return prox + headers['host'];
}

function redir(action) {
    return action.session('redir').then(function(redir) {
        if (redir) {
            action.session('redir', null);
        } else {
            redir = getHost(action);
        }
        return action.redirect(redir);
    });
}

function login(action, userInfo) {
    return action.session('userInfo', userInfo).then(function() {
        return redir(action);
    });
}

module.exports = Controller("Home/BaseController", function() {
    "use strict";
    return {
        indexAction: function() {
            var redirectURI = loginService.login();
            this.redirect(redirectURI);
        },

        callbackAction: function() {
            var code = this.get('code'),
                sid = this.get('sid'),
                ref = this.get('ref'),
                host = getHost(this),
                self = this;

            if (!isEmpty(code)) {
                return loginService.token(code).then(function(token) {
                    if (token) {
                        return loginService.getUserInfo(token).then(function(userinfo) {
                            var i, info;

                            try {
                                i = JSON.parse(userinfo);
                            } catch (e) {
                                self.error(3, "用户信息解析失败!");
                            }

                            info = {
                                "user": i.login,
                                "photo": i.avatar_url,
                                "mail": i.email
                            };

                            // self.header('debug', JSON.stringify(info)); // debug

                            if (info.user) {
                                //判断是否要存储到数据库
                                return userService.getUserByName(info.user).then(function(user) {
                                    if (user) {
                                        info.id = user.id;
                                        info.type = user.type;

                                        return login(self, info);
                                    } else {
                                        return userService.bindUserInfo(info).then(function(data) {
                                            if (data) {
                                                info.id = data.id;
                                                info.type = data.type;

                                                return login(self, info);
                                            } else {
                                                self.error("内部错误，请联系管理员！");
                                            }
                                        }, function(error) {
                                            self.error(error);
                                        });
                                    }
                                }, function() {
                                    self.error("账号绑定失败!");
                                });
                            } else {
                                self.error(4, "未获取到用户信息!");
                            }

                        });
                    } else {
                        self.error(2, "验证失败!");
                    }
                });
            } else {
                self.error(1, "验证失败!");
            }
        }
    };
});
