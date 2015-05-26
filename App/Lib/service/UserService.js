var userDao = require('../dao/UserDao');
var taskService = require('./TaskService');

/**
 * [bindUserInfo 绑定用户信息到数据库]
 * @param  {object} 内部接口信息
 * @return {promise}
 */
function bindUserInfo(userInfo) {
	var user = {
		name: userInfo.user,
		email: userInfo.mail,
		riches: 0,
		type: 1 // 普通用户
	};
	return userDao.save(user).then(function(id) {
		if (!isEmpty(id)) {
			user.id = id;
			return user;
		} else {
			return null;
		}
	});
}

/**
 * [getUserByEmail 通过Email获取到用户信息]
 * @param  {string}
 * @return {promise}
 */
function getUserByEmail(email) {
	return userDao.getUser({
		'email': email
	}).then(function(user) {
		if (user && user.length) {
			user = user[0];
		} else {
			user = null;
		}
		return user;
	});
}

/**
 * [getUserByName 通过name获取到用户信息]
 * @param  {string}
 * @return {promise}
 */
function getUserByName(name) {
	return userDao.getUser({
		'name': name
	}).then(function(user) {
		if (user && user.length) {
			user = user[0];
		} else {
			user = null;
		}
		return user;
	});
}

/**
 * [getUserById 通过id获取到用户信息]
 * @param  {string}
 * @return {promise}
 */
function getUserById(id) {
	return userDao.getUser({
		'id': id
	}).then(function(user) {
		if (user && user.length) {
			user = user[0];
		} else {
			user = null;
		}
		return user;
	});
}

/**
 * [getUserInfo 获取用户信息]
 * @param  {object} 内部接口信息
 * @return {promise} 返回User对象或者null
 */
function getUserInfo(userInfo) {
	var name = userInfo.user;

	return userDao.getUserWithJoin({
		'name': name,
		'c.codetype': 'user_type'
	}, ['a.id', 'name', 'c.codename as type', 'riches', 'state'], {
		table: 'codetable',
		join: 'inner',
		as: 'c',
		on: ['type', 'code']
	}).then(function(user) {
		if (user.length) {
			user = user[0];
			user.email = userInfo.mail;
			// user.name = userInfo.display;

			var cCount = taskService.getTaskCountByCuserId(user.id),
				aCount = taskService.getTaskCountByAuserId(user.id),
				fCount = taskService.getFTaskCountByAuserId(user.id);

			return Promise.all([aCount, cCount, fCount]).then(function(res) {
				user.a = res[0]; // 已领取数
				user.c = res[1]; // 贡献数
				user.f = res[2]; // 翻译完成数
				return user;
			});
		} else {
			return null;
		}
	});
}

/**
 * [checkEmail 检测邮箱是否存在]
 * @param  {string}
 * @return {promise} boolean
 */
function checkEmail(email) {
	return userDao.getCount({
		'email': email
	}, 'email').then(function(count) {
		return count === 0 ? false : true;
	});
}

/**
 * [checkName 检测用户名是否存在]
 * @param  {string}
 * @return {promise} boolean
 */
function checkName(name) {
	return userDao.getCount({
		'name': name
	}, 'id').then(function(count) {
		return count === 0 ? false : true;
	});
}

/**
 * [updateIncUserRiches 根据用户ID更新用户积分]
 * @param  {object| number}
 * @return {promise} 返回操作后的影响行数
 */
function updateIncUserRiches(user, merit) {
	return userDao.updateIncUserRiches(user.id, 'riches', merit);
}

module.exports = {
	'bindUserInfo': bindUserInfo,
	'checkEmail': checkEmail,
	'getUserInfo': getUserInfo,
	'checkName': checkName,
	'getUserByEmail': getUserByEmail,
	'getUserByName': getUserByName,
	'getUserById': getUserById,
	'updateIncUserRiches': updateIncUserRiches
};
