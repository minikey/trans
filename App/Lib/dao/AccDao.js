"use strict";

var BaseDao = require('./BaseDao');
var AccDao = BaseDao('Accumulation');

AccDao.getTask = function(condition, field) {
	return D(this.name).where(condition).field(field).select();
};

module.exports = AccDao;