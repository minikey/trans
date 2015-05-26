var taskDao = require('../dao/TaskDao');

function getTaskByCuserId(id) {
	// 已发布状态
	return taskDao.getTask({
		'cuser': id,
		'state': 6
	});
}

function getTaskCountByCuserId(id) {
	return taskDao.getCount({
		'cuser': id
	}, 'id');
}

function getTaskByAuserId(id) {
	return taskDao.getTask({
		'auser': id,
		'state': 3
	});
}

function getTaskCountByAuserId(id) {
	return taskDao.getCount({
		'auser': id
	}, 'id');
}

function getFTaskCountByAuserId(id) {
	return taskDao.getCount({
		'auser': id,
		'state': 5
	}, 'id');
}

function getMyTaskBase(condition, page, limit, isCreated) {
	condition['b.codetype'] = 'task_state';

	var user = !isCreated ? 'auser' : 'cuser';
	return taskDao.listByPageWithJoin(page, limit, condition, 'state asc', ['a.id', 'a.title', 'a.state', 'b.codename as statename', 'a.cuser', 'c.name as cusername', "date_format(a.ctime,'%Y-%c-%d') as ctime", 'a.merit','a.note'], {
		'codetable': {
			join: 'inner',
			as: 'b',
			on: ['a.state', 'b.code']
		},
		'user': {
			join: 'inner',
			as: 'c',
			on: [user, 'c.id']
		}
	});
}

function getMyAllTaskBase(condition, isCreated) {
	condition['b.codetype'] = 'task_state';

	var userName = !isCreated ? 'cuser' : 'auser',
		userId = !isCreated ? 'a.cuser' : 'a.auser';

	return taskDao.listWithJoin(condition, 'state asc', ['a.id', 'a.title', 'a.state', 'b.codename as statename', userId, 'c.name as username', "date_format(a.ctime,'%Y-%c-%d') as ctime", 'a.merit','a.note'], {
		'codetable': {
			join: 'inner',
			as: 'b',
			on: ['a.state', 'b.code']
		},
		'user': {
			join: 'left',
			as: 'c',
			on: [userName, 'c.id']
		}
	});
}
/**
 * [getMyTask 我领取的指定页数的所有状态的文章]
 * @param  {string|number}
 * @return {promise}
 */
function getMyTask(auserId, page, limit, isCreated) {
	return getMyTaskBase({
		'auser': auserId
	}, page, limit,isCreated);
}

function getMyTaskWithState(auserId, state, page, limit) {
	return getMyTaskBase({
		'auser': auserId,
		'state': state
	}, page, limit);
}

function getMyCreatedTask(cuserId, page, limit, isCreated) {
	 return getMyTaskBase({
		'cuser': cuserId
	}, page, limit,isCreated);
}

function getMyAllTask(auserId, isCreated) {
	return getMyAllTaskBase({
		'auser': auserId
	}, isCreated);
}

function getMyCreatedAllTask(cuserId, isCreated) {
	return getMyAllTaskBase({
		'cuser': cuserId
	}, isCreated);
}

function getTask(condition, page, limit, order) {
	condition['b.codetype'] = 'task_state';
	var field = ['a.id', 'a.title', 'a.state', 'b.codename as statename', 'a.cuser', 'c.name as cusername', "date_format(a.ctime,'%Y-%c-%d') as ctime", 'a.merit','a.note'],
		joins = [{
			table: 'codetable',
			join: 'inner',
			as: 'b',
			on: ['a.state', 'b.code']
		}, {
			table: 'user',
			join: 'left',
			as: 'c',
			on: ['a.cuser', 'c.id']
		}];

	if (!isEmpty(condition['a.state']) || !isEmpty(condition['_complex']['a.state'])) { // 这个地方容易出bug
		field.push('a.auser', 'd.name as ausername');
		joins.push([{
			table: 'user',
			join: 'left',
			as: 'd',
			on: ['a.auser', 'd.id']
		}]);
	}
	
	return taskDao.listByPageWithJoinArray(page, limit, condition, order, field, joins);
}

function getWaitTask(page, limit) {
	return getTask({
		'a.state': 1
	}, page, limit);
}

function getCompletedTask(page, limit) {
	return getTask({
		'a.state': 6 
	}, page, limit);
}

function getRuningTask(page, limit) {
	return getTask({
		'a.state': 4
	}, page, limit);
}

function getUncheckedTask(page, limit, articleIds) {
	var order = 'a.id';
	return getTask({
		_complex:{
			'a.state': 0,
			'a.id': ['IN', articleIds],
			'_logic': 'OR'
		}
	}, page, limit, order);
}

function getUnevaluatedTask(page, limit, articleIds) {
	var order = 'a.id';
	return getTask({
		_complex:{
			'a.state': 5,
			'a.id': ['IN', articleIds],
			'_logic': 'OR'
		}
	}, page, limit, order);
}

function getTopTaskUser(page, limit) {
	return taskDao.listWithGroupAndJoinArray(page, limit, {
		'a.state': 6 // 已经发布的状态
	}, 'a.auser', 'count desc, a.ctime asc', [ // 根据数量倒序、创建时间顺序排序 
		'count(a.id) as count',
		'b.name',
		'b.id'
	], [{
		table: 'user',
		join: 'inner',
		as: 'b',
		on: ['a.auser', 'b.id']
	}]);
}

function updateTask(task){
	return taskDao.updateById(task);
}

function updateIncTaskMerit(task, merit){
	// updateIncTask(id, field, step)
	return taskDao.updateIncTaskMerit(task.id, 'merit', merit);
}
function saveTask(task){
	 return taskDao.save(task);
}

module.exports = {
	'getTaskByCuserId': getTaskByCuserId,
	'getTaskByAuserId': getTaskByAuserId,
	'getTaskCountByCuserId': getTaskCountByCuserId,
	'getTaskCountByAuserId': getTaskCountByAuserId,
	'getFTaskCountByAuserId': getFTaskCountByAuserId,
	'getMyTask': getMyTask,
	'getMyCreatedTask': getMyCreatedTask,
	'getWaitTask': getWaitTask,
	'getCompletedTask': getCompletedTask,
	'getRuningTask': getRuningTask,
	'updateTask': updateTask,
	'getMyAllTask': getMyAllTask,
	'getMyCreatedAllTask': getMyCreatedAllTask,
	'getTopTaskUser': getTopTaskUser,
	'saveTask': saveTask,
	'getUncheckedTask': getUncheckedTask,
	'getUnevaluatedTask': getUnevaluatedTask,
	'updateIncTaskMerit': updateIncTaskMerit
};
