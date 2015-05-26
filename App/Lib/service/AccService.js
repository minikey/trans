var accDao = require('../dao/AccDao');

function saveAcc(acc){
	 return accDao.save(acc);
}

function getAccBase(condition){
	condition['b.codetype'] = 'acc_his_type';
	var order = 'a.id',
		field = [
			'a.id as accid',
			'b.code as acctypeid',
			'b.codename',
			'b.codetype',
			'merit',
		],
		join = {
			table: 'codetable',
			join: 'inner',
			as: 'b',
			on: ['a.type', 'b.note']
		};
	return accDao.selectWithJoin(condition, order, field, join);
}

/**
 * 获取打赏金额
 */
function getAllDonAcc(){
	return getAccBase({
		'a.note': 'don_acc',
		'b.code': 0 // 打赏金额
	});
}

function getAllRewAcc(){
	return getAccBase({
		'a.note': 'rew_acc',
		'b.code': 3 // 悬赏金额
	});
}

function getDonAccById(id){
	return getAccBase({
		'a.note': 'don_acc',
		'b.code': 0, // 打赏金额
		'a.id': id
	}).then(function (acc) {
		return acc[0] || null;
	});
}

function getRewAccById(id){
	return getAccBase({
		'a.note': 'rew_acc',
		'b.code': 3, // 悬赏金额
		'a.id': id
	}).then(function(list) {
		return list[0] || null;
	});
}

/**
 * 根据id获取Acc
 */
function getAccById(id, field) {
	return accDao.select({id: id}, field).then(function (list) {
		return list[0] || null;
	});
}

module.exports = {
	'saveAcc': saveAcc,
	'getAllDonAcc': getAllDonAcc,
	'getDonAccById': getDonAccById,
	'getAllRewAcc': getAllRewAcc,
	'getRewAccById': getRewAccById,
	'getAccById': getAccById
};
