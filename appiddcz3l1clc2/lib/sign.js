var NO_CLIENTID = 'must need clientId param or wrong format';
var NO_SIGN = 'must need sign param or wrong format';
var NO_TIMESTAMP = 'must need timestamp param or wrong format';
var NOT_FOUND_CLIENTID = 'not found clientid';
var SIGN_ERROR = 'check sign error';
var DEFAULT_ERROR = 'widget server error!';

var sign = {}
sign.genError = function(status, code, msg){
	return {
		status:status||500,
		code:code||500,
		msg:msg||DEFAULT_ERROR
	}
}

sign.checkSign = function(req, res, cb){
	var widget = req.widget;
	var cb = cb || widget.noop;

	if(!/^\w{24,24}$/.test(req.params.clientid || '')){
		return cb(sign.genError(400, 101, NO_CLIENTID));
	}
	if(!/^\w{32,32}$/.test(req.params.sign || '')){
		return cb(sign.genError(400, 102, NO_SIGN));
	}
	if(!/\d/.test(req.params.timestamp||'')){
		return cb(sign.genError(400, 103, NO_TIMESTAMP));
	}
	

	widget.dl.clientDl.findClientById(req.params.clientid, function(err,doc){
		if(err){
			widget.logger.error(err);
			return cb(sign.genError());
		}
		if(!doc){
			return cb(sign.genError(404, 104, NOT_FOUND_CLIENTID));
		}
		if(req.params.sign !== widget.utils.genSignStr(req.params, doc.clientKey)){
			return cb(sign.genError(403, 105, SIGN_ERROR));
		}
		cb(null);
	})

}

module.exports = sign.checkSign;