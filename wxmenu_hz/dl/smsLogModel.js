var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //评分流水表
    userId:{ type: String, required:true, index:true},  //使用短信的用户id
    mobileNumber:{type: Number, required:true, index:true},  //发出的手机号码
    smsCode:{type: String, required:true, index:true},  //短信校验码
    logIp:{type:String,default: '127.0.0.1'},            //用户要求发消息的流水ip
    type:{type: Number,default:1},                   //1表示未使用，2表示使用

    code1:{type:String,default: ''}, //备用字段
    code2:{type:String,default: ''}, //备用字段
    code3:{type:String,default: ''}, //备用字段
    code4:{type:String,default: ''}, //备用字段
    writeTime:{ type: Date,  index:true, default: function(){return Date.now()}}, //抽红包的世界
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
}

objSchema.statics.insertOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.create(obj,cb)
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

module.exports = mongoose.model('wxSmsLog', objSchema);