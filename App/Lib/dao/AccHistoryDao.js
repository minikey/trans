"use strict"
var tableName = 'accumulation_history';
var moduleName = 'AccumulationHistory'; 

function save(accumulation) {
	return D(moduleName).add(accumulation); 
}

function getAccHistory(condition, field) {
	return D(moduleName).where(condition).field(field).select();
}

function getCount(condition, field) {
	return D(moduleName).where(condition).count(field ? field : 'id');
}

function listByPage(page, limit, condition, order, field) {
	return D(moduleName).where(condition).page(page, limit).order(order).field(field).countSelect();
}

function listWithJoin(condition, order, field, join) {
	return D(moduleName).where(condition).alias('a').order(order).field(field).join(join).countSelect();
}

function listByPageWithJoin(page, limit, condition, order, field, join) {
	return D(moduleName).where(condition).alias('a').page(page, limit).order(order).field(field).join(join).countSelect();
}

function listByPageWithJoinArray(page, limit, condition, order, field, joins) {
	var promise = D(moduleName).where(condition).alias('a').page(page, limit).order(order).field(field);

	for (var i = 0; i < joins.length; i++) {
		promise['join'](joins[i]);
	}

	return promise.countSelect();
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
	'getAccHistory': getAccHistory,
	'getCount': getCount,
	'listByPage': listByPage,
	'listWithJoin': listWithJoin,
	'listByPageWithJoin': listByPageWithJoin,
	'listByPageWithJoinArray': listByPageWithJoinArray,
	'listWithGroupAndJoinArray': listWithGroupAndJoinArray
};