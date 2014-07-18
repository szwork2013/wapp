var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appName:{ type:String,required:true,unique:true},
      appEname:{ type:String,required:true,unique:true},
      appTelphone:{type:String,required:true},
      appCustomTel:{type:String,required:true},
      appPicture:{ type:String,required:true,default:''},
      appIntro:{ type:String,required:true,default:''},
      wxAppId:{type:String,required:true,default:''},  //微信的appid
      wxAppSecret:{type:String,required:true,default:''},  //微信的appsecret
      wxAppToken:{type:String,required:true,default:''},  //微信的 token
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


module.exports = mongoose.model('wxApp', objSchema);