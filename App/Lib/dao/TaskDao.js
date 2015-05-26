"use strict";

var tableName = 'task';
var moduleName = 'Task';

function save(task) {
	return D(moduleName).add(task); 
}

function deleteById(id) {
	return D(moduleName).where({'id': id}).delete();
}

function getTask(condition, field) {
	return D(moduleName).where(condition).field(field).select();
}

function getCount(condition, field) {
	return D(moduleName).where(condition).count(field ? field : 'id');
}

function updateIncTaskMerit(id, field, step){
	return D(moduleName).where({'id': id}).updateInc(field, step);
}

function updateById(task) {
	return D(moduleName).where({'id': task.id}).update(task);
}

function listBypage(page, limit, condition, order, field) {
	return D(moduleName).where(condition).page(page, limit).order(order).field(field).countSelect();
}

function listWithJoin(condition, order, field, join) {
	return D(moduleName).where(condition).alias('a').order(order).field(field).join(join).countSelect();
}

function listByPageWithJoin(page, limit, condition, order, field, join) {
	return D(moduleName).where(condition).alias('a').page(page, limit).order(order).field(field).join(join).countSelect();
}

/**
 * [listByPageWithJoinArray 通过连表查询获取任务信息]
 * 如果join传入的为Object时，如果需要多次连接同一张表的时候，就没办法实现了
 * @param  {string|number} page 第几页（首页为1）
 * @param  {string|number} limit 每页展的条目数
 * @param  {object} condition 查询条件
 * @param  {string} order 排序字段
 * @param  {array} field 查询字段
 * @param  {array} joins 连表信息
 * 传入的为对象数组格式：[{table: 'user', join: 'inner', as: 'b', on: ['id', 'group_id']}, {...} ...]
 * @return {promise}
 */
function listByPageWithJoinArray(page, limit, condition, order, field, joins) {
	var promise = D(moduleName).where(condition).alias('a').page(page, limit).order(order).field(field);

	for (var i = 0; i < joins.length; i++) {
		promise['join'](joins[i]);
	}

	return promise.countSelect();
}

function listCount(condition, field) {
	return D(module).where(condition).count(field ? field : 'id');
}

/**
 * [listByPageWithGroupAndJoinArray]
 * @param  {string|number} page 第几页（首页为1）
 * @param  {string|number} limit 每页展的条目数
 * @param  {object} condition 查询条件
 * @param  {string} group 分组字段
 * @param  {string} order 排序字段
 * @param  {array} field 查询字段
 * @param  {array} joins 连表信息
 * @return {promise}
 */
function listWithGroupAndJoinArray(page, limit, condition, group, order, field, joins) {
	var promise = D(moduleName).where(condition).alias('a').page(page, limit).order(order).field(field).group(group);
	
	for (var i = 0; i < joins.length; i++) {
		promise['join'](joins[i]);
	}
	return promise.select();
}

module.exports = {
	'save': save,
	'deleteById': deleteById,
	'updateById': updateById,
	'listBypage': listBypage,
	'listByPageWithJoin': listByPageWithJoin,
	'listCount': listCount,
	'getCount': getCount,
	'getTask': getTask,
	'listByPageWithJoinArray': listByPageWithJoinArray,
	'listWithGroupAndJoinArray': listWithGroupAndJoinArray,
	'listWithJoin': listWithJoin,
	'updateIncTaskMerit': updateIncTaskMerit
};