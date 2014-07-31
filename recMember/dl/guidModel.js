var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  row:{type:Number,default:1},
	  guid: {type:Number,default:100000},    //奖品的guid，从10W起
}

var objSchema = new Schema(obj);

objSchema.statics.getGuid = function (cb) { 
    return this.findOneAndUpdate({row:1}, {
    	$inc:{guid:1}
    }, {"upsert":true}, function(err,doc){
    	if(err || !doc) return cb(err);
    	cb(null, doc.guid);
    }); 
}

objSchema.statics.setGuidFromNum = function (num,cb) { 
	var that = this;

	that.findOne({
		row:1
	},function(err,doc){
		if(err) return cb(err);

		if(!doc){//如果没有找到guid
			that.create({
				row:1,
				guid:num
			},function(err,guidDoc){
				if(err) return cb(err);
				return cb(null,guidDoc);
			})
			return;
		}
		var curGuid = doc.guid
		if(curGuid>=num) return cb(null,doc);
		that.findOneAndUpdate({row:1}, {
	    	guid:num
	    }, {"upsert":true}, function(err,doc2){
	    	if(err || !doc) return cb(err);
	    	return cb(null, doc2);
	    }); 
	})

    
}

module.exports = mongoose.model('wxGuid', objSchema);