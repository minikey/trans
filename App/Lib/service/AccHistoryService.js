var accHistoryDao = require('../dao/AccHistoryDao');

/**
 * [saveAccHistory 保存一条积分历史记录]
 * @param  {string|number}
 * @return {promise}
 */
function saveAccHistory(accHistory) {
	return accHistoryDao.save(accHistory);
}

/**
 * [getTopRichUser 获取打赏最多的用户]
 * @param  {string|number}
 * @return {promise}
 */

//listWithGroupAndJoinArray(page, limit, condition, group, order, field, joins)
function getTopRichUser(page, limit) {
	var condition = {
		'a.type': 2 // 已经发布的状态
	},
		group = 'a.auser',
		order = 'summeirt desc, a.ctime asc', // 根据数量倒序、创建时间顺序排序
		field = [
			'sum(a.merit) as summeirt',
			'b.name',
			'b.id'
		],
		joins = [{
			table: 'user',
			join: 'inner',
			as: 'b',
			on: ['a.auser', 'b.id']
		}];
	return accHistoryDao.listWithGroupAndJoinArray(page, limit, condition, group, order, field, joins);
}

/**
 * [getTaskMeritUser 获取给某一文章打赏过的用户]
 * @param  {string|number}
 * @return {promise}
 */
function getTaskMeritUser(page, limit, taskId) {

	var condition = {
		'a.taskId': taskId,
		'c.codetype': 'acc_his_type'
	},
		order = 'merit desc, a.ctime desc',
		field = [
			'ABS(a.merit) as merit',
			'b.name',
			'a.type',
			'c.codename as typename'
		],
		joins = [{
			table: 'user',
			join: 'left', // 系统增加的金币没有创建用户因此需要左联接查询
			as: 'b',
			on: ['a.cuser', 'b.id']
		}, {
				table: 'codetable',
				join: 'inner',
				as: 'c',
				on: ['a.type', 'c.code']
			}];
	return accHistoryDao.listByPageWithJoinArray(page, limit, condition, order, field, joins).then(function (spa) {
		var list = spa.data,
			tmp = null;
		// 处理系统奖励逻辑
		for (var i = 0; i < list.length; i++) {
			tmp = list[i];
			if (tmp.type === '5') {
				tmp.name = tmp.typename;
			}
		}
		return spa;
	});
}

/**
 * [getNewestAccHistory 获取最新的用户积分清单]
 * @param  {string|number}
 * @return {promise}
 */

//listByPageWithJoinArray(page, limit, condition, order, field, joins)
function getNewestAccHistory(page, limit) {
	var condition = {
		'b.codetype': 'acc_his_type',
		'b.code': ['IN', [1, 2]]
	},
		order = 'a.ctime desc', // 根据创建时间倒序排序
		field = [
			'c.name',
			'c.id as userId',
			'a.merit',
			"date_format(a.ctime,'%Y-%c-%d %H:%i') as ctime",
			'b.code',
			'b.codename'
		],
		joins = [{
			table: 'codetable',
			join: 'inner',
			as: 'b',
			on: ['a.type', 'b.code']
		}, {
				table: 'user',
				join: 'inner',
				as: 'c',
				on: ['a.auser', 'c.id']
			}];

	return accHistoryDao.listByPageWithJoinArray(page, limit, condition, order, field, joins);
}

/**
 * [seachUserAccHistory 获取指定用户的积分历史清单]
 * @param  {string|number}
 * @return {promise}
 */
// listByPageWithJoin(page, limit, condition, order, field, join)
function seachUserAccHistory(page, limit, auser) {
	var auserId = !isObject(auser) ? auser : auser.id;

	var condition = {
		'auser': auserId,
		'b.codetype': 'acc_his_type',
		'b.code': ['IN', [1, 2]]
	},
		order = 'ctime desc',
		field = [
			'auser as userId',
			'merit',
			"date_format(ctime,'%Y-%c-%d %H:%i') as ctime",
			'b.code',
			'b.codename'
		],
		join = {
			table: 'codetable',
			join: 'inner',
			as: 'b',
			on: ['a.type', 'b.code']
		};

	return accHistoryDao.listByPageWithJoin(page, limit, condition, order, field, join);
}

function getAccHistory(condition, field) {
	return accHistoryDao.getAccHistory(condition, field);
}

module.exports = {
	'saveAccHistory': saveAccHistory,
	'getTopRichUser': getTopRichUser,
	'getTaskMeritUser': getTaskMeritUser,
	'getNewestAccHistory': getNewestAccHistory,
	'seachUserAccHistory': seachUserAccHistory,
	'getAccHistory': getAccHistory
};
