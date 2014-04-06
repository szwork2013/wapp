var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  row:{type:Number,default:1},
	  guid: {type:Number,required:true,default:100000},    //奖品的guid，从10W起
}

var objSchema = new Schema(obj);

objSchema.statics.getGuid = function (cb) { 
    return this.findOneAndUpdate({row:1}, {
    	$inc:{guid:1}
    }, {"upsert":true}, function(err,doc){
    	if(err || !doc) return cb(err);
    	cb(doc.guid);
    }); 
}

module.exports = mongoose.model('wxGuid', objSchema);