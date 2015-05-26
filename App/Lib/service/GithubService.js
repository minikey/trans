var https = require('https');
var opts = require('../../Conf/github_opts');

/**
 * [login 系统登录]
 */

function login() {
    var url = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + opts.get.githubClient
        + (opts.get.scope ? '&scope=' + opts.get.scope.join(',') : '')
        + '&redirect_uri=' + opts.get.redirectURI
        + '&state=' + opts.get.state
        ;
    return url;
}

function getToken(code) {
	/*var code = code;
    if (!code) return 'missing oauth code';*/

    var path = "/login/oauth/access_token";

    path += '?client_id=' + opts.get.githubClient;
    path += '&client_secret=' + opts.get.githubSecret;
    path += '&code='+ code;


    return new Promise(function(resolve, reject) {
        https.request({
            hostname: 'github.com',
            port: 443,
            path: path,
            method: 'POST',
            rejectUnauthorized: false
        }, function(res) {
            var body = '';
            res.on('data', function(data) {
                body += data;
            });

            res.on('end', function() {
                var args = body.split('&');
                var tokenInfo = args[0].split("=");
                var token = tokenInfo[1];
                resolve(token);
            });
        }).on('error', function(e) {
            reject(e);
        }).end();
    });
}

function getUserInfo(token) {

    var path = "/user?access_token=";

    path += token;

    return new Promise(function(resolve, reject) {
        https.request({
            hostname: 'api.github.com',
            path: path,
            method: 'GET',
            headers: {'user-agent': 'node.js'},
            rejectUnauthorized: false
        }, function(res) {
            var body = '';
            res.on('data', function(data) {
                body += data;
            });

            res.on('end', function() {
                resolve(body);
            });
        }).on('error', function(e) {
            reject(e);
        }).end();
    });
}

module.exports = {
    login: login,
    token: getToken,
    getUserInfo:getUserInfo
};