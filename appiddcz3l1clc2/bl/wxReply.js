var wxReplyModel = require('../dl/wxReplyModel.js'); //加载用户模型

var utils = require('../lib/utils.js');
var obj = {}


obj.getReply = function(replayBinder,cb){ //根据openid查找用户信息

	obj.findOneByObj({replayBinder:replayBinder},cb);
}


module.exports = obj;