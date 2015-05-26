"use strict";

var tableName = 'user';
var moduleName = 'User'; 

function save(user) {
	return D(moduleName).add(user);
}

function deleteById(id) {
	return D(moduleName).where({'id': id}).delete();
}

function getUser(condition, field) {
	return D(moduleName).where(condition).field(field).select();
}

/**
 * [getUserWithJoin 联表查询用户信息]
 * @param  {object} 查询条件
 * @param  {array} 查询字段
 * @param  {object} 联表信息
 * @return {promise} array
 */
function getUserWithJoin(condition, field, join) {
	return D(moduleName).alias('a').where(condition).field(field).join(join).select();
}

/**
 * [getCount 查询计数]
 * @param  {object} 查询条件
 * @param  {array} 查询的字段
 * @return {[type]}
 */
function getCount(condition, field) {
	return D(moduleName).where(condition).count(field ? field : 'id');
}

/**
 * [updateById 根据ID查找用户]
 * @param  {object} user对象
 * @return {promise}
 */
function updateById(user) {
	return D(moduleName).where({'id': user.id}).update(user);
}

/**
 * [updateIncUserRiches 根据ID修改用户riches]
 * @param  {object} user对象
 * @return {promise}
 */
function updateIncUserRiches(id, field, step){
	return D(moduleName).where({'id': id}).updateInc(field, step);
}

/**
 * [listBypage 分页展现数据]
 * @param  {number|string} 第几页（第一页为1）
 * @param  {number|string} 每页展现的数量
 * @param  {object} 查询条件
 * @param  {string|object} 排序方式
 * @param  {array} 查询的字段
 * @return {promise} array
 */
function listBypage(page, limit, condition, order, field) {
	return D(moduleName).where(condition).page(page, limit).order(order).field(field).countSelect();
}

function listCount(condition, field) {
	return D(module).where(condition).count(field ? field : 'id');
}

module.exports = {
	'save': save,
	'deleteById': deleteById,
	'updateById': updateById,
	'listBypage': listBypage,
	'listCount': listCount,
	'getCount': getCount,
	'getUser': getUser,
	'getUserWithJoin': getUserWithJoin,
	'updateIncUserRiches': updateIncUserRiches
};