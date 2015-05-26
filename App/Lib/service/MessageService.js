var messageDao = require('../dao/MessageDao.js');
var userService = require('../service/UserService');

function save(msg) {
    return messageDao.save(msg);
}

/**
 * [send 发送消息]
 * @param  {int|string} cuser [创建人id]
 * @param  {int|string} auser [接收人用户名]
 * @param  {int} type  [消息类型]
 * @param  {string} msg   [消息内容]
 * @return {promise}
 */
function send(cuser, ausername, type, msg) {
    var message;

    if (isEmpty(ausername)) {
        return Promise.reject({errNum: 1, msg:'没有接收人！'});
    }

    msg = trim(msg);

    if (isEmpty(msg)) {
        return Promise.reject({errNum: 2, msg:'消息为空！'});
    }

    if (msg.length > 300) {
        return Promise.reject({errNum: 3, msg:'消息内容过长！'});
    }

    return userService.getUserByName(ausername).then(function(user) {
    	if (user) {
    		message = {
		        'cuser': cuser,
		        'auser': user.id,
		        'type': type,
		        'message': msg,
		        'state': 0, // 未读状态
		        'ctime': new Date().format()
		    };

		    return save(message).then(function(id) {
		        if (!isEmpty(id)) {
		            message.id = id;
		            return message;
		        } else {
		            return null;
		        }
		    });
    	} else {
    		return Promise.reject({errNum: 5, msg:'接收人不存在!'});
    	}
    }).catch(function(err) {
    	console.error(err);

    	return {
    		errNum: 4,
    		msg: '数据库操作失败！'
    	};
    });
}

/**
 * [getOwnMsg 获取我的消息]
 * @param  {int|string} auserid [接收人]
 * @param  {int|string} page  [第几页]
 * @param  {int|string} limit [每页显示的条目]
 * @param  {int|string} state [状态]
 * @return {promise}
 */
function getOwnMsg(auserid, page, limit, state) {
	var condition = {
		'auser': auserid,
		'b.codetype': 'msg_type',
		'c.codetype': 'msg_state'
	};

	if (isNumberString(state)) {
		condition['a.state'] = state;
	}
	return messageDao.listByPageWithJoinArray(page, limit, condition, 'ctime desc', [
		'a.id',
		'a.state',
		'a.type',
		'message',
		'b.codename as typename',
		'c.codename as statename',
		'd.name',
		"date_format(ctime,'%Y-%c-%d') as ctime"
	],[{
		table: 'codetable',
		join: 'inner',
		as: 'b',
		on: ['a.type', 'b.code']
	}, {
		table: 'codetable',
		join: 'inner',
		as: 'c',
		on: ['a.state', 'c.code']
	}, {
		table: 'user',
		join: 'left',
		as: 'd',
		on: ['a.cuser', 'd.id']
	}]).then(function(spa) {
		if (spa.data.length) {
			var tmp = null;
			// 处理系统消息的发送用户名
			for (var i = 0; i < spa.data.length; i++) {
				tmp = spa.data[i];
				if (tmp.type == 0) {
					tmp.name = "管理员";
				}
			}
		}
		
		return spa;
	});
}

/**
 * [getUnReadMsg 获取未读的信息]
 * @param  {int|string} auserid [接收人id]
 * @param  {int|string} page
 * @param  {int|string} limit
 * @return {promise}
 */
function getUnReadMsg(auserid, page, limit) {
	return getOwnMsg(auserid, page, limit, 0);
}

/**
 * [markMsg 标记消息为已读]
 */
function markMsg(id) {
	var msg = {
		id: id,
		state: 1 // 已读状态	
	};
	return messageDao.updateById(msg).then(function(count) {
		return count > 0;
	});
}

/**
 * [markMsg 删除消息]
 */
function deleteMsg(id) {
	return messageDao.deleteById(id).then(function(count) {
		return count > 0;
	});
}

module.exports = {
    'save': save,
    'send': send,
    'getOwnMsg': getOwnMsg,
    'getUnReadMsg': getUnReadMsg,
	'markMsg': markMsg,
	'deleteMsg': deleteMsg
};
