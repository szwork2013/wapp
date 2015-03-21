var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{ type:String,required:true},
      token:{ type:String},
      ticket:{ type:String},
      type:{ type:String,required:true, default:'access_token'},//分两类 access_token 和 js_ticket
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findOneByObj = function(obj,cb){
	var obj = obj || {};
	return this.findOne(obj, function(err,doc){
    if(err) logger.error('DB error', err);
    cb(err,doc)
  });
}

objSchema.statics.findAll = function (obj,skip,pagesize,cb) { 
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

objSchema.statics.countAll = function (obj,cb) { 
       return this.count(obj, cb);
}

objSchema.statics.createOneOrUpdate = function (query, update, cb) { 
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
}

objSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}

objSchema.statics.destroyall = function (cb) { 
    return this.remove({}, cb); 
}


module.exports = mongoose.model('wxAccessToken', objSchema);