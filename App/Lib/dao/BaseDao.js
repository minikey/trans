module.exports = Class(function() {
    'use strict';
    return {
    	init: function(name){
    		this.name = name;
    	},
        save: function(obj) {
            return D(this.name).add(obj);
        },
        deleteById: function(id) {
            return D(this.name).where({'id': id}).delete();
        },
        select: function(condition, field) {
            return D(this.name).where(condition).field(field).select();
        },
        /**
		 * [selectWithJoin 联表查询用户信息]
		 * @param  {object} 查询条件
		 * @param  {array} 查询字段
		 * @param  {object} 联表信息
		 * @return {promise} array
		 */
        selectWithJoin: function(condition, order, field, join) {
			return D(this.name).alias('a').where(condition).order(order).field(field).join(join).select();
		},
		listByPageWithJoin: function(page, limit, condition, order, field, join) {
			return D(this.name).where(condition).alias('a').page(page, limit).order(order).field(field).join(join).countSelect();
		},
		/**
		 * [count 查询计数]
		 * @param  {object} 查询条件
		 * @param  {array} 查询的字段
		 * @return {[type]}
		 */
		count: function(condition, field) {
			return D(this.name).where(condition).count(field ? field : 'id');
		},
		/**
		 * [updateById 查询计数]
		 * @param  {object} user对象
		 * @return {promise}
		 */
		updateById: function(user) {
			return D(this.name).where({'id': user.id}).update(user);
		},
		/**
		 * [listBypage 分页展现数据]
		 * @param  {number|string} 第几页（第一页为1）
		 * @param  {number|string} 每页展现的数量
		 * @param  {object} 查询条件
		 * @param  {string|object} 排序方式
		 * @param  {array} 查询的字段
		 * @return {promise} array
		 */
		listBypage: function(page, limit, condition, order, field) {
			return D(this.name).where(condition).page(page, limit).order(order).field(field).countSelect();
		},
		listCount: function(condition, field) {
			return D(this.name).where(condition).count(field ? field : 'id');
		},
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
		listByPageWithJoinArray: function(page, limit, condition, order, field, joins) {
			var promise = D(this.name).where(condition).alias('a').page(page, limit).order(order).field(field);

			for (var i = 0; i < joins.length; i++) {
				promise['join'](joins[i]);
			}

			return promise.countSelect();
		},
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
		listWithGroupAndJoinArray: function(page, limit, condition, group, order, field, joins) {
			var promise = D(this.name).where(condition).alias('a').page(page, limit).order(order).field(field).group(group);
			
			for (var i = 0; i < joins.length; i++) {
				promise['join'](joins[i]);
			}
			return promise.select();
		}
    };
});